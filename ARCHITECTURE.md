# Architecture

Verity has three deliberately separate layers:

1. `index.html`, `styles.css`, and `app.js` provide the browser experience.
   Live mode reads the configured contract through an EIP-1193 wallet; demo
   mode uses an in-memory presentation scenario and never sends transactions.
2. `contracts/ReputationPassport.sol` owns profile, issuer, credential,
   revocation, expiry, and evidence-hash rules. The contract is the authority
   for live records and score calculations.
3. `scripts/deploy.js` writes only public contract metadata to
   `public/deployment.json`. Secrets stay in local or hosted environment
   variables and are never bundled into the client.

Clerk authenticates the person using the interface. The connected wallet and
contract remain authoritative for blockchain actions, so an account session
cannot mint or issue on someone else’s behalf.
