# Styles

| Where | What lives there |
| --- | --- |
| `app/globals.css` | Global only: theme variables (light/dark + shared palette), reset and base elements, buttons/inputs/tables base styles, frame elements (`aside`, `section`, `footer`, `.ptitle`), utilities (`.grow`, `.num`, `.mono`, `.empty`, `.ok`, `.rerr`, `.soon`, `.hint`, `.pri`, `.flip`), state classes and the print / PDF sheet. |
| `app/styles/*.module.css` | One CSS Module per area. Imported in `app/page.js` as `cssLayout`, `cssHeader`, `cssSearch`, `cssRibbon`, `cssSidebar`, `cssSurfaces`, `cssButtons`, `cssForms`, `cssTables`, `cssModals`, `cssReceipt`, `cssDashboard`, `cssCash`, `cssSales`, `cssPurchase`, `cssProducts`, `cssReports`, `cssSettings`. |
| `app/login/login.module.css` | Sign-in screen (`cssLogin`). |
| `components/NumPad.module.css` | On-screen number pad (`cssNumpad`). |

Shared building blocks: **buttons**, **forms**, **tables**, **modals**, **surfaces**, **receipt**, **search**.
Screens: **sales**, **purchase**, **cash**, **reports**, **dashboard**, **products**, **settings**.
Shell: **layout**, **header**, **ribbon**, **sidebar**.

## Conventions

* A class that belongs to one area is written `cssArea.name` in JSX (`className={cssSales.bl}`).
* Words that act as *state or size flags* (`on`, `sel`, `act`, `cur`, `done`, `wide`, `sm`, `big`, `neg`, `net`, `pay`, `red`, `blue`, `warn`, `ok`, `Create`, `Credit`, `CASH`, `CREDIT` …) stay plain strings, because they are combined with a module class and some of them are chosen at run time. In a module they are written `:global(.on)`: `.rb:global(.on) { … }`.
* A few classes also keep a plain twin next to the module class (`` `${cssTables.rlines} rlines` ``): `app`, `rrow` (found by `document.querySelector`), and `hf`, `mhead`, `phx`, `npad`, `rt` (targeted by a rule that lives in another module, e.g. `:global(.mhead) .px`). Do not remove the plain word.
* Shared colours, radii and the accent fallback are variables in `globals.css` (`--c-border`, `--c-border-input`, `--c-text-soft`, `--r-sm`, `--r-md`, `--r-lg`, `--r-xl`, `--r-pill`, `--ac-default`, `--dk-*`). The accent for the current tab is `--ac` (set inline on the app root); `--pri` is the user's colour choice.
* **Import order matters.** The imports at the top of `app/page.js` fix the order in which module stylesheets load; rules of equal specificity are resolved by that order. Keep it as it is, and put new modules at the end.
* CSS Modules need every selector to contain at least one local class. Element-only rules (`table`, `th`, `button`, `aside` …) therefore stay in `globals.css`.
