// src/utils/extract.js

const CA_RE = /0x[a-fA-F0-9]{40}/;

export function extractAddressFrom(text = "") {
  if (!text) return null;

  // 1) raw 0x…40
  const raw = text.match(CA_RE);
  if (raw) return raw[0];

  // 2) common URLs containing the CA in path or query
  const patterns = [
    /dexscreener\.com\/[^\/]+\/0x[a-fA-F0-9]{40}/i,
    /dextools\.io\/app\/[^\/]+\/pair-explorer\/0x[a-fA-F0-9]{40}/i,
    /etherscan\.io\/token\/0x[a-fA-F0-9]{40}/i,
    /arbiscan\.io\/token\/0x[a-fA-F0-9]{40}/i,
    /bscscan\.com\/token\/0x[a-fA-F0-9]{40}/i,
    /basescan\.org\/token\/0x[a-fA-F0-9]{40}/i,
    /optimistic\.etherscan\.io\/token\/0x[a-fA-F0-9]{40}/i,
    /polygonscan\.com\/token\/0x[a-fA-F0-9]{40}/i,
    /app\.uniswap\.org\/#\/tokens\/[^\/]+\/0x[a-fA-F0-9]{40}/i
  ];

  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const m2 = m[0].match(CA_RE);
      if (m2) return m2[0];
    }
  }
  return null;
}
