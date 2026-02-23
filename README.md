# Aftershow 🎫

> Your ticket doesn't disappear. It becomes history.

Aftershow transforms used event tickets into on-chain collectible NFTs on Solana. 
Fans "burn" their ticket and receive a unique Aftershow NFT with verified event 
metadata — building a permanent, provable cultural passport.

Built for the [Solana Graveyard Hackathon](https://solana.com/graveyard-hack) — 
KYD Labs Ticketing category.

## The Problem

Event tickets die the moment the show ends. There's no on-chain proof you were 
there, no collectible memory, no lasting connection between fans and the artists 
they love.

## The Solution

Aftershow converts post-event tickets into unique generative NFTs minted on Solana. 
Each NFT features algorithmically generated artwork derived from the event data, 
creating a one-of-a-kind digital memento that lives forever on-chain.

## How It Works

1. **Verify** — Enter your KYD ticket ID to confirm attendance
2. **Generate** — We create unique generative artwork based on your event
3. **Mint** — Your Aftershow NFT is minted on Solana devnet and sent to your wallet
4. **Collect** — Build your Cultural Passport: a public profile showing every event you've attended

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Blockchain:** Solana (devnet), @solana/web3.js
- **NFTs:** @metaplex-foundation/umi, @metaplex-foundation/mpl-token-metadata
- **Wallet:** @solana/wallet-adapter-react

## Getting Started
```bash
npm install
node scripts/generate-mint-keypair.mjs   # copy output to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

For full setup instructions including environment variables and devnet 
configuration, see [SETUP.md](./SETUP.md).

## Demo Tickets

Use these ticket IDs to test the full claim flow:

| Ticket ID | Artist | Venue | City |
|-----------|--------|-------|------|
| KYD-2026-001 | Bad Bunny | Estadio Monumental | Buenos Aires |
| KYD-2026-002 | Beyoncé | River Plate | Buenos Aires |
| KYD-2026-003 | Indio Solari | ... | ... |
| KYD-2026-004 | Ultra Music Festival | ... | ... |
| KYD-2026-005 | Lady Gaga | ... | ... |
| KYD-2026-006 | Herbie Hancock | ... | ... |

## Project Structure
```
src/
  app/
    page.tsx              → Landing page
    claim/page.tsx        → 3-step claim wizard
    profile/[wallet]/     → Fan's public NFT collection
    api/
      verify-ticket/      → KYD ticket verification
      mint-aftershow/     → NFT minting endpoint
  components/
    AfterShowCard.tsx     → NFT card component
    ClaimFlow.tsx         → Claim wizard
    EventPassport.tsx     → Fan profile grid
    ArtworkGenerator.tsx  → Generative SVG artwork
  lib/
    mock-tickets.ts       → Demo KYD tickets
    artwork.ts            → Artwork generation logic
```

## License

MIT