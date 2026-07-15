#!/usr/bin/env node
/**
 * Run: node scripts/generate-vapid-keys.js
 * Paste the output into your-trip-web/.env.local
 */
const crypto = require("crypto");

async function main() {
  // Generate EC key pair for VAPID
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
    publicKeyEncoding: { type: "spki", format: "der" },
    privateKeyEncoding: { type: "pkcs8", format: "der" },
  });

  // VAPID keys are uncompressed EC public key (65 bytes) encoded as base64url
  // The SPKI DER has a fixed header of 26 bytes before the 65-byte key
  const pubRaw = publicKey.slice(26); // 65 bytes: 0x04 + 32 + 32
  const pubB64 = pubRaw.toString("base64url");

  // PKCS8 private key for VAPID — encode full DER as base64url
  const privB64 = privateKey.toString("base64url");

  console.log("\n✅ Add these to your-trip-web/.env.local:\n");
  console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${pubB64}`);
  console.log(`VAPID_PRIVATE_KEY=${privB64}`);
  console.log(`VAPID_SUBJECT=mailto:pakpoomtee24@gmail.com\n`);
}

main().catch(console.error);
