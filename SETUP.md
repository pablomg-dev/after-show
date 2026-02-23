# Setup Guide — Aftershow

## Prerequisites

- Node.js 18+
- npm 9+
- A Solana wallet browser extension (Phantom or Solflare) for testing the claim flow

---

## 1. Install Dependencies
```bash
npm install
```

That's it. No workspaces or extra steps. All dependencies (Next.js, Solana, 
Metaplex UMI, wallet adapters) are installed with this single command.

---

## 2. Environment Variables

Create a `.env.local` file in the project root:
```bash
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
MINT_AUTHORITY_SECRET_KEY=        # see step 3
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Generate the Mint Authority Keypair

The server needs a keypair to sign and pay for NFT minting on devnet. 
Without this, minting will fail.

### Option A: Using the included script (recommended)
```bash
node scripts/generate-mint-keypair.mjs
```

The script will print something like:
```
✓ Keypair generated
Public key:  8GTpFqs7GhAHBJNPN8mdrcf41JqUxsH5ZAxvYFBmbyRE
MINT_AUTHORITY_SECRET_KEY=[12,34,...,64]
```

Copy the `MINT_AUTHORITY_SECRET_KEY=...` line into your `.env.local`.  
Save the public key — you'll need it to fund the wallet in step 4.

### Option B: Using Solana CLI

If you have the [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) installed:
```bash
solana-keygen new --outfile mint-authority.json --no-bip39-passphrase
```

Then add the contents to `.env.local`:
```bash
# Linux/macOS
echo "MINT_AUTHORITY_SECRET_KEY=$(cat mint-authority.json)" >> .env.local

# Windows (PowerShell)
$json = Get-Content mint-authority.json -Raw
echo "MINT_AUTHORITY_SECRET_KEY=$json" >> .env.local
```

> ⚠️ Never commit `mint-authority.json` or `.env.local` to git. 
> Both are already in `.gitignore`.

---

## 4. Fund the Mint Authority Wallet (Devnet)

The mint authority wallet needs devnet SOL to pay for transaction fees.

1. Go to **[faucet.solana.com](https://faucet.solana.com)**
2. Select **Devnet**
3. Paste the public key from step 3
4. Request SOL (2 SOL is enough for hundreds of test mints)

---

## 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To test the full flow, use any of the demo ticket IDs from the 
[README](./README.md#demo-tickets) (e.g. `KYD-2026-001`).

---

## Troubleshooting

**Minting is slow or timing out**  
The public devnet RPC can be rate-limited. Try a free dedicated devnet 
RPC from [Helius](https://helius.dev) or [QuickNode](https://quicknode.com) 
and update `NEXT_PUBLIC_SOLANA_RPC_URL` in your `.env.local`.

**Metaplex UMI compatibility errors**  
If you see type errors with `@metaplex-foundation/umi`, switch to the legacy 
SDK by replacing the minting logic in `src/lib/solana.ts` with 
`@metaplex-foundation/js` using `metaplex.nfts().create()`.

**Claimed tickets reset between requests**  
This is expected. Ticket state is stored in memory on the server — 
no database is used. Restarting the dev server resets all claimed tickets.

**Wallet not connecting**  
Make sure you have Phantom or Solflare installed and set to Devnet network 
in the wallet settings.

---

## Quick Checklist

- [ ] `npm install`
- [ ] Generated keypair → `MINT_AUTHORITY_SECRET_KEY` in `.env.local`
- [ ] Funded mint authority wallet via faucet
- [ ] `npm run dev` running
- [ ] Tested claim flow with a demo ticket ID