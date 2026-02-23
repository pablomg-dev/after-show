#!/usr/bin/env node
/**
 * Generates a keypair for MINT_AUTHORITY_SECRET_KEY.
 * Usage: node scripts/generate-mint-keypair.mjs
 * Copy the printed line and paste it into .env.local as MINT_AUTHORITY_SECRET_KEY=...
 */

import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate();
const secretKeyArray = Array.from(keypair.secretKey);

console.log("\nPaste this line into your .env.local:\n");
console.log("MINT_AUTHORITY_SECRET_KEY=" + JSON.stringify(secretKeyArray));
console.log("\nPublic key (to receive SOL on devnet):", keypair.publicKey.toBase58());
console.log("\nDevnet faucet: https://faucet.solana.com\n");