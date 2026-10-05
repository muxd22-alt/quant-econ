# Contributing to the Saudi Arabia Autonomous Economy Simulator

Thanks for helping improve the simulator. By participating you agree to our
[Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

- 🐛 **Bug reports** — use the [bug report form](https://github.com/muxd22-alt/UHI_SAUDI/issues/new/choose)
- 💡 **Feature ideas** — use the feature request form
- 🌍 **Translation** — every UI string lives in one dictionary (see below)
- ♿ **Accessibility** — use the accessibility barrier form
- 📊 **Model research** — better parameters, sources, or validation of the
  household-income streams
- 📝 **Docs** — README accuracy, examples, Arabic copy

## Development setup

The app is a **single static file with zero backend**. Any static server works:

```bash
git clone https://github.com/muxd22-alt/UHI_SAUDI.git
cd UHI_SAUDI
python -m http.server 8000
# open http://localhost:8000/docs/
```

You can also open `docs/index.html` directly from disk — the loader falls back
to the live World Bank API when the bundled snapshot cannot be read.

Useful entry points:

| Path | Purpose |
|------|---------|
| `docs/index.html` | The whole app: markup, CSS, i18n dictionary, data loader, simulation engine, chart layer |
| `docs/macro_data.json` | `indicators` (auto-refreshed) + `calibration` (hand-tuned model constants) |
| `scripts/fetch_worldbank.py` | Refreshes `indicators` only, never `calibration` |
| `.github/workflows/quarterly_update.yml` | Scheduled quarterly data refresh + JSON validation |

## Project conventions

1. **One dictionary, two languages.** Every key added under `LOCALE.en` must
   also exist under `LOCALE.ar` (and vice versa). The engine never renders raw
   English strings.
2. **Constant-USD core.** `simulate()` computes in USD. Currency conversion
   (`currentRatio()`, ×3.75 for SAR) happens only in the render layer. Never
   mutate scenario state because the language changed.
3. **Calibration ≠ indicators.** Live/API values belong in `indicators`.
   Model constants (base year, baseline GDP, household count, median income,
   PIF seed) belong in `calibration` and must only change deliberately, with
   the README milestone table updated in the same commit.
4. **Keep the default scenario reproducible.** The calibrated baseline is
   documented in the README (`$60,639 → $88,394 → $138,069`, PIF `$5.2T`,
   GDP `$3.4T`, `288%`). If a change moves those numbers, say so in the PR and
   update the table.
5. **Style.** Match the surrounding code: no build step, no framework, ES
   features that run in current Chrome/Firefox/Safari, logical CSS properties
   (`inset-inline-*`, `border-inline-*`) so RTL keeps working.
6. **Don't hand-edit `indicators`.** Regenerate instead:
   `python scripts/fetch_worldbank.py`.

## Testing your change

There is no unit-test framework yet; changes are validated by running the page.
Before opening a PR:

- [ ] `python scripts/fetch_worldbank.py` still writes valid JSON (if you touched it)
- [ ] Default KPIs still read **$60,639 / $88,394 / $138,069 / $5.2T / 288%**
      (or the README table is updated)
- [ ] Checked **English (LTR/USD)** and **Arabic (RTL/SAR)** — header, cards,
      chart tooltips, slider labels, footer
- [ ] Checked **both chart modes** and the legend chips
- [ ] Checked responsive layouts at **1600px, 768px and 430px** with no
      horizontal overflow
- [ ] Toggled every section switch and used the keyboard (`Tab` / `Enter` /
      `Space` / arrow keys on sliders)
- [ ] `docs/index.html` has no console errors on load
- [ ] If the API loader changed: tested snapshot, live-API and offline paths

A quick manual smoke test:

```bash
# syntax check of the inline script
python -c "import re;h=open('docs/index.html',encoding='utf-8').read();b=re.findall(r'<script(?![^>]*src=)[^>]*>(.*?)</script>',h,re.S);open('/tmp/app.js','w',encoding='utf-8').write(b[-1])"
node --check /tmp/app.js
```

## Pull requests

1. Fork and create a branch: `git checkout -b fix/short-description`
2. Make focused commits — small PRs are easier to review
3. Follow [Conventional Commits](https://www.conventionalcommits.org/):
   `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`
4. Fill in the pull request template
5. Link the issue with `Closes #123`

Maintainers may ask for changes before merging, mostly around bilingual
coverage and model-output stability.

## Commit signing (optional)

Signed commits are appreciated but not required. If you use them,
`git commit -S` works with the existing workflow.
