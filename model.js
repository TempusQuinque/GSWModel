
// Eastern Front, June 1941 to December 1942: a monthly model for the Halifax scenario (the 1941-42 edition, Version 77).
// Each month the model carries forward a few state variables (men, tanks and aircraft on each side; the German railheads and
// supply reach on each axis; the Soviet production base) and moves the front on three axes by a handful of mechanisms:
// pace from the force ratio, a supply reach that caps it, season, pockets, attrition, production and mobilization.
// Decisions are levers (where the Germans attack and when, how the Soviets stand). The constants are calibrated so that the
// real settings reproduce the real monthly front and the real losses of 1941 and 1942; the uncertain mechanisms are
// multipliers around that calibration, drawn from ranges in a Monte Carlo. Men in thousands; equipment in units; km.
// Version 73: combat experience (each army's leaders, seasoned men and learning, per man) in place of the cadre rule; the city battles'
// losses come off the 1941-42 strengths; the gold purchases bring no lorries or rail stock.
// Version 74 (the 1941-42 edition): the year 1943 left out; three more Soviet line choices for 1941 (Minsk; Dubno and the Stalin Line in
// the Ukraine; the Dnieper below Kiev); every line the Soviets choose to hold lasts longer or shorter with the balance of forces at the
// date it is reached, and the attacker pays for the time spent reducing it; the days each line held are reported.
// Version 75: the lines are manned (not at all, thinly, strongly) rather than held for a set number of weeks; they share one pool of second-echelon
// divisions; how long each holds is worked out from the men on it, the balance of forces and the German supply on the day it is reached; and each may
// give way early, its men then cut off. Four stops set all seven at once (None, Very plausible, Plausible, Possible).
// Version 76: the fuel at the front in 1942 is a lever of its own (fuel42), apart from 1941's (fuel), with an uncertain share of it reaching the front.
// Version 77: corrections from an audit: the second echelon no longer counted twice (start and inflow; quality; the line pool); the Soviet output lever
// from 1942; the alert's production relief for 1941's losses only; the alert's frontier effects for the first 40 days after the invasion.
(function (root) {
'use strict';

const MONTHS = ['1941-06', '1941-07', '1941-08', '1941-09', '1941-10', '1941-11', '1941-12', '1942-01', '1942-02', '1942-03',
  '1942-04', '1942-05', '1942-06', '1942-07', '1942-08', '1942-09', '1942-10', '1942-11', '1942-12'];
const AXES = ['N', 'C', 'S'];
const MILES = {   // km from the frontier of June 1941 along each axis (the model's own scale)
  N: [['Daugavpils', 300], ['Pskov', 520], ['Luga', 720], ['Shlisselburg', 850], ['Tikhvin', 950]],
  C: [['Minsk', 330], ['Smolensk', 640], ['Vyazma', 870], ['Moscow', 1080]],
  S: [['Kiev', 450], ['Kharkov', 750], ['Rostov', 1000], ['Voronezh', 1150], ['Stalingrad', 1500], ['Astrakhan', 1750]],
};
const CAUC = [['Maikop', 300], ['Mozdok', 540], ['Grozny', 650], ['Derbent', 800], ['Baku', 1000]];   // the Caucasus branch, km beyond Rostov

// ------------------------------------------------------------------ calibrated constants (the real war)
const K = {
  paceK: { N: 1191, C: 1018, S: 501 },    // km a month the spearheads make in open season at even force with supply to spare
  railRate: 240, lorryRange: 310, overrun: 130,
  // German advance season: weather and the exhaustion that came with it (1 = summer)
  season: { '1941-10': 0.529, '1941-11': 0.091, '1941-12': 0.03, '1942-01': 0.03, '1942-02': 0.03, '1942-03': 0.03, '1942-04': 0.1, '1942-05': 0.60,
            '1942-10': 0.10, '1942-11': 0.2, '1942-12': 0.05 },
  pockets: 0.484, pocket42: 0.5,
  donDays: 14,       // 1942: the battle in the great bend of the Don (the Kalach pocket, 26 July–8 Aug.) holds the Sixth Army at the Don before the Volga
  sOffWinter: 2.9,   // Soviet losses attacking in the winter and the thaw (Dec. 1941–Apr. 1942): frontal attacks over snow against dug-in defences; the real quarter cost 1.85m against some 450,000 German                          // prisoners (k) per thousand Soviet men, per 400 km of weighted advance, standing forward
  gCas: 142.5, sCas: 215.5,                   // casualties a month (k) per unit of the enemy's combat power at full intensity
  winterRegain: 15.0,                       // km a month the Soviet winter offensive regains on the Moscow axis at even strength
  sTank: { 1941: 0.223, 1942: 0.097 }, gTank: 0.169, gTankWinter: 0.57, sAir: { 1941: 0.200, 1942: 0.070 }, gAir: 0.141,
  stalX: 1.0, uranusX: 0.85,             // Stalingrad falls at 1.15 x the real pressure; Uranus breaks through at 0.85 x the real reserve ratio
  // share of pre-war production capacity lost with the territory in reality, by month (evacuation recovers part of it)
  lostReal: [0.05, 0.3, 0.42, 0.5, 0.55, 0.58, 0.6, 0.6, 0.6, 0.6, 0.58, 0.56, 0.55, 0.6, 0.65, 0.66, 0.66, 0.66, 0.64],
  donetsDays: 25, kievWdZ: 0.85, kievPrisZ: 0.3, kievPrisB: 0.6,   // Zhukov's withdrawal: Kleist's pace against the freed armies a further 0.85 (the prior p.kievWd on top), the pocket 0.3 of the real; Budyonny's: pace as the prior, the pocket 0.6
  mosOnlyX: 1.15, mosOnlyCulm: 1.3, mosOnlyAct: 0.6,   // Moscow alone in 1942: the south's panzer corps and air on the one axis (a third more set-piece power), and the attack allowed to run half as long again before it is spent
  kharkovX: 1.18, khDonets: 1.15,   // May 1942: the Soviet offensive at Kharkov succeeds at 1.18 × p.kharkovX [1.0, 1.5] = about 1.5 × the real power ratio (which failed, but Fridericus itself nearly did: Benbow), × 1.15 more easily from a continuous Donets front
  kharkovWin: { s: 120, g: 70 },      // a won Kharkov battle: the Soviets pay the offensive's own cost, the Germans the Sixth Army's lost divisions (Paulus's 'Fridericus' never happens)
  soltsy: 4,   // the Luga battle gains up to four days for Soltsy with the Dvina strongly held (the real counterattack, 14–18 July, cost Manstein most of a week)
  // Version 75: the Soviet defensive lines. Per line: req, the divisions it takes to man it strongly; H, the days it holds strongly manned against the real
  // balance of forces with the attacker's supply half spent (judgements, set against the real cases: the Dnieper in July 1941 about a week with half its
  // armies arrived, Korosten five weeks, the Kiev fortified region two months); q, the chance it gives way early (bridges taken intact, a flank turned, a
  // stand-fast order that makes it a pocket) without the alert and thinly manned
  lineDef: { dvina: { req: 10, H: 10, q: 0.35 }, velikaya: { req: 8, H: 10, q: 0.3 }, minsk: { req: 10, H: 8, q: 0.4 }, dvinaDnieper: { req: 25, H: 11, q: 0.25 },
             dubno: { req: 12, H: 12, q: 0.3 }, stalinLine: { req: 15, H: 16, q: 0.25 }, dnieperS: { req: 15, H: 15, q: 0.3 } },
  linePool: 57, linePoolX: 0.056,   // divisions free to man lines: the real second strategic echelon (some 57 divisions moving west in June 1941), plus a division for each
                                    // 18,000 Soviet men in the west beyond the real 2.9 million and the echelon itself (Version 77); half of it in place in time without the alert (in 1941 the reserve armies arrived piecemeal)
  echelon: 670, alertDays: 40, slowDays: 71,      // Version 77: thousands of men in the second echelon's armies (some 57 divisions): the first so many above the real 2.9 million in the west are
                                    // those armies brought forward, so they are taken off the July-September inflow, which carries them in the real war; the alert's frontier effects last 40 days
  lineDensE: 0.8,        // days ~ density^0.8: a thinly manned line holds about three-fifths as long
  lineSup: [1.1, 0.4],   // × (1.1 − 0.4 × the share of a full lorry reach the attacker has in hand on arrival): 0.7 with his supply in hand, 1.1 at the end of it
  lineFailAlert: 0.4,   // the early-failure chance: two-fifths less with the alert's prepared demolitions, and × (1.75 − density) within [0.75, 1.5]: a quarter less strongly manned, a quarter more at half strength, up to half again when thinner
  lineFailCut: [0.15, 0.45], lineFailPris: 1, lineFailDep: 0.3,   // a line that gives way early holds 15–45 per cent of its days, and its men are cut off: twice what a held line loses in killed and wounded on a broad front (0.5 × the pocket rate), as prisoners; it buys a later line three-tenths of the time a held one does
  lugaVel: 3,   // the Velikaya held: the divisions that fall back from it in order man the Luga Line, up to three more days there (a judgement)
  // Version 73: combat experience, in place of the cadre rule. Three measures per army, per man: ld, its leaders (the officers and NCOs, by number and
  // training: a fully staffed German army of 1940 = 1); sea, the share of seasoned men (those who have come through their first weeks in combat); inst,
  // the army's learning as an institution (doctrine, staff work, the handling of tanks, guns and aircraft together; 1 = June 1941). Fighting value per man
  // is ld^a × (1 + b·sea) × inst^c, taken relative to the real war's own path month by month, so the real settings are unchanged.
  // Leaders die faster than their men in the fighting (kF) and with them in the pockets; new formations get the schools' leaders (dens); seasoned men are
  // promoted into the gaps (promo × sea × the shortfall); green men die first (green) and a month's fighting seasons a share of those who survive it
  // (learn × the month's intensity); the institution learns from fighting (eta × intensity × the leaders kept, toward Imax). The men above the real June 1941
  // strengths come in at their source's quality: Soviet reservists at the 1941 schools' density, unblooded; German divisions from the West and the
  // occupation forces somewhat below the invasion army (ldX, seaX). surv: a less experienced army loses more men for the same enemy power.
  xp: { S: { ld0: 0.75, sea0: 0.05, dens: { 1941: 0.45, 1942: 0.55 }, kF: 1.6, promo: 0.08, qP: 0.8, seaIn: 0.05, Imax: 1.6, eta: 0.05, pool: false },
        G: { ld0: 1.0, sea0: 0.7, ldX: 0.9, seaX: 0.45, dens: { 1941: 0.85, 1942: 0.75 }, kF: 1.6, promo: 0.12, qP: 0.8, seaIn: 0.25, Imax: 1.1, eta: 0.02 },   // German replacements: men back from hospital and drafts trained behind the front in the field replacement battalions
        kPocket: 1.0, kSummer: 1.2, green: 1.5, learn: 0.25, surv: 0.3 },   // kSummer: the pockets of June–September 1941 took the first echelon's regular divisions, not the reservists still forming in the rear
  mechEff: 0.1, alertEvac: 0.4,   // the mechanized-corps choice: +10% fighting value in 1941; alert: the production loss weight and the capture fall by two-fifths at full alert (a planned evacuation, stockpiles)
  earlyDebit: 0.5,   // share of the extra first-month call-up (an invasion on 1 June) that is borrowed from 1942's inflow rather than additional: the pools existed, the training and equipment did not
  lostW: 0.5, capture: 0.6, captureFrom: 2, captureWeeks: 10, moscowInd: 0.07,   // capture: territory taken ahead of the real schedule counts up to 1.6 × (the half-weight becomes four-fifths: the plant did not get out), from a two-week lead to a ten-week one   // share of pre-war output lost with Moscow's factories (the region made about a fifth of Soviet industry, but much of it was evacuated east in the autumn of 1941)
  sEarly: 0.550, kievDays: 34.4, kievRed: 19.3, kievNoDiv: 1.6, kievWdPace: 0.75, lugaDays: 35.5, driveN: 0.147, driveFloor: 0.40,   // the south's slow start; the halt at the Luga Line (mid-July to 8 Aug. in reality); the share of the north's pace in the drive on Tikhvin
  seasonS: { '1941-10': 0.797, '1941-11': 0.499 },   // the south's mud came later and lighter
  capN: 950,                              // Leningrad is invested, not stormed: the northern axis ends at Tikhvin
  sCas42X: 3.200, gCas42X: 0.500,            // 1942: the Red Army attacked for much of the year, at its own cost
  cityLoss: {   // thousands, beyond the month's ordinary attrition; pris and kw Soviet (× relative Soviet strength^0.7), g German (× relative German strength^0.5)
    moscow: { pris: 350, kw: 175, g: 40 },        // a Kiev- or Vyazma-sized pocket round the capital (the article: 350,000 prisoners); the attacker's cost that of a month's set-piece battle
    moscowSpent: { pris: 30, kw: 100, g: 40 },    // a failed set-piece attack: the Germans lose about as much as in success, the defenders far less and almost no prisoners
    leningrad: { pris: 280, kw: 0, g: 5 },        // the garrison, starved, capitulates
    stalingrad: { pris: 40, kw: 30, g: 20 },      // the west bank cleared
    astrakhan: { pris: 25 }, grozny: { pris: 20 },
    kerch: { pris: 170, kw: 30, g: 8 }, sevastopol: { pris: 95, kw: 60, g: 25 } },   // the Crimea of 1942: Kerch (Trappenjagd, May) and the fall of Sevastopol (July)
  allies: { donShare: 0.4, pow: 0.07 }, mosFlank: 0.7,   // the Moscow salient's flanks in a Moscow-only year: German-held and close to the Centre's reserves, 0.7 of the army's power (v. 0.4 + allies 0.07 on the Don): Mars on a larger scale   // the Don flank in November 1942: four-tenths of the German army's power, plus the allied armies at 650,000 men × 0.35 worth / 3.3m = 0.07 of a German army
  uranusWin: { s: 320, g: 60 }, uranusFail: { s: 150, g: 0 },   // a counter-offensive that fails (Mars, Nov.–Dec. 1942, cost the Soviets some 215,000): its cost falls on the attacker, and the Germans are spared the losses of the encirclement   // thousands: a November counter-offensive that fails costs the Soviets, and spares the Germans the encirclement battles of December
  airSeason: { '1941-10': [0.5, 0.5], '1941-11': [0.5, 0.5], '1941-12': [0.4, 0.7], '1942-01': [0.4, 0.7], '1942-02': [0.4, 0.7], '1942-03': [0.6, 0.8], '1942-04': [0.5, 0.5], '1942-11': [0.6, 0.6], '1942-12': [0.4, 0.7] },   // [German, Soviet] share of the air arm's worth each month
  airDim: { move: 0.6, stand: 0.85 },   // diminishing returns on the Luftwaffe lever: lever^0.6 while the front moves (June–Sept. 1941, July–Aug. 1942), lever^0.85 when it stands
  goldFrom: 10, goldProd: 1.03,   // gold purchases through the Pacific: from April 1942 (orders of mid-1941), output ×1.03 (machine tools, aluminium, aviation spirit). Version 73: no
                                  // lorries or rail stock (until then pockets ×0.95 and the Don reserves ×1.03): the canon's cargoes are machine tools, aluminium, aviation spirit and
                                  // some grain, "little, and came late", and the real war, which the calibration follows, already had 22,000 Lend-Lease lorries by January 1943
  lineBattle: 25,
  kievPrisD: 0.6, kievWin: 21, lineG: 0.3,   // Version 74: the Dnieper below Kiev held (bridges blown, the Kremenchug, Dnepropetrovsk and Kakhovka crossings manned) takes
                                // the Kiev pocket's southern pincer: the southern advance of the three weeks after the Kiev line breaks (kievWin days) yields 0.6 of the
                                // pocket it would otherwise give (as without the northern pincer), in proportion up to two weeks of the line;
                                // the attacker reducing a line the Soviets chose to hold loses men at 1.3 x the month's rate on that axis for those days (a judgement:
                                // the factor the model gives the German losses when the Red Army attacks)   // km of advance-equivalent for the losses when a held line is broken on a broad front over a fortnight: killed and wounded, not prisoners (the line is given up in order)
  astrPace: 400, astrFlank: 0.1,   // the Astrakhan dash: km a month in dry weather for a motorized group; the share of the southern striking force it takes off the Don flank
  caucW: { '1942-10': 0.7, '1942-11': 0.3, '1942-12': 0.1 }, caucL: { '1942-10': 1, '1942-11': 0.5, '1942-12': 0.3 },   // lorry reach in the Caucasus by month   // the Caucasus' own weather once the branch has the south's whole effort
  caucShare: 0.75, caucGap: 650, caucGapX: 0.35,   // the Derbent gap beyond Grozny: the pace there is a set-piece attack's share of the open pace                        // share of the southern supply reach that the Caucasus branch can use
  mosDef41: { '1941-08': 0.25, '1941-09': 0.250, '1941-10': 0.119, '1941-11': 0.566 },   // Aug-Sep: the Reserve Front on the Rzhev-Vyazma line and Timoshenko's counter-attacks (not calibrated: the real Centre did not attack then)   // the Moscow defence zone and the reserve armies forming before the capital, by calendar month
  offFront: 0.26, mozhaisk: 930, offFront41: 0.220,   // the Mozhaisk line, km; the pace beyond it relative to open country                         // a set-piece offensive against a continuous front moves at this share of the open pace
  railLag42: 0.927, railRate42X: 1.663,       // the railways of 1942: the Dnieper bridges rebuilt and the Donbas network in use
  lorryMud: 0.450,                          // lorry reach in mud and snow, relative to summer
  railLag: 0.800,                          // the railheads follow at most this share of the front's depth in the first year                             // production falls by this share of the difference from the real territorial loss
};
const PROD = { sTanks41: 1100, sTanks42: 2050, sAir41: 1300, sAir42: 2100, sMen41: 844, sMen42: 459,
               gTanksE41: 123, gTanksE42: 136, gAir41: 250, gAir42: 300, /* aircraft to the east: enough to hold the strength near its June 1941 level, as in reality (2,770 in June 1941, about 2,750 in June 1942) */ gRepl41: 80, gRepl42: 95, gTanksRefit: 250 };
const START = { gMen: 3300, gTanks: 3600, gAir: 2800, sMen: 2900, sTanks: 22600, sAir: 20000 };

// ------------------------------------------------------------------ levers
const LEVERS_REAL = {
  label: 'Reality', start: '1941-06-22', gMen: 3300, gTanks: 3600, gAirX: 1.0, lorries: 1.0, fuel: 1.0, fuel42: 1.0, railX: 1.0,   // fuel: 1941; fuel42: 1942 (Version 76)
  sMen: 2900, alert: 0, aid: 'll', farEastHeld: 0, gProdX: 1.0, gReplX: 1.0, sProdX: 1.0,
  kievDiversion: true, moscowKm: 1080, moscow42: false, plan42: 'blue', moscowDef: 0.65, blueStart: '1942-07', supplyLimit: true, caucShare: 0.75, sEff: 1.0, ln_dvina: 0, ln_velikaya: 0, ln_minsk: 0, ln_dvinaDnieper: 0, ln_dubno: 0, ln_stalinLine: 0, ln_dnieperS: 0,   // Version 75: the lines, manned 0 / 0.5 / 1   // share of the south's supply reach given to the Caucasus (Directive No. 45 split the effort)
  // plan42: 'blue' (the south only, as in reality) | 'moscow' (Moscow only, the whole striking power on one axis) | 'moscowBlue' (Moscow first, then the south: the article)
  stavka41: 'south', stavka42: 'moscow',     // where the Stavka keeps its weight: 1941 the Kiev group of fronts (as in reality), 1942 before Moscow (as in reality)
  sovDepth: false, mechCorps: false, kievWithdraw: 'none', winterLimited: false, noKharkov: false,   // kievWithdraw: 'none' | 'zhukov' (late July: West Kiev given up, the freed armies block Guderian and Kleist) | 'budyonny' (11 Sept.: late, half the armies get away)
};
const LEVERS_SCEN = Object.assign({}, LEVERS_REAL, {
  label: 'Scenario', start: '1941-06-01', gMen: 3900, gTanks: 3800, gAirX: 1.5, lorries: 1.1, fuel: 1.05, fuel42: 1.2, railX: 1.0,   // net of what the extra divisions and aircraft consume
  // Version 76, fuel42: in 1941 the limit at the front was the railways and the lorry columns rather than the oil in the Reich (fuel 1.05); by 1942 the real
  // shortage was absolute (stocks below 800,000 tons at the end of 1941, motor fuel consumption a sixth lower in 1942, Army Group A halted for petrol in the
  // Caucasus), which a Germany trading freely overseas, the Netherlands Indies answering to The Hague, largely escapes: about a fifth more at the front, net of the extra
  // divisions, which restores the consumption of 1941 (2,504,000 tons of motor gasoline in 1941 against 2,089,000 in 1942); the single railway through Rostov is why not more
  sMen: 3700, alert: 1, aid: 'gold', farEastHeld: 0.5,   // canon (2 Nov. 2026): purchases in the neutral United States, paid in gold, carried in Soviet ships to Vladivostok
  gProdX: 1.3, gReplX: 1.25, sProdX: 0.96,   // Version 75: no lines beyond the real (the week on the Dvina of Versions 68–74 dropped: the user's choice of 'None')
  kievDiversion: true, moscow42: true, plan42: 'moscowBlue', moscowDef: 0.65, blueStart: '1942-07', caucShare: 0.75,   // Version 77: the real share; with the corrections it gives Grozny about the article's 24 Sept. (median 2 Oct.; 0.85 had been needed before)
});

// ------------------------------------------------------------------ uncertain mechanisms, [low, high]: multipliers around the calibration
// each acts only on departures from the real war, so the real settings always return the calibrated real run
const PRIORS = {
  mudOct: [0.7, 1.3], mudNov: [0.7, 1.3], thaw: [0.7, 1.3],   // weather: how much of October and November 1941 and of the 1942 spring was lost to mud (1 = as it was)
  reserveE: [0.5, 1.0],       // how much a shift of Soviet weight between axes tells on the pace and on a set-piece attack there
  alpha: [0.1, 0.5],
  alphaSet: [0.5, 0.9],       // ... and in a set-piece attack on a held front (Moscow beyond the Mozhaisk line; the 1942 attack), around 0.7        // pace ~ (force ratio)^alpha, around the calibrated 0.3: in open country the spearheads move as supply allows
  mosRes: [0.6, 1.4],         // the Soviet reserve armies before Moscow respond to Soviet strength more or less than calibrated
  railE: [0.7, 1.3],          // railhead rate ~ (rail lever)^railE
  lorryE: [0.7, 1.3],         // lorry reach ~ (lorries and fuel against consumption)^lorryE
  pocketE: [0.5, 1.5],        // pockets ~ (German sealing, Soviet posture, the alert's leakage)^pocketE
  exchD: [-0.4, 0.4],         // Soviet losses respond to German power more or less than calibrated
  gExchD: [-0.4, 0.4],        // German losses respond to Soviet power more or less than calibrated
  alertPace: [0.6, 0.85], alertLeak: [1.15, 1.6], alertAir: [0.4, 0.7], alertSummer: [0.8, 1.0],
  railTime: [0.3, 0.7],       // share of the earlier start's extra weeks that the railhead conversion can use   // the alert: the first two months, and the depth behind them in August and September
  winterD: [-0.5, 0.6],       // winter regain responds to the strength ratio more or less than calibrated
  defX: [0.8, 1.2],         // strength of the Moscow defences, relative to the slider
  stalX: [0.85, 1.35],        // pressure needed at Stalingrad, relative to the real; below 1 the city would have fallen even in reality          // pressure needed at Stalingrad, relative to the real (which did not suffice)
  uranusX: [0.75, 1.3],      // reserve ratio needed for the November counter-offensive, relative to the real (which sufficed)
  culm: [1.0, 2.0],
  blueRecover: [2, 6],        // weeks before Blue can open after a failed Moscow attack: the panzer corps moved south and refitted
  blueWear: [0.1, 0.3],       // Blue's loss of strength in its first two months after a failed Moscow attack
  astr: [0.7, 1.3],           // the dash for Astrakhan after Stalingrad: pace of the motorized group across the Kalmyk steppe, relative to the calibrated
  steppeNov: [0.4, 0.8],      // November on the steppe: how much of the lorry reach and pace survive the rains and the first frost
  hub: [0.5, 0.8],            // Moscow as the railway hub: the share of the Stavka's capacity to move reserves between theatres that survives its fall (eleven trunk lines met there; the Volga bypass lines were fewer and slower); half the loss made good over a year
  tikhvin: [0.8, 1.0],        // Soviet strength ratio, relative to the real, needed to retake Tikhvin in December
  luga: [0.8, 1.2],           // the halt at the Luga Line, relative to the real
  lugaRes: [0.3, 0.9],        // how much the Luga halt lengthens with Soviet strength at the date the line is reached (the Luga Line held by divisions in order rather than militia)
  siege: [2.5, 4.5],              // months without the Ladoga route before Leningrad capitulates
  keep: [0.4, 1.0],           // share of an earlier Smolensk that an earlier Typhoon keeps (the Centre's recovery takes the rest)
  donets: [0.6, 1.4],         // the Psel–Donets stand before Kharkov, relative to the calibrated 18 days (11–25 days)
  kharkovX: [1.0, 1.5],      // margin over the real ratio for a Soviet victory at Kharkov in May 1942
  khDelay: [4, 8],           // weeks a lost Kharkov battle delays Blue
  kievWd: [0.65, 0.85],       // pace against the withdrawn, intact South-Western Front, Kleist's whole group driving east: at 0.65 Rostov is not reached in 1941, at 0.85 it is had on the real date
  kievDelay: [2, 4],          // weeks the Kiev diversion delays Typhoon (the Centre needed the rest of the time to recover anyway)
  flankCost: [0.15, 0.35],    // without Kiev: share of the Centre's strength held back to cover the uncovered southern flank           // months of effort before an offensive on Moscow is spent
};
// Version 73: how much each measure of experience tells on fighting value, from a stream of its own (seed x 13 + 73, as in Version 73) so that every other draw is as before
// Version 75: the lines, from a stream of their own (seed × 17 + 75), so every earlier draw is unchanged; the early-failure draws (lf_, lc_) come from it too
const PRIORSL = {
  lineE: [0.75, 1.25],        // how long manned lines hold, relative to the judgements in K.lineDef
};
// Version 76: the oil of 1942, from a stream of its own (seed × 19 + 76), so every earlier draw is unchanged
const PRIORSF = {
  oil42: [0.4, 1.6],          // multiplier on the 1942 fuel lever's gain over 1941's (or over the real, if 1941's is below it): how much reaches the front (foreign exchange, tankers, American policy, the railways east)
};
const LINE_KEYS = ['dvina', 'velikaya', 'minsk', 'dvinaDnieper', 'dubno', 'stalinLine', 'dnieperS'];
const LINE_STOPS = [   // the interface's one control: how far the Soviets prepare and man lines in 1941 (0 not manned, 0.5 thinly, 1 strongly)
  ['None', { dvina: 0, velikaya: 0, minsk: 0, dvinaDnieper: 0, dubno: 0, stalinLine: 0, dnieperS: 0 }],
  ['Very plausible', { dvina: 0.5, velikaya: 0, minsk: 0, dvinaDnieper: 1, dubno: 0, stalinLine: 0.5, dnieperS: 0 }],
  ['Plausible', { dvina: 1, velikaya: 0.5, minsk: 0.5, dvinaDnieper: 1, dubno: 0.5, stalinLine: 1, dnieperS: 0.5 }],
  ['Possible', { dvina: 1, velikaya: 1, minsk: 1, dvinaDnieper: 1, dubno: 1, stalinLine: 1, dnieperS: 1 }]];
const PRIORSX = {
  xpLead: [0.3, 0.6],         // fighting value ~ leaders^xpLead: the officers and NCOs, the larger effect
  xpSea: [0.15, 0.35],        // ... × (1 + xpSea × the seasoned share): a wholly seasoned army is worth 1.15–1.35 × a green one with the same leaders
  xpInst: [0.6, 1.0],         // ... × inst^xpInst: how much of the institution's learning reaches the fighting units
};
const mid = r => (r[0] + r[1]) / 2;
function sampleParams(rng, rngX, rngL, rngF) { const p = {}; for (const [k, v] of Object.entries(PRIORS)) p[k] = rng ? v[0] + (v[1] - v[0]) * rng() : mid(v);
  for (const [k, v] of Object.entries(PRIORSF)) p[k] = rngF ? v[0] + (v[1] - v[0]) * rngF() : mid(v);
  for (const [k, v] of Object.entries(PRIORSX)) p[k] = rngX ? v[0] + (v[1] - v[0]) * rngX() : mid(v);
  for (const [k, v] of Object.entries(PRIORSL)) p[k] = rngL ? v[0] + (v[1] - v[0]) * rngL() : mid(v);
  for (const k of LINE_KEYS) { p['lf_' + k] = rngL ? rngL() : 0.5; p['lc_' + k] = rngL ? rngL() : 0.5; } return p; }   // without the streams: mid-range (no line gives way early)

// ------------------------------------------------------------------ helpers
const comp = (men, tanks, air, w) => Math.pow(men, w[0]) * Math.pow(tanks, w[1]) * Math.pow(air, w[2]);
const GWT = [0.5, 0.25, 0.25], SWT = [0.6, 0.2, 0.2];
const monthDays = m => new Date(Date.UTC(+m.slice(0, 4), +m.slice(5, 7), 0)).getUTCDate();
const dateIn = (m, frac) => `${m}-${String(Math.max(1, Math.min(monthDays(m), Math.round(frac * monthDays(m))))).padStart(2, '0')}`;
let REF = null;   // the real run's monthly trajectory and end-state references, set once by setRef()
const dev = (v, ref, e) => (REF && ref > 0) ? Math.pow(v / ref, e) : 1;

// ------------------------------------------------------------------ the model
function run(L, p) {
  const o = { levers: L.label, months: [] };
  const TR = { xp: [], xS: [], xG: [], city: [] }; Object.defineProperty(o, 'track', { value: TR, enumerable: false });   // per-month experience and city battles, outside the flattened output
  // more aircraft in the east give less than their number: forward airfields, fuel transport and ground crews set the sortie rate, not airframes.
  // G.air counts airframes; what they are worth each month is airframes × gAirX^(dim−1), with dim = K.airDim.move while the front is moving (the
  // ground organization lags the panzers) and K.airDim.stand when it stands (sieges, the winter: the airfields have caught up)
  const MOVING = new Set(['1941-06', '1941-07', '1941-08', '1941-09', '1942-07', '1942-08']);
  const airUse = m => Math.pow(L.gAirX, (MOVING.has(m) ? K.airDim.move : K.airDim.stand) - 1);
  let G = { men: L.gMen, tanks: L.gTanks, air: START.gAir * L.gAirX };
  let S = { men: L.sMen, tanks: START.sTanks, air: START.sAir };
  const depth = { N: 0, C: 0, S: 0 }, rail = { N: 0, C: 0, S: 0 }, reach = { N: 0, C: 0, S: 0 };
  const ev = {};
  // ---- combat experience (Version 73): leaders, seasoned men and learning, per man, for each army
  const mixQ = (n0, n, a, b) => n <= n0 ? a : (a * n0 + b * (n - n0)) / n;   // the men above the real June 1941 strength at their source's quality
  const sPool = K.xp.S.pool ? Math.max(0, L.sMen - START.sMen) * (K.xp.S.ld0 - K.xp.S.dens[1941]) / (PROD.sMen41 * 6.3) : 0;   // (a variant, off: the extra Soviet men are the interior's cadre formations moved west, and their cadres are missing from 1941's new formations)
  const ech = Math.min(K.echelon, Math.max(0, L.sMen - START.sMen));   // Version 77: the men above the real who are the second echelon's armies brought forward (regular formations)
  const echIn = t => (t === 1 ? 0.6 : t === 2 ? 0.4 : 0) * ech;   // ... which in the real inflow arrived in July and August
  let XP = { S: { ld: mixQ(START.sMen + ech, L.sMen, K.xp.S.ld0, K.xp.S.pool ? K.xp.S.ld0 : K.xp.S.dens[1941]), sea: mixQ(START.sMen + ech, L.sMen, K.xp.S.sea0, 0), inst: 1 },
             G: { ld: mixQ(START.gMen, L.gMen, K.xp.G.ld0, K.xp.G.ldX), sea: mixQ(START.gMen, L.gMen, K.xp.G.sea0, K.xp.G.seaX), inst: 1 } };
  const xpF = (x, r) => !r ? 1 : Math.pow(x.ld / r.ld, p.xpLead) * (1 + p.xpSea * x.sea) / (1 + p.xpSea * r.sea) * Math.pow(x.inst / r.inst, p.xpInst);
  // a month's step: men0 at the start; fight, the men lost in the fighting (killed and long-term wounded, missing); pocket, prisoners; neut, the sick
  // (taken in proportion); inflow, the new men; men1, the strength at the month's end; act, the month's intensity
  const xpStep = (sd, x, men0, fight, pocket, neut, inflow, men1, act, yr, kp = K.xp.kPocket, pr = 1, ldd = 0) => {   // ldd: leaders taken off the inflow (Version 77)   // pr 0: a loss-only step inside a month that has had its own (no second month of promotion)
    const c = K.xp[sd], X = K.xp; inflow = Math.max(0, inflow); men1 = Math.max(1, men1);
    const ldN = x.ld * Math.max(0, men0 - c.kF * fight - kp * pocket - neut) + (c.dens[yr] - (sd === 'S' && yr === 1941 ? sPool : 0)) * inflow - ldd + pr * c.qP * c.promo * x.sea * men0 * Math.max(0, 1 - x.ld);
    const sw = x.sea / Math.max(1e-9, x.sea + X.green * (1 - x.sea));   // the seasoned share of the fighting losses: the green die first
    const seaN = Math.max(0, x.sea * men0 - sw * fight - x.sea * (kp * pocket + neut)), grN = Math.max(0, men0 - fight - pocket - neut - seaN);
    const sea = Math.min(0.95, (seaN + X.learn * act * grN + c.seaIn * inflow) / men1);
    const inst = x.inst + c.eta * act * (x.ld / c.ld0) * x.sea * (c.Imax - x.inst);   // learning needs commanders who have fought and lived
    return { ld: Math.min(1.1, ldN / men1), sea, inst };
  };
  const tot = { 1941: { sCas: 0, sIrr: 0, pris: 0, sTl: 0, sAl: 0, gCas: 0, gTl: 0, gAl: 0 }, 1942: { sCas: 0, sIrr: 0, pris: 0, sTl: 0, sAl: 0, gCas: 0, gTl: 0, gAl: 0 } };
  // supply: lorries and fuel extend the reach; more divisions and aircraft eat into it
  // Version 76: the fuel of 1942 apart (fuel42; its gain over 1941's, or over the real if 1941's is below it, is multiplied by an uncertain p.oil42); lorryIdx is set each month to its year's
  const f42 = L.fuel42 != null ? L.fuel42 : L.fuel, f0 = Math.max(1, L.fuel), fuel42 = f42 > f0 ? f0 + (f42 - f0) * (p.oil42 != null ? p.oil42 : 1) : f42;   // only a gain over both 1941's and the real is uncertain; at or below either, it is taken as it is (so the real 1942 value is never moved)
  const lorryIdxY = f => Math.pow(Math.pow(L.lorries, 0.5) * Math.pow(Math.max(0.05, f), 0.3) , p.lorryE);   // the reach is set by railheads and roads; a division brings its own transport, so more divisions do not shorten it
  const lorryIdx41 = lorryIdxY(L.fuel), lorryIdx42 = lorryIdxY(fuel42);
  let lorryIdx = lorryIdx41;
  const railIdx = Math.pow(L.railX, p.railE);
  const startFrac = L.start === '1941-06-01' ? 1.0 : 0.3;
  const plan = L.plan42 || (L.moscow42 ? 'moscowBlue' : 'blue'), mosAttack = plan !== 'blue', mosOnly = plan === 'moscow';   // the German plan for 1942
  const kw = L.kievWithdraw === true ? 'zhukov' : (L.kievWithdraw || 'none'), kwZ = kw === 'zhukov', kwB = kw === 'budyonny', kwAny = kwZ || kwB;   // the Kiev withdrawal: Zhukov's proposal (29 July) or Budyonny's (11 Sept.)
  // an earlier invasion calls the same pools of men up earlier: the extra weeks of 1941-rate inflow in the first month are debited from 1942's, on both sides
  const earlyS = K.earlyDebit * PROD.sMen41 * Math.max(0, startFrac - 0.3) / 12, earlyG = K.earlyDebit * PROD.gRepl41 * L.gReplX * Math.max(0, startFrac - 0.3) / 12;
  const hubAt = mm => { if (!ev.Moscow || ev.Moscow > mm + '-31') return 1; const since = (day(mm + '-15') - day(ev.Moscow)) / 30.4; return 1 - (1 - p.hub) * (1 - 0.5 * Math.min(1, Math.max(0, since) / 12)); };
  let astrOn = false;   // the Astrakhan dash launched (it thins the Don flank)
  // Lines: time lost on an axis. Each line: km, days held, days of reduction at half pace after it, and the pocket-equivalent of the troops destroyed
  // when it breaks (killed and wounded on a broad front, not prisoners). The calibrated lines are the real war's: the Luga halt (the German pause for
  // infantry and railheads, mid-July to 8 August, lengthened or shortened by the Red Army's strength at that date to the power p.lugaRes), the South's
  // wait on the Dnieper at Kiev for the pocket to close, and the Don in 1942. The rest are Soviet choices, none of them held in reality:
  //   N  the Dvina (300 km) and the Velikaya, the Stalin Line at Ostrov and Pskov (520): stripped of guns and garrisons in 1940, it is manned only as far as
  //      the Dvina buys the time; a strongly held Dvina makes the Soltsy counterattack cost Manstein up to four more days
  //   C  the Minsk fortified region on the old frontier (330 km; Minsk falls when it gives way) and the Dvina–Dnieper, Vitebsk–Orsha–Mogilev (500)
  //   S  Dubno–Rovno (150 km), the Stalin Line in the Ukraine, Novograd-Volynsky–Shepetovka–Letichev (280), and the Dnieper below Kiev, which lengthens the
  //      wait at Kiev and takes the pocket's southern pincer (below); it is held only as far as the stand at Dubno or on the Stalin Line kept the armies of
  //      the south out of the Uman pocket, and not with a Kiev withdrawal (Zhukov's gives the Dnieper up, Budyonny's comes when Kleist is already across)
  // Version 75: each is manned not at all, thinly or strongly (ln_<line>: 0, 0.5, 1), from one pool of second-echelon divisions (K.linePool, the real second
  // echelon, plus K.linePoolX for each thousand Soviet men in the west above the real; half of it in place in time without the alert); if the lines chosen need more than the pool,
  // every line is thinned in proportion. Its days, worked out on the day it is reached: K.lineDef.H × p.lineE × density^0.8, × the balance of forces (a
  // held line is a set-piece attack for the Germans, so the inverse of its pace: the Soviet/German power ratio relative to the real war's that month to
  // p.alphaSet, and the Stavka's weight on the axis to p.reserveE, between 0.4 and 2.5 times), × the attacker's supply (0.7 with a full lorry reach in
  // hand, 1.1 at the end of it). With chance q (two-fifths less with the alert's prepared demolitions; less strongly manned, more thinly) it gives way
  // early, after 15–45 per cent of those days, and its men are cut off rather than withdrawn. The days come on top of what the real lines held, which is in the
  // calibrated run. On the roads to Leningrad and Moscow the spearheads reach the lines at the end of their supply; in the south, with it in hand.
  let Rrel = 1, wgtNow = () => 1;   // set each month in the loop
  const man = {}; for (const k of LINE_KEYS) man[k] = Math.max(0, Math.min(1, +(L['ln_' + k] || 0)));
  if (kwAny) man.dnieperS = 0;
  const linePool = (K.linePool + K.linePoolX * Math.max(0, L.sMen - START.sMen - ech)) * (0.5 + 0.5 * Math.min(1, L.alert || 0));   // Version 77: the echelon is not counted twice
  const lineNeed = LINE_KEYS.reduce((acc, k) => acc + man[k] * K.lineDef[k].req, 0), lineThin = lineNeed > linePool ? linePool / lineNeed : 1;
  const dens = {}; for (const k of LINE_KEYS) dens[k] = man[k] * lineThin;
  const lineFail = {}, failNow = k => { const q = K.lineDef[k].q * (1 - K.lineFailAlert * Math.min(1, L.alert || 0)) * Math.max(0.75, Math.min(1.5, 1.75 - dens[k])); lineFail[k] = dens[k] > 0 && p['lf_' + k] != null && p['lf_' + k] < q; };
  const bought = k => dens[k] * (lineFail[k] ? K.lineFailDep : 1);   // the time a line buys for the next: less if it gave way early
  for (const k of ['dvina', 'minsk', 'dvinaDnieper', 'dubno', 'stalinLine']) failNow(k);
  dens.velikaya *= 0.6 + 0.4 * Math.min(1, bought('dvina') / 0.5);                                // the Velikaya manned as far as the Dvina buys the time
  dens.dnieperS *= 0.6 + 0.4 * Math.min(1, Math.max(bought('dubno'), bought('stalinLine')) / 0.5); // the Dnieper below Kiev with the armies kept out of the Uman pocket
  failNow('velikaya'); failNow('dnieperS');
  const lineDays = (a, k, room) => {   // a line's days on the day it is reached; room: the attacker's supply reach left beyond the line
    if (dens[k] <= 0) return 0;
    const sc = Math.min(2.5, Math.max(0.4, Math.pow(Rrel, p.alphaSet) * Math.pow(wgtNow(a), p.reserveE)));
    const sup = K.lineSup[0] - K.lineSup[1] * (L.supplyLimit ? Math.max(0, Math.min(1, (room || 0) / (K.lorryRange * lorryIdx))) : 1);   // with no supply limit the attacker always has it in hand
    const cut = lineFail[k] ? K.lineFailCut[0] + (K.lineFailCut[1] - K.lineFailCut[0]) * (p['lc_' + k] != null ? p['lc_' + k] : 0.5) : 1;
    return K.lineDef[k].H * (p.lineE || 1) * Math.pow(dens[k], K.lineDensE) * sc * sup * cut; };
  const kievBase = K.kievDays * (L.kievDiversion ? 1 : K.kievNoDiv) * (kwZ ? 0.5 : kwB ? 0.85 : 1);
  const on1 = k => dens[k] > 0 ? 1 : 0;   // a placeholder hold until the line is reached (a line with hold 0 is skipped)
  const LINES = { N: [{ km: 300, hold: on1('dvina'), holdFn: (t, h, r) => lineDays('N', 'dvina', r), red: 7, eq: K.lineBattle / 2, user: 'dvina' },
      { km: 520, hold: on1('velikaya'), holdFn: (t, h, r) => lineDays('N', 'velikaya', r), red: 7, eq: K.lineBattle / 2, late: true, user: 'velikaya' },
      { km: 720, hold: K.lugaDays * p.luga, holdFn: t => K.lugaDays * p.luga * dev(S.men, REF && REF.sMen[t], p.lugaRes) + K.soltsy * Math.min(1, dens.dvina) * (lineFail.dvina ? 0 : 1) + K.lugaVel * Math.min(1, dens.velikaya) * (lineFail.velikaya ? 0 : 1), red: 14, eq: 0 }],   // Soltsy only if the Dvina held; the Velikaya's divisions on the Luga
    C: [{ km: 330, hold: on1('minsk'), holdFn: (t, h, r) => lineDays('C', 'minsk', r), red: 7, eq: K.lineBattle / 2, late: true, user: 'minsk' },
      { km: 500, hold: on1('dvinaDnieper'), holdFn: (t, h, r) => lineDays('C', 'dvinaDnieper', r), red: 14, eq: K.lineBattle, user: 'dvinaDnieper' }],
    S: [{ km: 150, hold: on1('dubno'), holdFn: (t, h, r) => lineDays('S', 'dubno', r), red: 7, eq: K.lineBattle / 2, user: 'dubno' },
      { km: 280, hold: on1('stalinLine'), holdFn: (t, h, r) => lineDays('S', 'stalinLine', r), red: 7, eq: K.lineBattle / 2, user: 'stalinLine' },
      { km: 450, hold: kievBase, holdFn: (t, h, r) => kievBase + lineDays('S', 'dnieperS', r), red: K.kievRed, eq: 0, late: true, user: dens.dnieperS > 0 ? 'dnieperS' : null, xFrom: kievBase },   /* the Dnieper at Kiev: the South waits on the line until the pocket closes (the Centre's panzers from the north); Kiev itself falls when the line goes; without the diversion it takes longer, if the Soviets withdraw it is given up sooner (Zhukov: in August; Budyonny: held to mid-September as in reality, then abandoned); the Dnieper below Kiev held: longer still */
      { km: 750, hold: K.donetsDays * p.donets * (kwZ ? 1 : kwB ? 0.5 : 0), holdFn: (t, hit) => calDays('S', hit, K.donetsDays * p.donets * (kwZ ? 1 : 0.5)), red: 7, eq: K.lineBattle / 2, late: true },   // the Psel–Donets stand before Kharkov by the armies that got away: the full weeks under Zhukov's withdrawal, half under Budyonny's; Kharkov falls when it is broken
      { km: 1400, hold: K.donDays, red: 0, eq: 0, yr: 1942 }] };
  for (const a of AXES) for (const ln of LINES[a]) if (ln.user) ln.eq *= 0.5 + 0.5 * Math.min(1, dens[ln.user]);   // a thinly manned line has fewer men to lose
  const kievLn = LINES.S[2];
  for (const a of AXES) for (const ln of LINES[a]) ln.hit = null;
  // calendar days from `from` in which the Germans can put `effort` days of summer-rate work into reducing a line on axis a: the mud and the winter stretch it (capped at 150 days)
  const calDays = (a, from, effort) => { let d = 0, e = 0; while (e < effort && d < 150) { const mm = iso(Math.round(from + d)).slice(0, 7); const sf = (a === 'S' && K.seasonS[mm] != null) ? K.seasonS[mm] : (K.season[mm] != null ? K.season[mm] : 1); e += sf; d++; } return d; };
  const lineFree = (t0, t1, a) => {   // fighting days in [t0, t1] on the axis, net of its lines' holds and reductions
    const ov = (x0, x1) => Math.max(0, Math.min(t1, x1) - Math.max(t0, x0)); let d = t1 - t0;
    for (const ln of LINES[a]) if (ln.hit != null && ln.hold > 0) { const H = ln.hit + ln.hold; d -= ov(ln.hit, H) + 0.5 * ov(H, H + ln.red); }
    return Math.max(0, d); };
  const lineEq = { N: 0, C: 0, S: 0 }, lineEqF = { N: 0, C: 0, S: 0 };   // the second: lines that gave way early (Version 75)
  const capt = { N: 0, C: 0, S: 0 }; let ex41 = -Infinity;   // ex41: the largest excess territorial loss of 1941 (Version 77)   // share of an axis's plant caught before evacuation, by the lead over the real advance
  let khWon = false, typhoonDay = NaN, siegeMonths = 0, effort = 0, moscowOn = false, blueOn = false, blueMonth = -1, stalPressure = 0, cauc = 0, winterOn = false;
  for (let t = 0; t < MONTHS.length; t++) {
    const m = MONTHS[t], yr = +m.slice(0, 4), Y = tot[yr];
    lorryIdx = yr === 1941 ? lorryIdx41 : lorryIdx42;   // Version 76: the year's fuel
    const frac = t === 0 ? startFrac : 1;
    const wx = m === '1941-10' ? p.mudOct : m === '1941-11' ? p.mudNov : m === '1942-04' ? p.thaw : 1;   // weather draw: more mud means a smaller season factor
    const season = K.season[m] != null ? Math.min(1, K.season[m] * (wx > 1 ? 1 / wx : (2 - wx))) : 1;
    const mStart = day(m + '-01'), mEnd = mStart + monthDays(m);
    const seasonOf = a => (a === 'S' && K.seasonS[m] != null) ? K.seasonS[m] : season;
    const sMen0 = S.men, gMen0 = G.men, xp0 = { S: XP.S, G: XP.G };
    const xr = REF && REF.xp && REF.xp[t], xS = xpF(XP.S, xr && xr.S), xG = xpF(XP.G, xr && xr.G);
    const a0 = Math.max(mStart, day(L.start)), aw40 = Math.max(0, Math.min(1, (day(L.start) + K.alertDays - a0) / Math.max(1, mEnd - a0))), aw71 = Math.max(0, Math.min(1, (day(L.start) + K.slowDays - a0) / Math.max(1, mEnd - a0)));   // Version 77: the share of the month's fighting days within the alert's first 40 days   // experience against the real war's at this month
    const airX = airUse(m);
    // the weather on the air arm: mud grounds both sides alike; the frost grounds the Luftwaffe (cold-start engines, snowbound forward fields, serviceability 30–40%) more than the Soviets
    const aw = K.airSeason[m] || [1, 1];
    const gP = comp(G.men / 3300, G.tanks / 3600, G.air * airX * aw[0] / 2800, GWT) * xG;
    const sEff = (L.sEff || 1) * xS * (yr === 1941 && L.mechCorps ? 1 + K.mechEff : 1);   // twelve full mechanized corps and full rifle divisions instead of thirty half-formed corps: a better army per head in 1941   // the fighting value of the Soviet forces per man, tank and aircraft, relative to 1941–42 (about 1.5 for the army of 1944)
    const sP = comp(S.men / 2900, Math.max(0.05, S.tanks / 22600), Math.max(0.05, S.air * aw[1] / 20000), SWT) * sEff;
    const FR = gP / sP;
    Rrel = REF && REF.R ? (sP / gP) / REF.R[t] : 1;   // for the lines reached this month (Version 74)
    // the Stavka's weight between the axes, relative to reality (1941: the south; 1942: Moscow); a lighter axis is easier to attack
    const real41 = { N: 0.2, C: 0.4, S: 0.4 }, real42 = { N: 0.15, C: 0.5, S: 0.35 };
    const alloc41 = { south: real41, centre: { N: 0.2, C: 0.5, S: 0.3 }, balanced: { N: 0.25, C: 0.4, S: 0.35 } }[L.stavka41] || real41;
    const alloc42 = { moscow: real42, south: { N: 0.15, C: 0.35, S: 0.5 }, balanced: { N: 0.15, C: 0.42, S: 0.43 } }[L.stavka42] || real42;
    const hubF = hubAt(m);   // Moscow's fall slows the movement of reserves to the other theatres
    const wgt = a => (yr === 1941 ? alloc41[a] / real41[a] : alloc42[a] / real42[a]) * (a !== 'C' ? hubF : 1);
    wgtNow = wgt;
    // ---- what each side is doing this month
    let on = { N: 0, C: 0, S: 0 }, intensity = 1, sovOff = false, prep = 1;
    if (yr === 1941) {
      on = { N: 0.9, C: 1.0, S: 0.85 };
      // after Smolensk the Centre recovers (Yelnya, replacements, stocks) and, if the Kiev diversion is on, sends its panzers
      // south; Typhoon opens at the real date, brought forward by the share of an earlier Smolensk that recovery allows
      if (m >= '1941-08' && m <= '1941-10' && ev.Smolensk) {   // until Smolensk falls (a held line, a late start) the Centre keeps attacking, and halts there to recover
        const smol = ev.Smolensk ? day(ev.Smolensk) : mEnd;
        const ty = (REF ? REF.typhoon - (REF.smolensk - smol) * p.keep : day('1941-10-02')) + (L.kievDiversion ? 0 : -7 * p.kievDelay);   // withdrawn or not, Guderian's turn south (ordered 21 Aug.) is made, and Typhoon's date is gated by Hoepner's group from Leningrad and the dumps as much as by him
        on.C = Math.max(0, Math.min(1, (mEnd - ty) / (mEnd - mStart)));
        if (m === '1941-09') on.S = L.kievDiversion && !kwAny ? 1.25 : L.kievDiversion ? (kwZ ? 0.9 : 1.1) : 0.9;   // Zhukov: the freed armies stand in front of Kleist, no pincer; Budyonny: Kleist is already across at Kremenchug and a half-pocket forms   // Kiev: the panzers of the Centre help in the south; withdrawn, there is no pocket to close, Kleist makes no Kremenchug thrust north and drives east with his whole group instead
        if (m === '1941-08' && on.C > 0.9) on.C = 0.9;
        typhoonDay = ty;
      }
      if (m >= '1941-10') on.N = m === '1941-10' ? 0.5 : 0.3;
      if (m === '1941-12') { on = { N: 0, C: 0, S: 0 }; }
    }
    if (m >= '1941-12' && m <= '1942-03') { winterOn = true; sovOff = !L.winterLimited || m <= '1942-01'; intensity = sovOff ? 1 : 0.5; }
    if (m === '1942-04') { intensity = 0.6; sovOff = !L.winterLimited; }   // the winter offensives ran to 20 April (Rzhev–Vyazma, Lyuban, Kerch)
    if (m === '1942-05') { intensity = 0.8; sovOff = !L.noKharkov; }
    if (yr === 1942 && m >= '1942-05') {
      if (mosAttack && !moscowOn && !ev.Moscow && !ev.MoscowSpent && depth.C < L.moscowKm) moscowOn = true;
      if (moscowOn) { on.C = K.offFront * (mosOnly ? K.mosOnlyX : 1) * (m === '1942-05' ? 0.35 : 1); prep = Math.max(0.1, 1 - L.moscowDef * p.defX); intensity = 1; if (m !== '1942-05') sovOff = false; }   // from 20 May; a set-piece attack on a held front
      // Blue after a Moscow attack: the panzer corps that made it must be brought south and refitted. After success a week suffices (the article: Moscow 26 June, Blue 1 July);
      // after failure the spent formations need p.blueRecover weeks, and Blue opens weaker by p.blueWear for its first two months. Blue cannot open while the attack is still running.
      const mosEnd = mosOnly ? Infinity : !mosAttack ? -Infinity : ev.Moscow ? day(ev.Moscow) + 7 : ev.MoscowSpent ? day(ev.MoscowSpent) + 7 * p.blueRecover : Infinity;
      const startDay = Math.max(mosEnd, day((L.blueStart === 'after Moscow' ? '1942-07' : L.blueStart) + '-01')) + (khWon ? 7 * p.khDelay : 0);   // a lost Kharkov battle delays Blue while the Sixth Army and Kleist refit
      const mS = day(m + '-01'), mE = mS + monthDays(m);
      const blueGo = m <= '1942-11' && startDay < mE, blueFrac = Math.min(1, (mE - Math.max(startDay, mS)) / (mE - mS));
      if (blueGo) { if (!blueOn) blueMonth = t; blueOn = true; const wear = ev.MoscowSpent && t - blueMonth < 2 ? 1 - p.blueWear : 1; on.S = blueFrac * wear; intensity = 1; }
    }
    // ---- supply reach, then the advance on each axis
    const adv = { N: 0, C: 0, S: 0 }, pace = { N: 0, C: 0, S: 0 };   // pace: the month's advance before the distance caps, which dates an event the front reached before a cap stopped it
    let advW = 0;
    for (const a of AXES) {
      const railFrac = t === 0 ? 0.3 + (frac - 0.3) * p.railTime : frac;
      rail[a] = Math.min(depth[a] * (yr === 1941 ? K.railLag : K.railLag42), rail[a] + K.railRate * (yr === 1941 ? 1 : K.railRate42X) * railIdx * (seasonOf(a) < 0.5 ? 0.5 : 1) * railFrac);
      const reachPrev = reach[a];
      reach[a] = rail[a] + K.lorryRange * lorryIdx * (seasonOf(a) < 0.3 ? K.lorryMud : 1);   // lorries manage far less in mud and snow (the south's mud came later and lighter)
      const room = L.supplyLimit ? Math.max(0, reach[a] + K.overrun - depth[a]) : 1e9;
      const alertF = !L.alert ? 1 : aw40 * (1 - L.alert * (1 - p.alertPace)) + (1 - aw40) * (t <= 4 ? 1 - L.alert * (1 - p.alertSummer) : 1);   // Version 77: by days, not calendar months
      // the Moscow defence zone and the reserve armies before the capital: by calendar, and stronger with more Soviet men in the field
      const prep41 = (a === 'C' && yr === 1941 && K.mosDef41[m] != null && depth.C > 700) ? Math.max(0.1, 1 - K.mosDef41[m] * dev(S.men, REF && REF.sMen[t], p.mosRes)) : 1;
      const flank = (a === 'C' && yr === 1941 && m <= '1941-10' && (!L.kievDiversion || kwAny)) ? 1 - p.flankCost * (!L.kievDiversion || kwZ ? 1 : 0.5) : 1;   // Zhukov: Guderian's drive south is blocked by the freed armies and the Centre pays the full flank cost; Budyonny: a retreating flank, half   // Guderian covering the Southwestern Front (withdrawn intact, it is still a flank to cover, though a retreating one)
      // beyond the Mozhaisk line the drive on Moscow is a set-piece attack on a held front, as in 1942
      const setPiece = (a === 'C' && yr === 1941 && depth.C >= K.mozhaisk) ? K.offFront41 : 1;
      const isSet = prep < 1 || setPiece < 1;
      const local = Math.pow(wgt(a), -p.reserveE * (isSet ? 1 : 0.4));   // reserves tell most against a set-piece attack
      // in open country the spearheads move as supply allows (force ratio to a small power); against a held front force decides
      const fPow = isSet ? Math.pow(FR, 0.7) * dev(FR, REF && REF.FR[t], p.alphaSet - 0.7) : Math.pow(FR, 0.3) * dev(FR, REF && REF.FR[t], p.alpha - 0.3);
      let km = K.paceK[a] * on[a] * fPow * seasonOf(a) * alertF * frac * local * (a === 'C' ? prep * prep41 * flank * setPiece : 1);
      if (yr === 1941 && a === 'S' && aw71 > 0) km *= aw71 >= 1 ? K.sEarly : 1 - (1 - K.sEarly) * aw71;                 // Brody-Dubno, Uman and the approach to the Dnieper (June–August)
      if (yr === 1941 && a === 'S' && kwAny && t >= 3 && t <= 5) km *= p.kievWd * (kwZ ? K.kievWdZ : 1);   // the South-Western Front withdrawn intact stands on the Psel and the Donets: Kiev is had cheaply, the Donbass is not; but Kleist's group, not spent on the pocket, drives east with its full weight (0.65 for the intact front alone)
      // time lost at lines (held lines, the Luga halt) comes off the pace first; the distance caps (the investment of Leningrad, the Volga, the supply reach) apply after
      lineEq[a] = 0; lineEqF[a] = 0;
      if (LINES[a].some(ln => ln.hold > 0 && (ln.yr || 1941) === yr)) {   // lines: time lost on the axis; the troops destroyed when a held line breaks count as a pocket
        const days = mEnd - mStart, rate = km / days; let t0 = mStart, left = km, done = 0;
        for (const ln of LINES[a]) {   // march to each unreached line in turn at the free-time rate, then wait out its hold
          if (ln.hold <= 0 || (ln.yr || 1941) !== yr || ln.hit != null || depth[a] + done >= ln.km) continue;
          const need = ln.km - depth[a] - done, can = rate * lineFree(t0, mEnd, a);
          if (can < need) { done += can; left = 0; break; }
          // the line is reached part-way through the month: find the day by the free time it takes
          let lo = t0, hi = mEnd; for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (rate * lineFree(t0, mid, a) >= need) hi = mid; else lo = mid; }
          if (L.supplyLimit) { const r0 = reachPrev + K.overrun, r1 = reach[a] + K.overrun; if (r1 < ln.km) { done += can; left = 0; break; } if (r0 < ln.km) hi = Math.max(hi, mStart + (ln.km - r0) / Math.max(1e-9, r1 - r0) * days); }   // nor before the supply reach gets there
          const roomAt = reachPrev + (reach[a] - reachPrev) * Math.max(0, Math.min(1, (hi - mStart) / days)) + K.overrun - ln.km;   // the attacker's supply reach left beyond the line that day
          ln.hit = hi; ln.room = roomAt; if (ln.holdFn) ln.hold = ln.holdFn(t, hi, roomAt); done += need; t0 = hi; left = km - done;
          ln.winter = ln.late && hi + ln.hold >= day(yr + '-12-01');
          for (const [name, km0] of MILES[a]) if (km0 === ln.km && !ev[name] && !ln.winter) ev[name] = iso(Math.round(ln.late ? hi + ln.hold : hi));   // the town on the line falls the day the line is reached, or (late) the day it is broken; a line that holds into December holds through the winter, and the town falls when the next year's advance passes it
        }
        if (left > 0) done += rate * lineFree(t0, mEnd, a);
        km = Math.min(km, done);
        for (const ln of LINES[a]) if (ln.hit != null && ln.eq) { const H = ln.hit + ln.hold, e = ln.eq * Math.max(0, Math.min(mEnd, H + ln.red) - Math.max(mStart, H)) / ln.red; if (ln.user && lineFail[ln.user]) lineEqF[a] += e; else lineEq[a] += e; }
      }
      pace[a] = km;
      if (a === 'C' && yr === 1941 && !ev.Smolensk && m >= '1941-08' && depth.C + km >= 640) { const need = Math.max(0, 640 - depth.C); ev.Smolensk = dateIn(m, Math.min(1, need / Math.max(1, km))); km = need; }   // the Centre halts at Smolensk to recover, as it did
      if (a === 'N') {   // Leningrad is invested, not stormed; the drive on Tikhvin opens three weeks after Shlisselburg (16 Oct. in reality), with whatever of the month is left
        const tk = ev.Shlisselburg ? day(ev.Shlisselburg) + 21 : Infinity, drive = yr === 1941 && m >= '1941-10' && m <= '1941-11' ? Math.max(0, Math.min(1, (mEnd - tk) / (mEnd - mStart))) : 0;   /* the drive is over by December: winter and the Soviet counter-blows (Tikhvin was retaken on 9 Dec.) */
        if (depth.N >= 850 && drive > 0) km = K.paceK.N * K.driveN * drive * Math.max(seasonOf(a), K.driveFloor) * Math.pow(FR, 0.3) * dev(FR, REF && REF.FR[t], p.alpha - 0.3) * local;   // the drive on Tikhvin: a corps on one road, slowed but not stopped by the mud
        km = Math.min(km, Math.max(0, (drive > 0 ? K.capN : 850) - depth.N));
      }
      if (a === 'S' && blueOn) km = Math.min(km, Math.max(0, 1500 - depth.S));
      if (a === 'S' && blueOn && depth.S >= 1500) km = 0;                    // the Volga reached: the fight is for the city
      km = Math.max(0, Math.min(km, room));
      adv[a] = km; depth[a] += km; advW += km * ({ N: 0.25, C: 0.4, S: 0.35 })[a];
    }
    // the Caucasus: a share of the south's supply reach (the rest goes to the Stalingrad axis) until the city falls and the whole of it is free;
    // after Stalingrad the branch has the south's full striking power, in the Caucasus' own weather (dry October, rain in November, the passes closed in December)
    if (blueOn && depth.S > 1000) {
      const share = ev.StalingradFalls ? 1 : (L.caucShare != null ? L.caucShare : K.caucShare), cw = m <= '1942-09' ? seasonOf('S') : ev.StalingradFalls ? K.caucW[m] : seasonOf('S');
      const gap = cauc >= K.caucGap ? K.caucGapX : 1;   // beyond Grozny the way to Baku is the Derbent gap: the coast road between the mountains and the sea, a set-piece front, not open country
      const push = depth.S >= 1500 ? (ev.StalingradFalls ? 1 : 0.5) * gap * K.paceK.S * cw * Math.pow(FR, 0.3) * dev(FR, REF && REF.FR[t], p.alpha - 0.3) * Math.pow(wgt('S'), -p.reserveE * 0.4) : 0;
      const reachC = ev.StalingradFalls && m >= '1942-10' ? rail.S + K.lorryRange * lorryIdx * K.caucL[m] : reach.S;   // the coast road and the Terek valley: the steppe's mud is not theirs
      // Version 76: in the month the branch passes Grozny, the part of its advance beyond the town goes at the Derbent gap's rate (before the supply cap, which
      // limits distance, not time), and the month's events are dated by the time taken to reach them
      const c0 = cauc; let raw = cauc + adv.S * 0.9 + push; const crossed = c0 < K.caucGap && raw > K.caucGap;
      if (crossed) raw = K.caucGap + (raw - K.caucGap) * K.caucGapX;
      cauc = Math.max(cauc, Math.min(raw, Math.max(0, (reachC + K.overrun - 1000) * share), 1000));
      const eff = x => crossed && x > K.caucGap ? (K.caucGap - c0) + (x - K.caucGap) / K.caucGapX : x - c0;
      for (const [name, km] of CAUC) if (!ev[name] && cauc >= km) ev[name] = dateIn(m, Math.min(1, Math.max(0.05, eff(km) / Math.max(1, eff(cauc)))));
    }
    // ---- Soviet winter counter-offensive: ground regained on the Moscow axis
    let regain = 0;
    if (winterOn && m >= '1941-12' && ev.Tikhvin && ev.Tikhvin.slice(0, 7) < m && !ev.TikhvinRetaken && !ev.Leningrad) {   // Tikhvin: retaken if the Soviets are strong enough; else Leningrad starves
      if (sovOff && (sP / gP) >= (REF ? REF.R[t] : sP / gP) * p.tikhvin) { depth.N = 850; rail.N = Math.min(rail.N, 850); ev.TikhvinRetaken = m + '-09'; }
    }
    if (ev.Tikhvin && !ev.TikhvinRetaken && !ev.Leningrad) { siegeMonths += ev.Tikhvin.slice(0, 7) === m ? 1 - (+ev.Tikhvin.slice(8, 10) - 1) / monthDays(m) : 1; /* the Ladoga route is cut only while Tikhvin is held */ if (siegeMonths >= p.siege) { ev.Leningrad = m + '-15'; } }
    if (winterOn && sovOff && m <= '1942-03') { regain = K.winterRegain * Math.pow(sP / gP, 1.2) * dev(sP / gP, REF && REF.R[t], p.winterD) * (m === '1941-12' ? 1.4 : 1) * hubF /* the reserve armies formed around Moscow */; depth.C = Math.max(ev.Moscow ? L.moscowKm : 0, depth.C - regain); rail.C = Math.min(rail.C, depth.C); }
    // ---- pockets
    const forward = yr === 1941 ? 1 : (blueOn ? K.pocket42 : 0.75);   // 1942: the Stavka let the fronts withdraw before Blue (6 July), so the open advance took far fewer prisoners than 1941's
    const leak = L.alert ? 1 + L.alert * (p.alertLeak - 1) * aw40 : 1;
    const sealLever = Math.pow(L.gMen / 3300, 0.4) * Math.pow(L.gAirX * airX, 0.15);                 // the premise's extra men and aircraft
    const sealWear = Math.pow((G.men / 3300) / (L.gMen / 3300), 0.4);                          // the attrition since, as in reality
    let pfS = 1;   // the Dnieper below Kiev held: Guderian's pincer alone. The share of the month's southern advance made in the kievWin days after the Kiev line breaks
    if (dens.dnieperS > 0 && !lineFail.dnieperS && kievLn.hit != null) { const kB = kievLn.hit + kievLn.hold; if (kB < mEnd && kB + K.kievWin > mStart) { const a0 = Math.max(kB, mStart), share = Math.min(1, (Math.min(mEnd, kB + K.kievWin) - a0) / Math.max(1, mEnd - a0)); pfS = 1 - share * (1 - K.kievPrisD) * Math.min(1, dens.dnieperS / 0.75); } }
    const advWw = AXES.reduce((acc, a) => acc + adv[a] * ({ N: 0.25, C: 0.4, S: 0.35 })[a] * wgt(a) * (a === 'S' ? pfS : 1), 0);
    const lineW = AXES.reduce((acc, a) => acc + lineEq[a] * ({ N: 0.25, C: 0.4, S: 0.35 })[a] * wgt(a), 0);   // the broad-front battle for a held line: it costs the defender killed and wounded, in proportion to the men there, not a pocket   // the men standing on each axis
    const lineWF = AXES.reduce((acc, a) => acc + lineEqF[a] * ({ N: 0.25, C: 0.4, S: 0.35 })[a] * wgt(a), 0);   // Version 75: lines that gave way early: their men cut off
    let pris = K.pockets * S.men * (lineWF / 400) * K.lineFailPris + K.pockets * S.men * (advWw / 400) * forward * sealWear * Math.pow(sealLever * (L.sovDepth && aw71 > 0 ? (aw71 >= 1 ? 0.7 : 1 - 0.3 * aw71) : 1) / leak, p.pocketE) / Math.sqrt(sEff) * Math.sqrt(xG);   // better-led troops get more of themselves out of a pocket; better-led panzer groups close it faster
    if (m === '1941-09' && kwAny) pris *= (kwZ ? K.kievPrisZ : K.kievPrisB);   // Zhukov: the armies are gone before the pincers meet; Budyonny: half of them
    if (m === '1941-09' && !L.kievDiversion) pris *= 0.6;                            // no northern pincer: the Kiev pocket is far smaller
    if (m === '1942-05' && sovOff) {   // Timoshenko's Kharkov offensive (12 May): a test of the southern balance against the real one, which failed at Barvenkovo
      // the ratio: Soviet to German power, relative to the real May, raised if the front stands on the Donets with no salient to cut off (Kharkov held through the winter)
      const khRatio = REF ? (sP / gP) / REF.R[t] * Math.pow(wgt('S'), p.reserveE) * (depth.S <= 800 ? K.khDonets : 1) : 1;
      o.kharkov42 = { ratio: khRatio, wins: REF && khRatio >= K.kharkovX * p.kharkovX ? 1 : 0 };
      if (o.kharkov42.wins) { khWon = true; if (ev.Kharkov) ev.KharkovRetaken = '1942-05-28'; depth.S = Math.min(depth.S, 700); }   // Version 74: only a city that fell is retaken   // Kharkov a Kursk a year early: the city retaken, the Germans thrown back toward the Dnieper bend
      else pris += 240 * Math.pow(G.men / 3300, 0.5);          // the Kharkov offensive cut off at Izyum
    }
    // ---- attrition
    const act = Math.max(0.35, m === '1942-06' ? 0.6 : 0, (mosOnly && m >= '1942-07' && m <= '1942-11') ? K.mosOnlyAct : 0, Math.max(...Object.values(on)), sovOff ? 1 : 0, moscowOn ? 1 : 0) * intensity * frac;   // Moscow only: once the attack is over the Stavka's reserves counter-attack the salient through the summer and autumn (Rzhev on a larger scale), and the front does not go quiet   // June 1942: Sevastopol and the Volkhov even with no offensive running
    let sKw = K.sCas * Math.pow(gP, 0.7) * Math.pow(xS, -K.xp.surv) * dev(gP, REF && REF.gP[t], p.exchD) * act * (sovOff ? (winterOn || m === '1942-04' ? K.sOffWinter : 1.8) : 1) * Math.pow(prep, 0.3) * (yr === 1942 && m >= '1942-06' ? K.sCas42X : 1) + K.pockets * S.men * (lineW / 400) * 0.5;
    let gCas = K.gCas * Math.pow(sP, 0.5) * Math.pow(xG, -K.xp.surv) * dev(sP, REF && REF.sP[t], p.gExchD) * act * (sovOff || (mosOnly && m >= '1942-07' && m <= '1942-11') ? 1.3 : 1) * (L.alert ? 1 + 0.15 * aw40 : 1) / Math.pow(L.gAirX * airX, 0.1) * Math.pow(G.men / 3300, 0.4) * (yr === 1942 && m >= '1942-06' ? K.gCas42X : 1) / Math.pow(prep, 0.3);   // stronger defences cost the attacker (the month's ordinary attrition already runs at full intensity; the battle's own bill is added below)
    { let as = 0;   // Version 74: the share of the month each axis spends reducing a line the Soviets chose to hold, weighted as the advance is
      for (const a of AXES) for (const ln of LINES[a]) if (ln.user && ln.hit != null) { const x0 = ln.hit + (ln.xFrom || 0), x1 = ln.hit + ln.hold; as += ({ N: 0.25, C: 0.4, S: 0.35 })[a] * (on[a] > 0 ? 1 : 0) * Math.max(0, Math.min(mEnd, x1) - Math.max(mStart, x0)) / (mEnd - mStart); }
      gCas *= 1 + K.lineG * as; }
    const sTl = S.tanks * K.sTank[yr] * act + 0.5 * pris;
    const gTl = G.tanks * K.gTank * act * Math.pow(sP, 0.3) * (winterOn ? K.gTankWinter : 1);   // a defender on a static front loses fewer tanks (the winter's losses were breakdowns and abandonments, not battle)
    const groundAir = (t === 0 && L.alert) ? 1 - L.alert * (1 - p.alertAir) : 1;
    const sAl = S.air * K.sAir[yr] * act * (t === 0 ? (frac <= 0.3 ? 1.5 * groundAir : 1 + (1.5 * groundAir - 1) * 0.3 / frac) : 1) * Math.pow(L.gAirX * airX, 0.4);
    const gAl = G.air * K.gAir * act * Math.pow(sP, 0.3);
    // ---- events
    if (moscowOn) { effort += (m === '1942-05' ? 0.35 : 1); if (depth.C >= L.moscowKm) moscowOn = false; else if (effort >= p.culm * (mosOnly ? K.mosOnlyCulm : 1)) { ev.MoscowSpent = m + '-28'; moscowOn = false; } }   // (the losses of success or failure are added below, in the month of the event)
    if (blueOn && depth.S >= 1500 && !ev.StalingradFalls) {
      if (!ev.VolgaReached) ev.VolgaReached = ev.Stalingrad || dateIn(m, Math.min(1, (1500 - (depth.S - adv.S)) / Math.max(1, adv.S, pace.S)));   // the day the spearhead reached the river, dated as the towns are (the month's pace, not the capped advance: an advance cut short by the river is not a month's march)
      const vf = ev.VolgaReached && ev.VolgaReached.slice(0, 7) === m ? 1 - (+ev.VolgaReached.slice(8) / monthDays(m)) : 1;
      if (m <= '1942-11') stalPressure += FR * Math.pow(wgt('S'), -p.reserveE) * vf * Math.pow((1.25 - (L.caucShare != null ? L.caucShare : K.caucShare)) / 0.5, 0.6);   // the effort the Caucasus does not take   // wgt('S') already carries the loss of the Moscow hub
      if (REF && stalPressure >= REF.stal * K.stalX * p.stalX) ev.StalingradFalls = m + '-15';
    }
    // ---- after Stalingrad: a motorized dash down the west bank and across the Kalmyk steppe for Astrakhan (Directive No. 45; in reality a
    // division patrolled to within 40 km of the city). No railway: lorries only beyond the Stalingrad railhead, and a race with the November weather.
    if (ev.StalingradFalls && !ev.Astrakhan && m >= ev.StalingradFalls.slice(0, 7) && m <= '1942-12') {
      astrOn = true;
      const f0 = ev.StalingradFalls.slice(0, 7) === m ? +ev.StalingradFalls.slice(8) / monthDays(m) : 0;   // the share of the month gone before the city fell
      const wf = m <= '1942-10' ? 1 : m === '1942-11' ? p.steppeNov : 0.05, capF = m <= '1942-10' ? 1 : m === '1942-11' ? p.steppeNov : 0.3;
      const cap = L.supplyLimit ? Math.max(0, 1500 + (K.lorryRange * lorryIdx + K.overrun) * capF - depth.S) : 1e9;
      let km = K.astrPace * p.astr * wf * (1 - f0) * Math.pow(FR, 0.3) * dev(FR, REF && REF.FR[t], p.alpha - 0.3) * Math.pow(wgt('S'), -p.reserveE * 0.4);
      const full = km; km = Math.max(0, Math.min(km, cap, 1750 - depth.S));
      if (km > 0) { if (depth.S + km >= 1750 - 1e-6) ev.Astrakhan = dateIn(m, f0 + (1 - f0) * Math.min(1, (1750 - depth.S) / Math.max(1, full))); depth.S += km; adv.S += km; }
    }
    for (const a of AXES) for (const [name, km0] of MILES[a]) { const km = name === 'Moscow' ? L.moscowKm : km0; if (LINES[a].some(ln => ln.winter && ln.km === km0 && depth[a] <= km0 + 5)) continue; if (!ev[name] && depth[a] >= km) ev[name] = dateIn(m, Math.min(1, (km - (depth[a] - adv[a])) / Math.max(1, adv[a], pace[a]))); }
    if (ev.Stalingrad && ev.VolgaReached && ev.Stalingrad < ev.VolgaReached) ev.VolgaReached = ev.Stalingrad;   // the Volga is reached the day the spearhead gets to Stalingrad (1,500 km)
    // ---- Soviet production base: the real path, moved by the difference in territory lost (and Moscow's factories)
    // the evacuation ran a few weeks ahead of the panzers (Zaporozhye in Aug.–Sept., Plant 183 at Kharkov to 20 Oct., Moscow's works in Oct.–Nov.): the plant in
    // territory taken ahead of the real schedule is caught in proportion to the lead (nothing under two weeks, all of the extra weight at ten), and stays caught (a ratchet)
    const shareA = (a, d) => a === 'N' ? 0.12 * Math.min(1, d / 850) : a === 'C' ? 0.18 * Math.min(1, d / 1000) : 0.3 * Math.min(1, d / 1000) + 0.1 * Math.max(0, Math.min(1, (d - 1000) / 500));
    for (const a of AXES) if (REF && REF.depth && adv[a] > 0) {   // Version 77: only while the axis advances
      const D = REF.depth[a]; let tp = D.findIndex(x => x >= depth[a] - 1e-6);
      if (tp < 0) tp = D.length + 2; else if (tp > 0) tp = tp - 1 + (depth[a] - D[tp - 1]) / Math.max(1e-6, D[tp] - D[tp - 1]);
      const lead = Math.min(1, Math.max(0, ((tp - t) * 4.35 - K.captureFrom) / (K.captureWeeks - K.captureFrom)));
      capt[a] = Math.max(capt[a], K.capture * lead * Math.max(0, shareA(a, depth[a]) - shareA(a, D[t])));   // Version 77: the alert's relief is applied once, through the loss weight below
    }
    const lost = shareA('N', depth.N) + shareA('C', depth.C) + shareA('S', depth.S) + capt.N + capt.C + capt.S + (ev.Moscow ? K.moscowInd : 0) + (ev.StalingradFalls ? 0.05 : 0) + (ev.Astrakhan ? 0.02 : 0) + (ev.Leningrad ? 0.04 : 0);
    const evac = 1 - K.alertEvac * Math.min(1, L.alert || 0);   // a leadership that expected the war plans the evacuation and holds stocks
    const ex = lost - K.lostReal[t]; if (yr === 1941) ex41 = ex;   // Version 77: the alert relieves only the excess lost by the end of 1941 (December's), and only a loss, not a gain;
    const ind = Math.max(0.2, 1 - K.lostW * (ex - (1 - evac) * Math.max(0, Math.min(ex, ex41))));   // what is lost beyond it in 1942 (Moscow's works, the south) falls in full
    // ---- stocks
    // foreign supply: Lend-Lease adds tanks and aircraft from October 1941; gold purchases through Vladivostok (a neutral America selling for cash, Japan tolerating only non-military cargo)
    // bring machine tools, aluminium and aviation spirit from the spring of 1942: a little more output (Version 73: no lorries or rail stock)
    const ll = L.aid === 'll', gold = L.aid === 'gold' && t >= K.goldFrom;
    const sPX = yr === 1941 ? 1 : L.sProdX;   // Version 77: the output lever acts from January 1942, as labelled
    const prodT = (yr === 1941 ? PROD.sTanks41 : PROD.sTanks42) * ind * sPX * (gold ? K.goldProd : 1) * frac + (ll ? (t >= 4 ? (yr === 1941 ? 170 : 230) : 0) : 0);
    const prodA = (yr === 1941 ? PROD.sAir41 : PROD.sAir42) * ind * sPX * (gold ? K.goldProd : 1) * frac + (ll && t >= 4 ? (yr === 1941 ? 150 : 200) : 0);
    const mob = (yr === 1941 ? PROD.sMen41 : PROD.sMen42) * (0.75 + 0.25 * ind) * frac - (t >= 4 && t <= 7 ? 65 * L.farEastHeld : 0) - (yr === 1942 ? earlyS : 0) - echIn(t);   // Version 77: the echelon already at the front does not arrive again
    const netLoss = pris + 0.35 * sKw + 0.2 * sKw;                            // dead, and the wounded away for months
    S = { men: Math.max(500, S.men - netLoss + mob), tanks: Math.max(300, S.tanks - sTl + prodT), air: Math.max(300, S.air - sAl + prodA) };
    const sick = ((m >= '1941-12' && m <= '1942-02') ? 60 : 15) * (G.men / 3300);
    G = { men: Math.max(500, G.men - gCas - sick + (yr === 1941 ? PROD.gRepl41 : PROD.gRepl42) * L.gReplX * frac * (m >= '1941-12' && m <= '1942-05' ? 1.5 : 1) - (yr === 1942 ? earlyG : 0)),
          tanks: Math.max(200, G.tanks - gTl + ((yr === 1941 ? PROD.gTanksE41 : PROD.gTanksE42) * L.gProdX + (m >= '1941-12' && m <= '1942-05' ? PROD.gTanksRefit : 0)) * frac),   // Dec.–May: the workshops return the winter's repairs and the panzer divisions refit for Blue (the east held some 3,300 tanks by July 1942)
          air: Math.max(200, G.air - gAl + (yr === 1941 ? PROD.gAir41 : PROD.gAir42) * L.gAirX * frac) };
    // ---- experience: the month's losses and new men (the stocks' own flows; the city battles' departures from the real are taken off below)
    const gIn = (yr === 1941 ? PROD.gRepl41 : PROD.gRepl42) * L.gReplX * frac * (m >= '1941-12' && m <= '1942-05' ? 1.5 : 1) - (yr === 1942 ? earlyG : 0);
    XP = { S: xpStep('S', XP.S, sMen0, 0.55 * sKw, pris, 0, mob, S.men, act, yr, yr === 1941 && m <= '1941-09' ? K.xp.kSummer : K.xp.kPocket, 1, echIn(t) * (K.xp.S.ld0 - K.xp.S.dens[1941])), G: xpStep('G', XP.G, gMen0, gCas, 0, sick, gIn, G.men, act, yr) };
    // ---- what a campaign's success costs the loser: the defenders of a city that falls are lost with it (the article's figures for the scenario,
    // scaled by the Soviet strength in the field), and a counter-offensive that fails costs the attacker rather than the defender
    const fell = name => ev[name] && ev[name].slice(0, 7) === m;
    const sScale = Math.pow(S.men / (REF ? REF.sMen[t] : S.men), 0.7);
    let cityPris = 0, citySKw = 0, cityGCas = 0;
    const city = (c, f = 1) => { cityPris += c.pris * sScale * f; citySKw += (c.kw || 0) * sScale * f; cityGCas += (c.g || 0) * Math.pow(G.men / 3300, 0.5) * f; };
    if (fell('Moscow')) city(K.cityLoss.moscow);            // the envelopment of the city: the Moscow defence zone and the armies caught inside, as at Kiev and Vyazma a pocket's killed and wounded run to about half its prisoners
    if (fell('MoscowSpent')) city(K.cityLoss.moscowSpent);  // the attack fails: the attacker bleeds against prepared defences and the counter-attacks that follow (Rzhev, Kursk); the defender loses heavily but few prisoners
    if (fell('Leningrad')) city(K.cityLoss.leningrad);      // the garrison capitulates (the Leningrad Front, starved for months; Sevastopol and Singapore on a larger scale)
    if (fell('StalingradFalls')) city(K.cityLoss.stalingrad);   // the Sixty-second Army's remnant on the west bank
    if (m === '1942-05') city(K.cityLoss.kerch);
    if (m === '1942-05' && khWon) city({ pris: 0, kw: K.kharkovWin.s, g: K.kharkovWin.g });              // the Crimea (not an axis of the model): the Kerch peninsula in May, Sevastopol in July, as in reality
    if (m === '1942-07') city(K.cityLoss.sevastopol);
    if (fell('Astrakhan')) city(K.cityLoss.astrakhan);
    if (fell('Grozny')) city(K.cityLoss.grozny);
    pris += cityPris; sKw += citySKw; gCas += cityGCas;
    // Version 73: the city battles' losses come off the armies' strength (until then they entered only the year's losses, as they still do). Only the
    // departure from the real war's is taken off: the real strengths, which the calibration follows, already carry the real Kerch and Sevastopol
    { const cR = REF && REF.city ? REF.city[t] : null;
      if (cR) { const dP = cityPris - cR.p, dK = 0.55 * (citySKw - cR.k), dG = cityGCas - cR.g, s0 = S.men, g0 = G.men, lP = Math.max(0, dP), lK = Math.max(0, dK);
        S.men = Math.max(500, S.men - dP - dK); G.men = Math.max(500, G.men - dG);
        if (lP + lK > 0) XP.S = xpStep('S', XP.S, s0, lK, lP, 0, 0, s0 - lP - lK, 0, yr, K.xp.kPocket, 0);   // the men lost; any given back (a smaller Kerch than the real) come at the army's own quality
        if (dG > 0) XP.G = xpStep('G', XP.G, g0, dG, 0, 0, 0, G.men, 0, yr, K.xp.kPocket, 0); } }
    Y.sCas += sKw + pris; Y.sIrr += pris + 0.35 * sKw; Y.pris += pris; Y.sTl += sTl; Y.sAl += sAl; Y.gCas += gCas; Y.gTl += gTl; Y.gAl += gAl;
    TR.xp.push(xp0); TR.xS.push(xS); TR.xG.push(xG); TR.city.push({ p: cityPris, k: citySKw, g: cityGCas });
    o.months.push({ m, depth: { ...depth }, reach: { ...reach }, cauc, gP, sP, sMen0, gMen: G.men, gTanks: G.tanks, gAir: G.air, sMen: S.men, sTanks: S.tanks, sAir: S.air, ind, FR, pris, sKw, gCas, regain, moscowOn, blueOn, stalPressure });
  }
  const nov = o.months[17];
  const resPower = comp(nov.sMen, Math.max(50, nov.sTanks), Math.max(50, nov.sAir), SWT) * (L.sEff || 1) * TR.xS[17] * hubAt('1942-11');   // the reserves that can be brought to the Don by November
  // the Don flank: a share of the German army's power (the reserves behind the Romanian sectors, the panzer corps that can turn) plus the allied armies
  // (the Romanian Third and Fourth, the Italian Eighth, the Hungarian Second: some 650,000 men at about a third of a German formation's worth), which the levers do not change
  const flank = mosOnly ? comp(nov.gMen, nov.gTanks, nov.gAir, GWT) * TR.xG[17] * K.mosFlank   // Moscow alone: no Don, no allies; the counter-offensive strikes the German-held flanks of the Moscow salient (Mars on a larger scale)
    : comp(nov.gMen, nov.gTanks, nov.gAir, GWT) * TR.xG[17] * K.allies.donShare * (astrOn && ev.StalingradFalls <= '1942-10-31' ? 1 - K.astrFlank : 1) + K.allies.pow * comp(START.gMen, START.gTanks, START.gAir, GWT);   // the allies in the same (unnormalized) units as the German power   // the Astrakhan group is off the Don when the counter-offensive opens
  const ratio = resPower / flank;
  o.uranus = { ratio, breakthrough: REF && ratio >= REF.uranus * K.uranusX * p.uranusX ? 1 : 0 };
  if (REF) {   // the counter-offensive's own bill, beyond December's ordinary attrition: in success the Soviets pay the Stalingrad offensive's first six weeks and Mars together
    // (some 320,000) and the Germans the Chir and Kotelnikovo battles and the pocket's first weeks (60,000); in failure the losses fall on the attacker alone (Mars cost 215,000)
    const sp = Math.pow(nov.sP / REF.sP[17], 0.7), gp = Math.pow(nov.gP / REF.gP[17], 0.5), b = o.uranus.breakthrough ? K.uranusWin : K.uranusFail;
    tot[1942].sCas += b.s * sp; tot[1942].sIrr += 0.35 * b.s * sp; tot[1942].gCas += b.g * gp;
    const e = o.months[18], s0 = e.sMen, g0 = e.gMen; e.sMen = Math.max(500, e.sMen - 0.55 * b.s * sp); e.gMen = Math.max(500, e.gMen - b.g * gp); e.sKw += b.s * sp; e.gCas += b.g * gp;
    XP = { S: xpStep('S', XP.S, s0, s0 - e.sMen, 0, 0, 0, e.sMen, 0, 1942, K.xp.kPocket, 0), G: xpStep('G', XP.G, g0, g0 - e.gMen, 0, 0, 0, e.gMen, 0, 1942, K.xp.kPocket, 0) };   // the counter-offensive's bill falls on the fighting men
  }
  o.events = ev; ev.Typhoon = Number.isFinite(typhoonDay) ? iso(Math.round(typhoonDay)) : 'none'; o.y41 = tot[1941]; o.y42 = tot[1942];
  o.y41.ratio = o.y41.sCas / o.y41.gCas; o.y42.ratio = o.y42.sCas / o.y42.gCas;
  o.end41 = o.months[6]; o.mar42 = o.months[9]; o.may42 = o.months[11]; o.end42 = o.months[18];
  const mos41 = ev.Moscow && ev.Moscow < '1942' ? 1 : 0, mos42 = ev.Moscow && ev.Moscow >= '1942' ? 1 : 0;
  o.moscow = { falls: ev.Moscow ? 1 : 0, falls1941: mos41, falls1942: mos42, date: ev.Moscow || 'none', date1941: mos41 ? ev.Moscow : 'none', date1942: mos42 ? ev.Moscow : 'none', spent: ev.MoscowSpent || 'none' };
  o.kharkov42 = o.kharkov42 || { ratio: 0, wins: 0 };
  const avg = a => a.reduce((s, x) => s + x, 0) / a.length;   // the year's mean fighting value per man from experience, relative to the real war's
  o.xp = { s41: avg(TR.xS.slice(0, 7)), g41: avg(TR.xG.slice(0, 7)), s42: avg(TR.xS.slice(7)), g42: avg(TR.xG.slice(7)),
           dec41: TR.xp[7], dec42: { S: XP.S, G: XP.G } };   // the states at the ends of 1941 and 1942 (after the counter-offensive's bill)
  o.lines = {}; o.linesFail = {}; o.linesRoom = {};   // the days each manned line held (0 if not manned or not reached in 1941); 1 if it gave way early; the German supply reach left on arrival
  for (const k of LINE_KEYS) { o.lines[k] = 0; o.linesFail[k] = 0; o.linesRoom[k] = 0; }
  for (const a of AXES) for (const ln of LINES[a]) if (ln.user && ln.hit != null) { o.lines[ln.user] = Math.max(0, ln.hold - (ln.xFrom || 0)); o.linesFail[ln.user] = lineFail[ln.user] ? 1 : 0; o.linesRoom[ln.user] = ln.room; }
  o.linePool = { pool: linePool, need: lineNeed, thin: lineThin };
  o.stalingrad = { falls: ev.StalingradFalls ? 1 : 0, date: ev.StalingradFalls || 'none', volga: ev.VolgaReached || 'none', pressure: o.end42.stalPressure };
  o.leningrad = { falls: ev.Leningrad ? 1 : 0, date: ev.Leningrad || 'none', tikhvinRetaken: ev.TikhvinRetaken || 'none' };
  o.caucasus = { depth: o.end42.cauc, maikop: ev.Maikop || 'none', grozny: ev.Grozny || 'none', baku: ev.Baku || 'none' };
  return o;
}
function setRef() { REF = null; const r = run(LEVERS_REAL, sampleParams(null)); REF = { ind42: r.end42.ind, stal: r.end42.stalPressure, uranus: r.uranus.ratio, typhoon: day('1941-10-02'), smolensk: day(r.events.Smolensk), FR: r.months.map(x => x.FR), gP: r.months.map(x => x.gP), sP: r.months.map(x => x.sP), sMen: r.months.map(x => x.sMen0), irr41: r.y41.sIrr, xp: r.track.xp, depth: Object.fromEntries(AXES.map(a => [a, r.months.map(x => x.depth[a])])), R: r.months.map(x => x.sP / x.gP) };
  const r2 = run(LEVERS_REAL, sampleParams(null)); REF.city = r2.track.city;   // the city battles of a real run with the references in place
  return REF; }

// ------------------------------------------------------------------ Monte Carlo and tools
function rngFrom(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function flatten(o, pre = '', acc = {}) { for (const [k, v] of Object.entries(o)) { if (Array.isArray(v)) v.forEach((x, i) => flatten(x, pre + k + '.' + i + '.', acc)); else if (v && typeof v === 'object') flatten(v, pre + k + '.', acc); else acc[pre + k] = v; } return acc; }
const day = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 864e5;
const iso = d => new Date(d * 864e5).toISOString().slice(0, 10);
function monteCarlo(L, n = 800, seed = 1941, fix = null) {
  if (!REF) setRef();
  const rng = rngFrom(seed), rngX = rngFrom(seed * 13 + 73), rngL = rngFrom(seed * 17 + 75), rngF = rngFrom(seed * 19 + 76), runs = [];   // the same streams as Version 73's, so the same draws, the lines' own and the oil's (Version 76)
  for (let i = 0; i < n; i++) runs.push(flatten(run(L, fix ? Object.assign(sampleParams(rng, rngX, rngL, rngF), fix) : sampleParams(rng, rngX, rngL, rngF))));   // fix: hold named mechanisms at a value while the rest are drawn
  const q = {}, pick = (a, f) => a[Math.min(a.length - 1, Math.floor(f * a.length))];
  const keys = new Set(); for (const r of runs) for (const k of Object.keys(r)) keys.add(k);   // events absent from some runs still get a share
  for (const k of keys) {
    const v = runs.find(r => r[k] != null)[k];
    if (typeof v === 'number' || typeof v === 'boolean') { const a = runs.map(r => +r[k]).filter(Number.isFinite).sort((x, y) => x - y); if (a.length) q[k] = [pick(a, 0.1), pick(a, 0.5), pick(a, 0.9), a.reduce((s, x) => s + x, 0) / a.length]; }
    else if (typeof v === 'string') { const a = runs.map(r => r[k]).filter(x => /^\d{4}-\d\d-\d\d$/.test(x)).map(day).sort((x, y) => x - y); q[k + '#share'] = [a.length / n]; if (a.length) q[k] = [iso(pick(a, 0.1)), iso(pick(a, 0.5)), iso(pick(a, 0.9))];
      const a41 = a.filter(d => d < day('1942-01-01')); if (a41.length && a41.length < a.length) q[k + '#split'] = [a41.length / n, iso(pick(a41, 0.1)), iso(pick(a41, 0.5)), iso(pick(a41, 0.9)), iso(pick(a.slice(a41.length), 0.5))];   // an event that falls in 1941 in some runs and 1942 in others: the 1941 share and dates, and the median of the rest
    }
  }
  return q;
}
function sensitivity(L, metric) {
  if (!REF) setRef();
  const base = sampleParams(null), b = metric(run(L, base)), rows = [];
  for (const [k, v] of Object.entries(Object.assign({}, PRIORS, PRIORSX, PRIORSL, PRIORSF))) rows.push({ k, lo: metric(run(L, Object.assign({}, base, { [k]: v[0] }))) - b, hi: metric(run(L, Object.assign({}, base, { [k]: v[1] }))) - b });
  rows.sort((x, y) => Math.max(Math.abs(y.lo), Math.abs(y.hi)) - Math.max(Math.abs(x.lo), Math.abs(x.hi)));
  return { base: b, rows };
}
const STEPS = [   // from reality to the scenario, one change at a time; the decision first, so that the later changes show what they add to its chances
  ['Reality', {}], ['Moscow first in 1942, then the south', { plan42: 'moscowBlue', moscow42: true }],
  ['Invasion on 1 June', { start: '1941-06-01' }], ['Soviets alerted, 3.7m men in the west', { sMen: 3700, alert: 1 }],
  ['More German men and tanks', { gMen: 3900, gTanks: 3800 }], ['Larger Luftwaffe', { gAirX: 1.5 }], ['German output and replacements', { gProdX: 1.3, gReplX: 1.25 }],
  ['More lorries and fuel, net of the extra divisions', { lorries: 1.1, fuel: 1.05, fuel42: 1.05, railX: 1.0 }], ['More fuel in 1942: trade overseas', { fuel42: 1.2 }], ['Purchases for gold instead of Lend-Lease', { aid: 'gold', sProdX: 0.96 }], ['Far East forces held back', { farEastHeld: 0.5 }],
];
const M = { MONTHS, AXES, MILES, CAUC, K, PROD, START, LEVERS_REAL, LEVERS_SCEN, PRIORS: Object.assign({}, PRIORS, PRIORSX, PRIORSL, PRIORSF), PRIORS41: PRIORS, PRIORSX, PRIORSL, PRIORSF, LINE_KEYS, LINE_STOPS, STEPS, sampleParams, run, setRef, monteCarlo, sensitivity, flatten, day, iso, getRef: () => REF };
if (typeof module !== 'undefined' && module.exports) module.exports = M; else root.EFModel = M;
})(typeof window !== 'undefined' ? window : globalThis);

