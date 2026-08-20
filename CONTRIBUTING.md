# Contributing to Verity

Thanks for helping improve Verity. Keep changes small enough to review and
make the behavior of live mode explicit: blockchain reads and writes must use
the configured contract, while demo mode must stay local-only.

## Local workflow

```powershell
npm install
npm run check
```

Before opening a pull request, describe the user-facing behavior, include
tests for contract changes, and call out any required environment variables.
Never commit `.env.local`, private keys, deployment credentials, or generated
build output.
