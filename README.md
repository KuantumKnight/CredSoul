# Verity Reputation Passport

This is a real wallet-connected MVP for the Dynamic Soulbound Reputation NFT System.

## Live mode

Live mode has no seeded records. It reads and writes to the deployed `ReputationPassport` contract through an EIP-1193 wallet such as MetaMask.

The frontend also uses Clerk for account authentication. Add the publishable key to `.env.local`; the Clerk secret key is intentionally not used by this browser-only app and must never be placed in a `VITE_` variable.

```powershell
npm install
npm run compile
```

For a local blockchain demo:

```powershell
# terminal 1
npm run chain

# terminal 2
npm run deploy
npm run dev
```

After starting Vite, sign up or sign in from the top-right control, then connect the wallet. The app links the verified wallet address to the signed-in Clerk user metadata and still uses the wallet signature/contract as the authority for blockchain actions.

Import one of the Hardhat node's printed private keys into MetaMask and add `http://127.0.0.1:8545` as a custom network with chain ID `31337`. The deploy command writes the live contract address to `public/deployment.json`.

For a public testnet deployment, use Sepolia. Keep the deployer key local or in
an encrypted CI/Vercel secret; never paste it into chat and never use a `VITE_`
prefix:

```powershell
$env:SEPOLIA_RPC_URL = "https://your-sepolia-rpc.example"
$env:DEPLOYER_PRIVATE_KEY = "0x..."
npx hardhat run scripts/deploy.js --network sepolia
```

Fund the deployer wallet with Sepolia ETH first. Commit the generated
`public/deployment.json` after deployment; it contains only the public contract
address, chain metadata, and RPC URL. Then add `VITE_CLERK_PUBLISHABLE_KEY` to
Vercel Project Settings → Environment Variables and redeploy.

The contract supports:

- one ERC-721 soulbound profile per wallet;
- approved issuers creating student-owned passports and paying the minting gas;
- administrator-controlled issuer requests and approval;
- issuer-only credential issuance and revocation;
- duplicate prevention;
- expiry-aware reputation calculation;
- evidence SHA-256 fingerprints;
- public credential reads and evidence verification.

## Institution-paid student onboarding

An approved organization such as VIT can open **Issuer console → Create a
student passport**, enter a student-confirmed wallet address, and confirm the
transaction. The issuer pays gas, while the NFT is minted directly into the
student's wallet. Creating a passport adds no reputation points; credentials
must be issued separately. The student does not need to sign or pay for the
issuer's minting transaction.

Only verified issuers can call `createProfileFor(recipient)`. Zero addresses
and existing passport holders are rejected. Student self-creation remains
available, and both paths share the one-passport and non-transferability rules.
The `ProfileCreatedFor` event records which issuer created the passport.
The institution is responsible for verifying the student's wallet association;
minting does not itself verify a real-world identity.

Existing deployed contracts do not gain new functions when source files change.
To use this feature on the local chain, run `npm run deploy`, then reload the
app. This creates a fresh contract; existing records remain at the old contract
address and are not migrated. The new contract's owner must approve the issuer
again. Demo mode simulates onboarding without transactions and resets sample
passports when leaving demo mode.

## Demo mode

Click `Live mode` in the top bar to explicitly switch to `Demo mode`. Demo mode seeds a local presentation scenario containing active, expired, and revoked credentials so the complete PRD flow can be shown without signing transactions. Demo data is never sent to a chain and is discarded when switching back to live mode.

## Verification

```powershell
npm run check
```

The same command runs Solidity compilation, contract tests, and the
production Vite build. GitHub Actions runs it on pushes and pull requests.

## Troubleshooting

- If Live mode says the contract is not configured, run the deploy script and
  check `public/deployment.json`.
- If MetaMask reports the wrong network, switch to the chain ID shown by the
  network pill.
- If account linking is unavailable, confirm that only the Clerk publishable
  key is present in the Vite environment and that the account is signed in.
