# Security policy

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Contact the
repository owner privately with reproduction steps, affected files, and the
potential impact.

## Handling secrets

Never commit Clerk secret keys, deployer private keys, RPC credentials, or
wallet seed phrases. Browser builds may contain only a Clerk publishable key.
If a secret is exposed, revoke it immediately and replace it before deploying.
