# Eastern Front Model 1941–42

A month-by-month model of the German–Soviet war from June 1941 to December 1942, built for the Halifax alternate-history scenario. In that scenario Britain makes peace in 1940, and Germany, trading freely overseas, invades on 1 June 1941 with more men, tanks and aircraft. The Red Army has been alerted beforehand and receives no Lend-Lease.

Each month the model carries forward:

- men, tanks and aircraft on both sides;
- the German railheads and supply reach on three axes;
- the Soviet production base.

It then moves the front by a dozen mechanisms: pace from the force ratio (capped by supply reach and cut by mud and frost), pockets, attrition, production, mobilization and replacements, the winter counter-offensive, the Moscow defences, Stalingrad and the November counter-offensive. Each army's experience (its leaders, seasoned men and learning) rises and falls with its own losses.

Decisions are levers. The German ones include when Typhoon opens, the plan for 1942 and when Blue starts. The Soviet ones include defence in depth, the mechanized corps, which defensive lines to man and how strongly, a Kiev withdrawal, and where the Stavka keeps its weight.

The constants are calibrated so that the real decisions reproduce the real war:

- the real dates of fourteen events, within days to three weeks;
- the real losses and strengths of 1941 and 1942, within about 12 per cent.

Each uncertain mechanism's strength is drawn from a range that acts only on departures from reality. The weather and the margins at Stalingrad and in the November counter-offensive are drawn for every run, so the real settings give a spread around the calibrated run. Results are the middle of 600 runs, with the 10th to 90th percentile.

The page has an English and a Russian version. The switch is at the top right, and the browser remembers the choice.

## Version 77 (this edition)

**Corrections from an audit of the model and an independent review.** None changes the real run; together they make the scenario harder for the Red Army.

- **The second echelon is no longer counted twice.** The scenario's extra 800,000 Soviet men in the west are chiefly the armies brought forward from the interior in May. In the real war these second-echelon armies reached the front in July and August, so they are already in the real monthly inflow. Now the first 670,000 extra men (some 57 divisions):
  - are taken off the July and August inflow (three-fifths and two-fifths);
  - come in at the regular army's quality, with their leaders taken off that inflow too;
  - add nothing to the pool for the defensive lines, which already counts them.
- **What belongs to the first weeks of the war is measured in days from the invasion**, not in calendar months. An invasion on 1 June had stretched each of these by three weeks.
  - the alert's slower frontier battles, leakier pockets and German losses: 40 days;
  - the first strike on the airfields;
  - the south's slow start and defence in depth: 71 days.
- **The alert's planned evacuation relieves only the output lost by the end of 1941.** It no longer softens the loss of Moscow's works in 1942, nor reduces the gain when less ground is lost, and it is applied once, not twice, to plant caught ahead of schedule.
- **Plant is caught only while the front advances.** The real front's winter retreat no longer makes it grow on a standing front.
- **The Soviet output setting acts from January 1942**, as its label says.
- **The scenario's share of the south's supply for the Caucasus is now the real one (0.75).** The old 0.85 had been needed to reach Grozny by the article's 24 September. With the corrections the real share gives a median of 2 October, and 0.85 would now give 3 September. The step "More of the south's effort to the Caucasus" goes.

| Scenario (500 runs) | Version 76 | Version 77 |
|---|---|---|
| Moscow falls in 1941 | 2% | 14% |
| Moscow falls in 1942 | 68% | 79% (median 23 June) |
| Leningrad capitulates | 61% | 99% (median 15 March) |
| Stalingrad falls | 66% | 99% |
| Grozny reached | 73% | 90% (median 2 October) |
| November counter-offensive breaks through | 3% | 0% |

Stops of the lines control for the scenario's forces (500 runs; `node tools/lines.js`):

| Stop | Days each line holds | Moscow falls 1942 | Stalingrad falls | November counter-offensive succeeds | Pool covers |
|---|---|---|---|---|---|
| None | – | 79% | 99% | 0% | – |
| Very plausible | 6–12 | 55% | 78% | 1% | 100% |
| Plausible | 4–11 | 51% | 48% | 3% | 89% |
| Possible | 6–9 | 56% | 45% | 3% | 68% |

With the echelon no longer counted twice, the pool for the lines is smaller. "Plausible" and "Possible" are thinned, and asking for every line no longer buys more than asking for most of them.

## Version 76

**Fuel for 1942 has its own lever.** The old fuel lever is now 1941 only.

- **1941: 1.05 net, as before.** In 1941 the limit at the front was the railways and the lorry columns, not the oil in the Reich, so a year of free trade adds little.
- **1942: 1.2 net.** By 1942 the real shortage was absolute. The Reich's stocks had been run down to the working minimum by the end of 1941 (below 800,000 tons), its use of motor fuel fell by about a sixth in 1942, and Army Group A was repeatedly held up for want of petrol in the Caucasus. The scenario's Germany trades freely overseas and escapes most of that: 1.2 restores the consumption of 1941 (2.5 million tons of motor gasoline against 2.1 million in 1942). The single railway through Rostov is the reason for no more.
- **How much arrives is uncertain.** Foreign exchange, tankers and the railways east all limit it. In each run the 1942 gain over 1941's setting (or over the real, if 1941's is below it) is multiplied by a factor drawn between 0.4 and 1.6, so the scenario's 1.2 means 1.11 to 1.29 at the front. A 1942 setting at or below either is taken as it is, so the real 1942 value is never moved.

It tells in the Caucasus and hardly anywhere else. The 1942 attack on Moscow is a set-piece battle, and fuel does not decide it.

| Scenario (500 runs) | Version 75 | Version 76 |
|---|---|---|
| Grozny reached | 64% | 73% |
| Grozny reached by 30 September | 35% | 57% |
| Stalingrad falls | 65% | 66% |
| Moscow falls in 1942 | 68% | 68% |
| Leningrad capitulates | 61% | 61% |
| Derbent reached | 16% | 24% |

The gain in depth is small: a median of about 7 km by December, and about 10 km in September. The share reaching Grozny moves as much as it does because in a quarter of the runs the branch's supply had left it within 10 km of the town.

**The Derbent gap is corrected.** Beyond Grozny the Caucasus branch moves at about a third of the open pace, but it had kept the open pace for the rest of the month in which it passed Grozny. In the 163 of 500 scenario runs this touches, it had added a median of 24 km by the end of 1942 (7–35 km in most, at most 114). The month's events are now dated by the time taken to reach them. The correction alone takes the scenario's median depth at the end of 1942 from 688 km to 663; the 1942 fuel brings it to 668.

**A note on what the model leaves out** is added to *How the model works* (see Limits, below).

With the 1942 fuel set equal to 1941's, every run is the same as in Version 75, apart from the Caucasus correction. The calibrated real run is unchanged.

## Version 75

**One control for the Soviet defensive lines.** It has four stops: None (as in 1941), Very plausible, Plausible and Possible. **Customize lines** opens the seven lines to man each one yourself, not at all, thinly or strongly:

- on the road to Leningrad: the Dvina, and the Velikaya (the Stalin Line at Ostrov and Pskov);
- on the road to Moscow: the Minsk fortified region, and the Dvina–Dnieper (Vitebsk, Orsha, Mogilev);
- in the south: Dubno and Rovno, the Stalin Line in the Ukraine, and the Dnieper below Kiev.

How long each line holds is worked out in each run rather than set by hand:

- **Men.** The lines draw on one pool of second-echelon divisions. The pool is the real second strategic echelon (some 57 divisions), plus one division for every 18,000 men in the west above the real 2.9 million (from Version 77, beyond the second echelon's own 670,000 as well). Without the alert only half of it is in place in time. If the lines chosen need more than the pool, every line is thinned.
- **Balance of forces.** A held line is a set-piece attack for the Germans, so its days follow the balance of forces on the day it is reached, and the Stavka's weight on that axis.
- **German supply.** An attacker with his supply in hand breaks a line faster than one at the end of it.
- **Early failure.** Each line may give way early: bridges taken intact, a flank turned, or a stand-fast order that makes it a pocket. Its men are then cut off, and taken prisoner. This is less likely with the alert's prepared demolitions and when the line is strongly manned.

While a line holds, the Germans lose men faster on that axis. The page reports the days each line held, and how often it gave way early.

**The scenario preset is None.** The week on the Dvina of earlier versions is gone, so Leningrad now capitulates in about three runs in five rather than a little over half. With no lines, the model gives the same results as Version 74 for the same draws.

For the real army of 1941, without the alert, the pool covers only 30–76 per cent of what the lines need: they hold 1–9 days, and a fifth to three-fifths of them give way early.

## Version 74

- **The year 1943 is left out.**
- **Lines held for a set number of weeks** (replaced in Version 75).
- **Kharkov, May 1942:** a Soviet victory where the city never fell is no longer called a retaking.

## Files

| File | What it is |
|---|---|
| `index.html` | The page. |
| `model.js` | The model; runs in the browser (`window.EFModel`) and in Node. |
| `tools/calibration.js` | The real run against the real checkpoints: `node tools/calibration.js` (`-v` prints the months). Two small misses are known: the Centre's depth in December 1941 (956 km against 1,000) and Mozdok (8 days late). |
| `tools/scenario.js` | Reality and the scenario through the Monte Carlo: `node tools/scenario.js`. Add lever changes as JSON to run the scenario with them, e.g. `node tools/scenario.js '{"ln_dvinaDnieper":1,"ln_stalinLine":0.5}'`. |
| `tools/levers.js` | Moves each lever one at a time from the scenario and prints the main outcomes, the 1941 and 1942 fuel among them: `node tools/levers.js`. |
| `tools/lines.js` | The four stops of the lines control for reality and the scenario: days held, early failures, the reserve pool, outcomes: `node tools/lines.js`. |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are. |

## Publishing on GitHub Pages

1. Create a repository and upload all the files in this folder to its top level. Keep `tools/` as a folder and include `.nojekyll`.
2. In **Settings → Pages**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, and save.
3. After a minute or two the page is live at `https://<your-user-name>.github.io/<repository>/`.

## Limits

Some judgements are not calibrated against anything real:

- how fast a set-piece attack on a defended front moves (set so that the real 1942 German army would take Moscow about half the time at the default defences);
- the threshold at which Moscow falls in 1941 (80 km beyond the real halt);
- how long a manned Soviet line holds, how often it gives way early, and the size of the reserve pool;
- the attacker's extra cost while he breaks a line;
- how much of the 1942 fuel gain reaches the front;
- the size of the second echelon (670,000 men) and the length of the alert's effects (40 days).

The scenario now leaves little spread: Leningrad and Stalingrad fall in nearly every run, and the November counter-offensive almost never succeeds. That fits the article, but small changes to the settings show more than the bare percentages.

Within 1941 the prisoners come somewhat early. The year's total matches the real one, but the frontier battles take too many and Kiev too few, so whatever acts in the first weeks (the alert, the frontier lines) works on too large a number.

The model counts material as men, tanks, aircraft and lorries, and as supply reach. It does not count how well each is supplied in the field. The peace eased German shortages that it leaves out:

- spare parts and engines for the panzer divisions;
- tyres;
- tungsten-cored anti-tank shot, one of the few answers to the T-34 and KV in 1941;
- the aircrew the Luftwaffe kept by not fighting over Britain in 1940;
- the fuel that the German mobile reserves behind the Don lacked in November 1942 (fuel enters the model only through the supply reach).

It also leaves out the shortage of shells that a greater loss of factories would bring the Red Army (the model cuts only its tanks and aircraft), and the lorries and radios that Lend-Lease brought the real Red Army from late 1942, which the scenario's Red Army lacks. All of these favour Germany in the scenario, so in this respect the model, if anything, understates the German side.

The model does not take Leningrad by assault, and it does not decide: the decisions are levers. It checks the scenario's internal consistency; it does not forecast.

## Sources

- Krivosheev: Soviet losses by operation and quarter.
- Halder and Stahel: German casualties.
- Bekker: Luftwaffe losses.
- Zaloga: tank stocks.
- The United States Strategic Bombing Survey: German oil production, imports and consumption.
- Glantz and House: strengths.
- The real dates of the operations.
