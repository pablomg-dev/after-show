# Aftershow 🎫

> Your ticket doesn't disappear. It becomes history.

🔗 **Live Demo:** [after-show.vercel.app](https://after-show.vercel.app)

Aftershow is the fan engagement layer built on top of the [KYD Labs](https://kydlabs.com) / [TIX](https://tix.xyz) protocol. 
When a fan attends an event powered by KYD, their ticket doesn't die at the door — 
Aftershow converts it into a unique on-chain collectible NFT, building a permanent, 
provable cultural passport on Solana.

Built for the [Solana Graveyard Hackathon](https://solana.com/graveyard-hack) — 
KYD Labs Ticketing category.

## The Problem

TIX solves the financial side of live events — giving venues upfront capital and 
artists control over their ticket sales. But what happens to the fan after the show?

The ticket disappears. There's no on-chain proof you were there, no collectible 
memory, no lasting connection between fans and the artists they love. The fan 
experience ends when the lights come on.

## The Solution

Aftershow is the missing fan layer for the KYD/TIX ecosystem. It converts 
post-event KYD tickets into unique generative NFTs minted on Solana — 
each one a one-of-a-kind digital memento with verified event metadata 
that lives forever on-chain.

Think of it as the $TIX reward token made real: just like airline miles reward 
loyal travelers, Aftershow NFTs reward fans for showing up — building a 
verifiable history of their live event experiences.

## How It Works

1. **Verify** — Enter your KYD ticket ID to confirm attendance
2. **Generate** — Unique generative artwork is created from your event data
3. **Mint** — Your Aftershow NFT is minted on Solana and sent to your wallet
4. **Collect** — Build your Cultural Passport: a public profile proving every event you've attended

## Why KYD + TIX

KYD Labs is the largest on-chain ticketing platform in the world, backed by 
a16z Crypto, having processed over $10M in ticket sales and $2M in venue 
financing with zero defaults. Their TIX protocol — launched at Solana Breakpoint 
2025 — turns tickets into RWAs that replace opaque loan agreements and give 
artists and venues full financial control.

Aftershow complements this vision by closing the loop on the fan side:

| Layer | Protocol | What it solves |
|-------|----------|----------------|
| Financing | TIX | Venues get upfront capital, artists keep their data |
| Ticketing | KYD | Direct-to-fan sales, resale control, fan insights |
| **Fan rewards** | **Aftershow** | **Fans get on-chain proof and collectibles post-event** |

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
| KYD-2026-001 | Charli XCX | Le Poisson Rouge | New York |
| KYD-2026-002 | Travis Scott | Le Poisson Rouge | New York |
| KYD-2026-003 | Dillon Francis | Brooklyn Mirage | New York |
| KYD-2026-004 | Robert Plant | Radio City Music Hall | New York |
| KYD-2026-005 | Charli XCX | The Fonda Theatre | Los Angeles |
| KYD-2026-006 | Dillon Francis | Exchange LA | Los Angeles |

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

## Roadmap

- [ ] Integration with live KYD/TIX API when available on mainnet (Summer 2026)
- [ ] $TIX token rewards for fans who collect Aftershow NFTs
- [ ] Artist-customizable artwork templates per event
- [ ] Transferable Aftershow NFTs with resale royalties back to artists
- [ ] Mobile app for scanning and instant claiming at the venue door

## License

MIT
```