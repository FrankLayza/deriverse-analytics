import bs58 from "bs58";
import { readFileSync } from "fs";

// Load the numbers from your file
const keypairFile = readFileSync("./keys/new_user.json");
const keypairBytes = new Uint8Array(JSON.parse(keypairFile.toString()));

// Convert to the string format Phantom likes
const privateKeyString = bs58.encode(keypairBytes);

console.log("-----------------------------------------");
console.log("✅ YOUR PRIVATE KEY (BASE58):");
console.log(privateKeyString);
console.log("-----------------------------------------");
console.log("⚠️  Keep this secret! Anyone with this string can spend your SOL.");