// Halifax scenario: campaign model, June 1941 to spring 1942.
// Method: the real campaign is the baseline. Each phase and sector carries its real losses, depth and duration.
// The scenario changes only what the premise changes (start date, Soviet alert and strength, German strength, the
// Luftwaffe, production, Lend-Lease, the Far East). Each change acts through a stated mechanism whose strength
// (an elasticity) is uncertain and drawn from a range; with every lever at its real value the model returns reality.
// Men in thousands; equipment in units; distances in km; areas in thousand km2.
(function (root) {
'use strict';

// ------------------------------------------------------------------ real baseline
// Soviet losses: Krivosheev (operations, quarters, 1941 totals). "mc" = missing and captured; Krivosheev's 1941 deaths
// (802k) run at about 0.6 of his sick and wounded, so deaths = 0.6 x san and mc = irr - deaths.
// pris = prisoners by the German count (claims). Equipment lost: Krivosheev by operation (some autumn/N figures estimated).
// Committed strengths: Krivosheev/Glantz (men), tank and aircraft holdings incl. reinforcements (approximate).
// German casualties: Halder (to 3 Jul 54.6k, 13 Aug 389.9k, 30 Sep 551.0k, 31 Dec 830.9k); tanks ~2,600 in the east
// in 1941; aircraft: Bekker by period. Depths along the main axis; areas from territory.py (real high-water 1941).
const REAL = {
  start: '1941-06-22', halt: '1941-12-05',
  sectors: ['N', 'C', 'S'],
  phase: {
    frontier: {
      N: { irr: 75.2, san: 13.3, pris: 35, tl: 2523, gl: 3561, al: 990, men: 440, tanks: 2700, air: 1200, days: 18, depth: 450 },
      C: { irr: 341.1, san: 76.7, pris: 324, tl: 4799, gl: 9427, al: 1777, men: 670, tanks: 6000, air: 2100, days: 18, depth: 450 },
      S: { irr: 172.3, san: 69.3, pris: 50, tl: 4381, gl: 5806, al: 1218, men: 865, tanks: 5800, air: 1900, days: 15, depth: 300 },
      ger: { cas: 80, tl: 390, al: 600 },
    },
    summer: {
      N: { irr: 214.1, san: 130.8, pris: 80, tl: 1492, gl: 9885, al: 1702, men: 517, tanks: 1800, air: 1500, days: 83, depth: 250 },   // Leningrad SDO, 10 Jul-30 Sep (incl. the September assault)
      C: { irr: 486.2, san: 273.8, pris: 450, tl: 1348, gl: 9290, al: 903, men: 900, tanks: 1700, air: 1000, days: 63, depth: 250 },
      S: { irr: 616.3, san: 84.2, pris: 770, tl: 411, gl: 28419, al: 343, men: 900, tanks: 700, air: 600, days: 82, depth: 400 },
      ger: { cas: 471, tl: 1170, al: 1000 },
    },
    autumn: {
      N: { irr: 22.7, san: 17.8, pris: 20, tl: 200, gl: 1000, al: 200, men: 136, tanks: 300, air: 300, days: 33, depth: 150 },   // Tikhvin SDO 16 Oct-18 Nov; equipment, prisoners, tanks, air estimated
      C: { irr: 514.3, san: 143.9, pris: 663, tl: 2785, gl: 3832, al: 293, men: 1250, tanks: 3000, air: 936, days: 65, depth: 300 },   // Moscow SDO 30 Sep-5 Dec
      S: { irr: 267.4, san: 56.9, pris: 250, tl: 400, gl: 8000, al: 500, men: 800, tanks: 400, air: 600, days: 52, depth: 300 },   // composite: Donbass-Rostov + Sumy-Kharkov + Crimea; equipment, prisoners estimated
      ger: { cas: 207, tl: 780, al: 489 },
    },
  },
  pauseAfterSummer: { N: 16, C: 20, S: 3 },
  // the rest of 22 Jun-5 Dec: other theatres, positional fighting, losses outside the operations counted above
  // (closing totals: Krivosheev's 1941 figures less the operations above and December; prisoners: German claims less those above)
  background: { irr: 278, san: 169, pris: 690, tl: 1560, gl: 20400, al: 9470 },
  // background aircraft: frontier losses on the ground outside the three operations (Soviet counts ~6,860 lost by 12 Jul against
  // 3,985 in the operations), combat losses elsewhere, and non-combat losses (estimated split)
  bgAir: { frontierGround: 2800, combat: 2700, nonCombat: 3970 },
  gerKmShare: 0.253,                 // Halder: killed and missing as a share of casualties (1941)
  dec: { sovIrr: 150, sovSan: 300, gerCas: 73, tl: 600, gl: 1500, al: 500 },   // 5-31 Dec (part of the winter)
  areaHigh: { N: 244, C: 522, S: 598 },       // thousand km2 taken at the 1941 high-water (territory.py)
  areaEnd41: 1287, areaApr42: 1212,           // real 31 Dec 1941; real ~1 May 1942
  winterRegainArea: { N: 42, C: 85, S: 24 },  // high-water to ~1 May 1942
  // autumn progress per day: dry, mud (10 Oct-15 Nov) and frost, relative to a dry day
  mud: { from: '1941-10-10', to: '1941-11-15', mudRate: 0.2, frostRate: 0.45 },
  autumnStart: { C: '1941-10-01', S: '1941-09-30' }, autumnHalt: { C: '1941-12-05', S: '1941-11-21' },   // the model's real clock
  // milestones: [sector, days into frontier phase, days into summer phase] (real)
  milestones: {
    Minsk: ['C', 6, 0], Smolensk: ['C', 18, 6], Kiev: ['S', 15, 74], Shlisselburg: ['N', 18, 60],
  },
  // stocks
  sov: { tanks0: 22600, tanksDec: 7540, tanksJan: 7700, air0: 20000, airDec: 11150, fieldDec: 4250, fieldMay: 5100,
         field: { frontier: 2900, summer: 3300, autumn: 3200 }, frontTanks: { summer: 4200, autumn: 3700 }, frontAir: { summer: 3100, autumn: 1836 },
         frontTanksDec: 1950, frontAirDec: 2400,   // field strengths, front holdings and the stocks below are approximate
         llTanksDec: 350, llAirDec: 600, llTanksMay: 1500, llAirMay: 1300,
         prodTanksDecApr: 6450, prodAirDecApr: 7100, tanksMay: 11840, frontTanksMay: 5500, frontAirMay: 3200 },
  // German shortfall and replacements (approximate; Halder: 323k replacements by 31 Aug; 1.1m by spring 1942); a share of the
  // shortfall is sickness and frost, which scales with men in the line and time, the rest with battle casualties
  ger: { men0: 3300, tanks0: 3600, shortfallDec: 400, replDec: 500, shortfallMay: 625, replMay: 1100, sickShare: 0.35,
         tankArrivalsDec: 900, tankArrivalsDecApr: 1400, tanksMay: 2800, lwMay: 2600 },   // tank arrivals, May stocks: estimated
  decShare: { gerTl: 0.34, sovAl: 0.17, gerAl: 0.15 },   // December's share of the winter's equipment losses (estimated)
  llTanksDecJan: 116, llFrontShare: 0.6,                  // British tanks arriving 5-31 Dec; share of Lend-Lease tanks at the front
  // winter, 5 Dec 1941-31 Mar 1942 (Krivosheev Q1 1942 plus December; Halder)
  winter: { sovCas: 2300, sovIrr: 825, gerCas: 350, gerKm: 105, pris: 150, sovTl: 3300, gerTl: 760, sovAl: 3000, gerAl: 859,
            strike: { men: 1100, tanks: 774, air: 1000 }, agc: { men: 1708, tanks: 1170, air: 615 },
            shoulderStart: { N: 77, S: 114 }, shoulderRegain: { N: 182, S: 197 } },   // km from Noginsk: Yakhroma 77 to Rzhev 259; Kashira 114 to Bolkhov 311
  // Typhoon (Oct 1941) as the analogue for a German offensive on Moscow
  typhoon: { gMen: 1929, gTanks: 1700, gAir: 1390, sMen: 1250, sTanks: 1000, sAir: 936, captureFrac: 0.53, closeDays: 7 },
};

// ------------------------------------------------------------------ levers (what the premise changes)
const LEVERS_REAL = {
  label: 'Reality', start: '1941-06-22', sovWest: 2900, readiness: 0, fighting: 0, gerMen: 3300, gerTanks: 3600, lw41: 1.0, lw42: 1.0,
  lendLease: true, farEastHeld: 0, gerProd41: 1.0, gerProd42: 1.0, gerEastShare: 1.0, replF: 1.0, lfl2Stays: false,
  sovProd42: 1.0, supplyBonus: 0, sovMobExtra: 0,
};
const LEVERS_SCEN = {
  label: 'Scenario', start: '1941-06-01', sovWest: 3700, readiness: 1, fighting: 0, gerMen: 3900, gerTanks: 3800, lw41: 1.5, lw42: 1.7,
  lendLease: false, farEastHeld: 0.5, gerProd41: 1.2, gerProd42: 1.4, gerEastShare: 1.15, replF: 1.25, lfl2Stays: true,
  sovProd42: 0.96, supplyBonus: 0.03, sovMobExtra: 0,
};

// ------------------------------------------------------------------ uncertain mechanisms: [low, high]
const PRIORS = {
  alpha: [0.3, 0.7],          // advance rate ~ (force ratio)^alpha
  beta: [0.3, 0.8],           // share of a pocket captured ~ (German sealing power / Soviet men)^beta
  zeta: [0.0, 0.5],           // a slower advance lets more men escape: prisoners ~ speed^zeta
  kappa: [0.5, 1.0],          // Soviet killed and wounded ~ (Soviet strength)^kappa
  mu: [0.3, 0.7],             // ... ~ (German combat power)^mu
  theta: [0.5, 1.0],          // ... ~ (duration)^theta
  phi: [0.2, 0.4],            // share of the men who escape a pocket who become casualties breaking out
  lambda: [0.05, 0.2],        // German losses fall with air support: ~ LW^-lambda
  nu: [0.3, 0.7],             // German losses rise with German men engaged: ~ (German men)^nu
  exposure: [0.4, 0.8],       // share of the extra Soviet men standing in the frontier battle zone
  carrySummer: [0.2, 0.5],    // the extra men still extra by July (the rest would have been mobilized anyway)
  carryAutumn: [0.0, 0.2],
  // the alert: readiness effects by phase (frontier, summer, autumn); by the autumn the real Red Army was mobilized too
  resist: [[0.6, 0.85], [0.85, 1.0], [1, 1]],         // advance speed multiplier
  leak: [[1.15, 1.6], [1.0, 1.25], [1, 1]],           // pockets leak: prisoners divided by this
  exch: [[1.15, 1.5], [1.0, 1.15], [1, 1]],           // German casualties per unit of Soviet fighting
  tankAdj: [[0.9, 1.1], [0.9, 1.05], [0.9, 1.05]],    // Soviet tank losses per tank engaged
  groundAir: [0.3, 0.6],      // frontier: Soviet aircraft lost on the ground, relative to reality
  airWar: [1.1, 1.4],         // frontier: a fortnight's air battle instead of a few days
  gunPocket: [0.5, 0.8],      // share of Soviet gun losses that come with pockets (rest with fighting)
  gamma: [0.4, 0.8],          // Soviet combat air losses ~ LW^gamma
  delta: [0.3, 0.7],          // German tank losses ~ (Soviet tanks engaged)^delta
  supplyDraw: [-0.03, 0.05],  // uncertainty in how far German supply reaches, added to the lever (floor 0)
  // winter and spring
  lfl2: [1.1, 1.3],           // Luftflotte 2 kept on the Moscow front in December, on top of the 1941 multiplier
  kappaW: [0.8, 1.5],         // winter ground regained ~ (Soviet strike / German defence)^kappaW
  feTransfer: [200, 300],     // men (k) the Far East sent west by December in reality
  feTanks: [150, 300],        // tanks from the Far East at the front in December in reality
  sigma: [0.35, 0.5],         // spring 1942: Soviet share of field forces on the Moscow axis
  phiG: [0.45, 0.6],          // German share of eastern men in the Moscow offensive
  phiT: [0.5, 0.65],          // ... of tanks
  phiA: [0.5, 0.65],          // ... of aircraft
  rate0: [20, 30],            // km/day of the panzer spearheads in a Typhoon-like breakthrough
  prepared: [0.35, 0.6],      // prepared defences of the Moscow zone slow the spearheads
  friction: [1.0, 1.3],
  dMax: [35, 60],             // days before the Moscow offensive culminates; a ring not closed by then is not closed
  depthOutside: [0.3, 0.6],   // share of the Moscow-axis forces inside the ring, relative to Vyazma
  reduceDays: [10, 20],       // days to reduce the pocket
  enterDays: [14, 30],        // days from closing the ring to entering Moscow
  redeployDays: [10, 25],     // days to move panzer and air units south for Blue
};

const mid = r => (r[0] + r[1]) / 2;
const draw = (r, u) => r[0] + (r[1] - r[0]) * u;
function sampleParams(rng) {
  const p = {};
  for (const [k, v] of Object.entries(PRIORS)) {
    if (Array.isArray(v[0])) p[k] = v.map(r => (rng ? draw(r, rng()) : mid(r)));
    else p[k] = rng ? draw(v, rng()) : mid(v);
  }
  return p;
}

// ------------------------------------------------------------------ helpers
const day = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 864e5;
const iso = d => new Date(d * 864e5).toISOString().slice(0, 10);
const PH = ['frontier', 'summer', 'autumn'];
const comp = (men, tanks, air, w) => Math.pow(men, w[0]) * Math.pow(tanks, w[1]) * Math.pow(air, w[2]);
const GW = [0.5, 0.25, 0.25], SW = [0.6, 0.2, 0.2];   // weights of men, tanks, aircraft in German and Soviet combat power

// progress of an autumn offensive from t0 to t1 at "rate" km per dry day, with mud and frost
function autumnDepth(t0, t1, rate) {
  const m0 = day(REAL.mud.from), m1 = day(REAL.mud.to);
  let d = 0;
  for (let t = t0; t < t1; t++) d += rate * (t < m0 ? 1 : t < m1 ? REAL.mud.mudRate : REAL.mud.frostRate);
  return d;
}
const sumPh = f => PH.reduce((a, ph) => a + f(REAL.phase[ph]), 0);

// ------------------------------------------------------------------ the model
function run(L, p) {
  const R = REAL, o = { levers: L.label };
  const t0 = day(L.start), tr0 = day(R.start);
  const A = (arr, i) => 1 + L.readiness * (arr[i] - 1);         // the alert's readiness effects, scaled by the lever (0 = none)
  const AX = (arr, i) => 1 + L.fighting * (arr[i] - 1);         // the alert's effect on German losses per Soviet soldier fighting
  const LW = L.lw41;
  const gerCasHaltR = sumPh(P => P.ger.cas), gerTlHaltR = sumPh(P => P.ger.tl);
  const tfHalt = (day(R.halt) - t0) / (day(R.halt) - tr0);      // length of the campaign relative to reality
  const gerMen0 = L.gerMen / R.ger.men0;
  // German net loss: battle part follows casualties, sick part follows men in the line and time
  const gerNet = (realNet, casRatio, tRatio) => realNet * ((1 - R.ger.sickShare) * casRatio + R.ger.sickShare * gerMen0 * tRatio);
  const supply = Math.max(0, L.supplyBonus + p.supplyDraw);
  // ---- 1941 phases
  let sovMenRatio, sovTankRatio = 1, sovAirRatio = 1, gerMenRatio = gerMen0, gerTankRatio = L.gerTanks / R.ger.tanks0;
  const extra0 = L.sovWest - 2900;
  let saved = 0, tankSaved = 0, airSaved = 0;                      // cumulative Soviet men/tanks/aircraft saved vs reality
  let gerCasCumR = 0, gerCasCumS = 0, gerTlR = 0, gerTlS = 0;
  const out = { sov: { irr: 0, san: 0, mc: 0, pris: 0, tl: 0, gl: 0, al: 0 }, ger: { cas: 0, km: 0, tl: 0, al: 0 } };
  const phaseOut = {}, capacity = {};
  const T = { N: t0, C: t0, S: t0 };                               // scenario clock per sector
  const depth = { N: 0, C: 0, S: 0 };
  const ms = {};                                                    // milestone dates
  const realDepthTotal = s => sumPh(P => P[s].depth);
  for (let i = 0; i < 3; i++) {
    const ph = PH[i], P = R.phase[ph];
    if (ph === 'frontier') sovMenRatio = 1 + p.exposure * extra0 / 2900;
    else {
      const carry = ph === 'summer' ? p.carrySummer : p.carryAutumn;
      sovMenRatio = (R.sov.field[ph] + extra0 * carry + saved + (ph === 'autumn' ? L.sovMobExtra : 0)) / R.sov.field[ph];
      sovTankRatio = Math.max(0.2, 1 + tankSaved / R.sov.frontTanks[ph]);
      sovAirRatio = Math.max(0.2, 1 + airSaved / R.sov.frontAir[ph]);
    }
    const G = comp(gerMenRatio, gerTankRatio, LW, GW), S = comp(sovMenRatio, sovTankRatio, sovAirRatio, SW);
    const FR = G / S;
    const speed = Math.pow(FR, p.alpha) * A(p.resist, i);
    const seal = gerMenRatio * Math.pow(LW, 0.3);
    const multP0 = Math.pow(sovMenRatio, 1 - p.beta) * Math.pow(seal, p.beta) * Math.pow(Math.min(speed, 1.5), p.zeta);   // no leak
    const multP = multP0 / A(p.leak, i);
    const po = { speed, FR, G, multP, sovMenRatio };
    let kwR = 0, kwS = 0;
    for (const s of R.sectors) {
      const x = P[s];
      let durS;
      const cap = realDepthTotal(s) * (1 + supply) - depth[s];
      if (ph !== 'autumn') {
        durS = x.days / speed;
        for (const [name, [sec, dF, dS]] of Object.entries(R.milestones)) {
          if (sec !== s) continue;
          if (ph === 'frontier' && dS === 0) ms[name] = T[s] + dF / speed;
          if (ph === 'summer' && dS > 0) ms[name] = T[s] + dS / speed;
        }
        T[s] += durS; depth[s] += x.depth;
        if (ph === 'frontier') ms['frontierEnd_' + s] = T[s];
        if (ph === 'summer') { ms['summerEnd_' + s] = T[s]; T[s] += R.pauseAfterSummer[s]; }
      } else if (s === 'N') {                          // Tikhvin: one operation; a faster one goes deeper
        durS = x.days / speed; ms.autumnStart_N = T[s];
        const want = x.depth * speed; capacity.N = depth[s] + want; depth[s] += Math.min(want, cap); T[s] += durS;
      } else {                                         // Typhoon and the Donbas: dry days, mud and frost to the halt
        const rs = day(R.autumnStart[s]), rh = day(R.autumnHalt[s]);
        const rateR = x.depth / autumnDepth(rs, rh, 1);
        const want = autumnDepth(T[s], rh, rateR * speed);
        ms['autumnStart_' + s] = T[s];
        durS = rh - T[s]; capacity[s] = depth[s] + want; depth[s] += Math.max(0, Math.min(want, cap));
      }
      const durRatio = Math.max(0.3, durS / x.days);
      // Soviet losses (Krivosheev basis)
      const deathsR = 0.6 * x.san, mcR = Math.max(0, x.irr - deathsR);
      const mc0 = mcR * multP0, mcS = mcR * multP;
      const kwF = Math.pow(sovMenRatio, p.kappa) * Math.pow(G, p.mu) * Math.pow(durRatio, p.theta);
      const esc = Math.max(0, mc0 - mcS) * p.phi;                    // escapers who become casualties breaking out
      const surplus = Math.max(0, mcS - mcR) * 0.3;                  // extra prisoners who would otherwise have been casualties
      const deathsS = Math.max(0, deathsR * kwF + 0.35 * (esc - surplus)), sanS = Math.max(0, x.san * kwF + 0.65 * (esc - surplus));
      kwR += deathsR + x.san; kwS += deathsS + sanS;
      const prisS = x.pris * multP;
      const tlS = Math.min(x.tl * sovTankRatio * A(p.tankAdj, i), x.tanks * sovTankRatio * 1.05);
      const glS = x.gl * (p.gunPocket * multP + (1 - p.gunPocket) * (deathsS + sanS) / (deathsR + x.san));
      const g = ph === 'frontier' ? 0.5 : 0.25;                       // share of operation air losses on the ground
      const gf = ph === 'frontier' ? A([p.groundAir], 0) : 1;
      const alS = x.al * (g * gf + (1 - g) * Math.pow(LW, p.gamma) * Math.pow(durRatio, 0.5)) * Math.pow(sovAirRatio, 0.3);
      tankSaved += x.tl - tlS;
      airSaved += x.al - alS;
      saved += 0.8 * ((mcR + deathsR) - (mcS + deathsS)) + 0.3 * (x.san - sanS);
      out.sov.irr += mcS + deathsS; out.sov.san += sanS; out.sov.mc += mcS; out.sov.pris += prisS;
      out.sov.tl += tlS; out.sov.gl += glS; out.sov.al += alS;
      po[s] = { durS, depth: depth[s], irr: mcS + deathsS, san: sanS, pris: prisS, tl: tlS, gl: glS, al: alS };
    }
    po.tot = R.sectors.reduce((a, s) => ({ irr: a.irr + po[s].irr, san: a.san + po[s].san, pris: a.pris + po[s].pris, tl: a.tl + po[s].tl }), { irr: 0, san: 0, pris: 0, tl: 0 });
    // German losses: 90 per cent follows the Soviet killed and wounded (which rise with German strength); 10 per cent with time
    const gR = P.ger.cas;
    const durPh = R.sectors.reduce((a, s) => a + po[s].durS / P[s].days, 0) / 3;
    const gS = gR * (0.9 * (kwS / kwR) * Math.pow(gerMenRatio, p.nu) * AX(p.exch, i) * Math.pow(LW, -p.lambda) + 0.1 * durPh);
    const gtlS = P.ger.tl * Math.pow(sovTankRatio, p.delta) * Math.sqrt(AX(p.exch, i)) * Math.sqrt(gerTankRatio) * Math.sqrt(Math.max(0.5, kwS / kwR));
    const galS = P.ger.al * LW * Math.pow(sovAirRatio, 0.5) * (ph === 'frontier' ? A([p.airWar], 0) : 1);
    out.ger.cas += gS; out.ger.tl += gtlS; out.ger.al += galS;
    gerCasCumR += gR; gerCasCumS += gS; gerTlR += P.ger.tl; gerTlS += gtlS;
    // German strength for the next phase
    const frac = gerCasCumR / gerCasHaltR;
    const netR = (R.ger.shortfallDec + R.ger.replDec) * frac, netS = gerNet(netR, gerCasCumS / gerCasCumR, tfHalt);
    gerMenRatio = (L.gerMen - netS + R.ger.replDec * frac * L.replF) / (R.ger.men0 - netR + R.ger.replDec * frac);
    const arrR = R.ger.tankArrivalsDec * frac, arrS = arrR * L.gerProd41 * L.gerEastShare;
    gerTankRatio = Math.max(0.2, (L.gerTanks - gerTlS + arrS) / (R.ger.tanks0 - gerTlR + arrR));
    Object.assign(po, { gerCas: gS, gerTl: gtlS, gerAl: galS, gerReal: gR });
    phaseOut[ph] = po;
  }
  // background (other theatres, positional fighting): scales with the length of the campaign and the mean effects
  const mP = (phaseOut.frontier.multP + phaseOut.summer.multP + phaseOut.autumn.multP) / 3;
  const B = R.background, BA = R.bgAir;
  const bMc = Math.max(0, B.irr - 0.6 * B.san);
  const bg = { irr: bMc * mP + 0.6 * B.san * tfHalt, san: B.san * tfHalt, pris: B.pris * mP, tl: B.tl * tfHalt,
               gl: B.gl * (0.5 * mP + 0.5 * tfHalt),
               al: BA.frontierGround * A([p.groundAir], 0) + BA.combat * Math.pow(LW, p.gamma) * Math.sqrt(tfHalt) + BA.nonCombat * tfHalt };
  out.sov.irr += bg.irr; out.sov.san += bg.san; out.sov.pris += bg.pris; out.sov.tl += bg.tl; out.sov.gl += bg.gl; out.sov.al += bg.al;
  saved += 0.8 * (B.irr - bg.irr) + 0.3 * (B.san - bg.san);
  tankSaved += B.tl - bg.tl; airSaved += B.al - bg.al;
  out.ger.km = out.ger.cas * R.gerKmShare;
  const area = {};
  let areaTot = 0;
  for (const s of R.sectors) { area[s] = R.areaHigh[s] * depth[s] / realDepthTotal(s); areaTot += area[s]; }
  o.y1941 = {
    sov: out.sov, ger: out.ger, ratioAll: (out.sov.irr + out.sov.san) / out.ger.cas, ratioIrr: out.sov.irr / out.ger.km,
    tankRatio: out.sov.tl / out.ger.tl, airRatio: out.sov.al / out.ger.al,
    depth, area, areaTot, supply,
    capacity: { C: capacity.C, S: capacity.S, N: capacity.N },     // depth the advance could have reached without the supply limit
    capBinds: (capacity.C > depth.C + 1 || capacity.S > depth.S + 1) ? 1 : 0,
    phases: phaseOut,
    dates: Object.fromEntries(Object.entries(ms).map(([k, v]) => [k, iso(Math.round(v))])),
  };
  // ---- stocks on 5 Dec
  const llT = L.lendLease ? 0 : R.sov.llTanksDec, llA = L.lendLease ? 0 : R.sov.llAirDec;
  const sovTanksDec = R.sov.tanksDec + tankSaved - llT;
  const sovAirDec = R.sov.airDec + airSaved - llA;
  const feMen = L.farEastHeld * p.feTransfer, feTanks = L.farEastHeld * p.feTanks;
  const sovFieldDec = R.sov.fieldDec + saved - feMen + L.sovMobExtra;
  // front tanks: the stock change without Lend-Lease scales the front share; the British tanks themselves went to the front
  const frontTanksDec = R.sov.frontTanksDec * (sovTanksDec + llT) / R.sov.tanksDec - R.llFrontShare * llT - feTanks;
  const frontAirDec = R.sov.frontAirDec * sovAirDec / R.sov.airDec;
  const netR = R.ger.shortfallDec + R.ger.replDec, netS = gerNet(netR, gerCasCumS / gerCasCumR, tfHalt);
  const gerMenDec = L.gerMen - netS + R.ger.replDec * L.replF, gerMenDecR = R.ger.men0 - netR + R.ger.replDec;
  const arrS = R.ger.tankArrivalsDec * L.gerProd41 * L.gerEastShare;
  const gerTanksDec = L.gerTanks - out.ger.tl + arrS, gerTanksDecR = R.ger.tanks0 - gerTlHaltR + R.ger.tankArrivalsDec;
  o.dec1941 = { sovField: sovFieldDec, sovTanks: sovTanksDec, sovFrontTanks: frontTanksDec, sovAir: sovAirDec, sovFrontAir: frontAirDec,
                gerMen: gerMenDec, gerTanks: gerTanksDec, saved, feMen };
  // ---- winter counter-offensive, 5 Dec-31 Mar
  const W = comp(sovFieldDec / R.sov.fieldDec, Math.max(0.1, frontTanksDec / R.sov.frontTanksDec), frontAirDec / R.sov.frontAirDec, SW);
  const lwW = L.lw41 * (L.lfl2Stays ? p.lfl2 : 1);
  const gMenW = gerMenDec / gerMenDecR;
  const D = comp(gMenW, Math.max(0.1, gerTanksDec / gerTanksDecR), lwW, GW);
  const Q = W / D, reg = Math.pow(Q, p.kappaW);
  const w = R.winter;
  const win = {
    W, D, Q, regainFactor: reg,
    strike: { men: w.strike.men * sovFieldDec / R.sov.fieldDec, tanks: w.strike.tanks * frontTanksDec / R.sov.frontTanksDec, air: w.strike.air * frontAirDec / R.sov.frontAirDec },
    sovCas: w.sovCas * Math.pow(W, 0.7) * Math.pow(D, 0.3),
    gerCas: w.gerCas * Math.pow(W, 0.8) * Math.sqrt(gMenW) * Math.pow(lwW, -0.1),     // more pressure and more men in the line: more losses
    pris: w.pris * Math.sqrt(D / W), sovTl: w.sovTl * (frontTanksDec / R.sov.frontTanksDec) * Math.pow(D, 0.3),
    gerTl: w.gerTl * Math.pow(W, 0.8), sovAl: w.sovAl * Math.sqrt(frontAirDec / R.sov.frontAirDec) * Math.sqrt(lwW), gerAl: w.gerAl * Math.pow(lwW, 0.7),
    regainArea: Object.values(R.winterRegainArea).reduce((a, b) => a + b, 0) * reg,
    shoulderN: w.shoulderStart.N + w.shoulderRegain.N * reg, shoulderS: w.shoulderStart.S + w.shoulderRegain.S * reg,
  };
  win.sovIrr = w.sovIrr * win.sovCas / w.sovCas; win.gerKm = w.gerKm * win.gerCas / w.gerCas;
  win.areaAfter = areaTot - win.regainArea;
  win.ratio = win.sovCas / win.gerCas;
  o.winter = win;
  // calendar 1941 (to 31 Dec): add December's share of the winter
  const fD = R.dec.sovIrr / w.sovIrr, fDs = (R.dec.sovIrr + R.dec.sovSan) / w.sovCas, fDg = R.dec.gerCas / w.gerCas, fT = R.dec.tl / w.sovTl;
  o.cal1941 = {
    sovIrr: out.sov.irr + win.sovIrr * fD, sovCas: out.sov.irr + out.sov.san + win.sovCas * fDs,
    gerCas: out.ger.cas + win.gerCas * fDg, gerKm: out.ger.km + win.gerKm * fDg,
    sovTl: out.sov.tl + win.sovTl * fT, gerTl: out.ger.tl + win.gerTl * R.decShare.gerTl,
    sovAl: out.sov.al + win.sovAl * R.decShare.sovAl, gerAl: out.ger.al + win.gerAl * R.decShare.gerAl,
    sovTanksJan: sovTanksDec + (R.sov.tanksJan - R.sov.tanksDec) - (win.sovTl - w.sovTl) * fT - (L.lendLease ? 0 : R.llTanksDecJan),
  };
  o.cal1941.ratioAll = o.cal1941.sovCas / o.cal1941.gerCas;
  // ---- 1 May 1942
  const savedW = 0.8 * (w.sovIrr - win.sovIrr) + 0.3 * ((w.sovCas - w.sovIrr) - (win.sovCas - win.sovIrr));
  const sovFieldMay = R.sov.fieldMay + saved + savedW - feMen + L.sovMobExtra;
  const llTM = L.lendLease ? 0 : R.sov.llTanksMay;
  const sovTanksMay = sovTanksDec + llT + R.sov.prodTanksDecApr * L.sovProd42 + (R.sov.llTanksMay - R.sov.llTanksDec) - llTM - win.sovTl;
  const sovFrontTanksMay = R.sov.frontTanksMay * (sovTanksMay + llTM) / R.sov.tanksMay - R.llFrontShare * llTM - feTanks;
  const llAM = L.lendLease ? 0 : R.sov.llAirMay;
  const airMayR = R.sov.airDec + R.sov.llAirMay - R.sov.llAirDec + R.sov.prodAirDecApr - w.sovAl;
  const airMayS = sovAirDec + llA + R.sov.prodAirDecApr * L.sovProd42 + (R.sov.llAirMay - R.sov.llAirDec) - llAM - win.sovAl;
  const sovFrontAirMay = R.sov.frontAirMay * airMayS / airMayR;
  const tfMay = (day('1942-05-01') - t0) / (day('1942-05-01') - tr0);
  const netRM = R.ger.shortfallMay + R.ger.replMay, cumR = gerCasHaltR + w.gerCas, cumS = gerCasCumS + win.gerCas;
  const gerMenMay = L.gerMen - gerNet(netRM, cumS / cumR, tfMay) + R.ger.replMay * L.replF, gerMenMayR = R.ger.men0 - R.ger.shortfallMay;
  const arrMay = (R.ger.tankArrivalsDec * L.gerProd41 + R.ger.tankArrivalsDecApr * L.gerProd42) * L.gerEastShare;
  const gerTanksMay = L.gerTanks - out.ger.tl - win.gerTl + arrMay;
  const lwMay = R.ger.lwMay * L.lw42;
  o.may1942 = { sovField: sovFieldMay, sovTanks: sovTanksMay, sovFrontTanks: sovFrontTanksMay, sovFrontAir: sovFrontAirMay,
                gerMen: gerMenMay, gerMenReal: gerMenMayR, gerTanks: gerTanksMay, gerTanksReal: R.ger.tanksMay, lwEast: lwMay };
  // ---- the Soviet spring offensive towards Kharkov (real: 765k men, ~1,200 tanks, ~900 aircraft; cut off at Izyum, ~240k prisoners)
  const khR = { men: 765, tanks: 1200, air: 900, pris: 240 };
  const kh = { men: khR.men * sovFieldMay / R.sov.fieldMay, tanks: khR.tanks * sovFrontTanksMay / R.sov.frontTanksMay, air: khR.air * sovFrontAirMay / R.sov.frontAirMay };
  const khS = kh.men / khR.men, khG = (gerMenMay / gerMenMayR) * Math.pow(L.lw42, 0.3);
  kh.pris = khR.pris * Math.pow(khS, 1 - p.beta) * Math.pow(khG, p.beta);
  o.kharkov = kh;
  // ---- the German offensive on Moscow (scenario event; for reality a what-if), succeeding only if the ring closes in time
  const ty = R.typhoon;
  const gM = { men: p.phiG * gerMenMay, tanks: p.phiT * gerTanksMay, air: p.phiA * lwMay };
  const sM = { men: p.sigma * sovFieldMay, tanks: p.sigma * sovFrontTanksMay, air: p.sigma * sovFrontAirMay };
  const FRM = comp(gM.men / ty.gMen, gM.tanks / ty.gTanks, gM.air / ty.gAir, GW) / comp(sM.men / ty.sMen, sM.tanks / ty.sTanks, sM.air / ty.sAir, SW);
  const rate = p.rate0 * Math.pow(FRM, p.alpha) * p.prepared;
  const dist = Math.max(win.shoulderN, win.shoulderS);
  const closeDays = dist / rate * p.friction;
  const success = closeDays <= p.dMax ? 1 : 0;
  const capture = ty.captureFrac * Math.pow(ty.closeDays / closeDays, 0.4) * p.depthOutside;
  const tStart = day('1942-05-20');
  o.moscow = {
    gM, sM, FR: FRM, rate, closeDays, success, distN: win.shoulderN, distS: win.shoulderS,
    prisoners: success ? sM.men * capture : 0,
    close: success ? iso(Math.round(tStart + closeDays)) : 'none',
    enter: success ? iso(Math.round(tStart + closeDays + p.enterDays)) : 'none',
    blueEarliest: success ? iso(Math.round(tStart + closeDays + p.reduceDays + p.redeployDays)) : 'none',
  };
  return o;
}

// ------------------------------------------------------------------ Monte Carlo
function rngFrom(seed) {             // mulberry32
  let a = seed >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function flatten(o, pre = '', acc = {}) {
  for (const [k, v] of Object.entries(o)) {
    if (v && typeof v === 'object') flatten(v, pre + k + '.', acc);
    else acc[pre + k] = v;
  }
  return acc;
}
// quantiles 10/50/90 (and the mean as a fourth entry); date outputs over the runs that have a date, with their share in key#share
function monteCarlo(L, n = 2000, seed = 1941) {
  const rng = rngFrom(seed), runs = [];
  for (let i = 0; i < n; i++) runs.push(flatten(run(L, sampleParams(rng))));
  const q = {}, keys = Object.keys(runs[0]);
  const pick = (a, f) => a[Math.min(a.length - 1, Math.floor(f * a.length))];
  for (const k of keys) {
    const v = runs[0][k];
    if (typeof v === 'number') {
      const a = runs.map(r => r[k]).sort((x, y) => x - y);
      q[k] = [pick(a, 0.1), pick(a, 0.5), pick(a, 0.9), a.reduce((s, x) => s + x, 0) / n];
    } else if (typeof v === 'string') {
      const a = runs.map(r => r[k]).filter(x => /^\d{4}-/.test(x)).map(day).sort((x, y) => x - y);
      q[k + '#share'] = [a.length / n];
      if (a.length) q[k] = [iso(pick(a, 0.1)), iso(pick(a, 0.5)), iso(pick(a, 0.9))];
    }
  }
  return q;
}

const M = { REAL, LEVERS_REAL, LEVERS_SCEN, PRIORS, sampleParams, run, monteCarlo, flatten, day, iso };
if (typeof module !== 'undefined' && module.exports) module.exports = M; else root.HalifaxModel = M;
})(typeof window !== 'undefined' ? window : globalThis);
