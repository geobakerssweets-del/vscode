# Falcon (Next.js)
npm install && npm run dev  → http://localhost:3000
DB_MODE=json  uses data/db.json. DB_MODE=mongo uses MONGODB_URI (seeds itself from data/db.json on first run). Edit .env.local to switch.
Login: click your name on the sign-in screen, then enter your PIN (all default users use 1234). Set the till label shown on that screen with a `till` field on the `shop` record in settings (default T1). Change passwords in Tools -> Change Password. Set AUTH_SECRET in .env.local.

Sales Return: Sales tab → Sales Return. Scan or search the item coming back (F2 / F3), set the reason per line (→ key), F5 switches CASH / CREDIT, F9 saves. Optionally enter the original Sales Inv # to check items against that bill (can't return more than was sold; the bill's discount carries over). Returned items go back into stock; CREDIT returns reduce the customer's balance.
The on-screen number pad appears on the sign-in PIN screen and in the admin-approval box.
