# Eastern Front Model 1941–42

A calibrated model of the German–Soviet campaign from June 1941 to spring 1942, built for the Halifax alternate-history scenario. In the scenario Britain makes peace in 1940 and Germany invades on 1 June 1941.

The model starts from the real campaign. Its baseline is the real campaign, phase by phase and sector by sector:

- **Phases:** the frontier battles, the summer, and the autumn.
- **Sectors:** Army Groups North, Centre and South.
- **Baseline figures:** Krivosheev's Soviet losses, Halder's German casualties and Bekker's Luftwaffe losses.

The scenario changes only what the premise changes, and each change works through a stated mechanism. How strong each mechanism is remains uncertain, so every result is a range from 1,500 runs: the middle run, with the 10th to 90th percentile. With every assumption set to reality, the model returns the real figures.

The page covers:

- the 1941 campaign: losses, prisoners, equipment, dates and ground;
- the winter counter-offensive;
- the forces on 1 May 1942, the Soviet offensive towards Kharkov, and a German offensive on Moscow.

## Files

| File | What it is |
|---|---|
| `index.html` | The page: the assumptions, results tables and charts. |
| `model.js` | The model. It runs in the browser, where it defines `window.HalifaxModel`, and in Node. |
| `tools/test.js` | Checks that the real run reproduces the real baseline for any draw of the uncertain parameters. Run it with `node tools/test.js`. |
| `tools/montecarlo.js` | Prints reality against the scenario for the main outputs and writes `tools/mc_out.json`. Run it with `node tools/montecarlo.js`. |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are. |

## Publishing on GitHub Pages

1. Create a repository, for example `eastern-front-model`, and upload all the files in this folder to its top level, keeping `tools/` as a folder.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose the `main` branch and the `/ (root)` folder, and save.
4. After a minute or two the page is live at `https://<your-user-name>.github.io/eastern-front-model/`.

Pages from a public repository are visible to anyone with the address. With a free account, GitHub Pages needs a public repository.

## Running it locally

Open `index.html` in a browser. It needs no server and no build step. The fonts load from Google Fonts; without a connection the page falls back to system fonts.

## Limits

Two results are assumptions rather than findings:

- **The ground taken in 1941.** This is set by the supply limit: the real farthest advance plus a margin.
- **The pace of the 1942 Moscow offensive.** This depends chiefly on the assumed strength of the Moscow defences.

Several inputs are estimates; they are marked in `model.js`:

- some autumn equipment losses;
- the Soviet field strengths;
- the spring 1942 stocks;
- an approximate front line of May 1942.

The ranges cover the uncertain strength of each mechanism, not the model's structure. The model checks the scenario's internal consistency; it does not forecast what would have happened.

## Sources

- G. F. Krivosheev, *Soviet Casualties and Combat Losses in the Twentieth Century*: operations and quarters of 1941–42.
- F. Halder, war diary: German casualties for 1941. D. Stahel, for the winter of 1941–42.
- C. Bekker: Luftwaffe losses by period. S. Zaloga: Soviet tank stocks. D. Glantz and J. House: force strengths.
