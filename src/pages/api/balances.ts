/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';

type TokenMetadata = {
  decimals?: number;
  logo?: string;
  name?: string;
  symbol?: string;
  [key: string]: any;
};

type TokenBalance = {
  contractAddress: string;
  tokenBalance: string;
  [key: string]: any;
};

type TokenEnriched = TokenBalance &
  TokenMetadata & {
    balance: number;
    usd?: number;
    usdValue?: number;
  };

// Helper: Fetch token metadata from Alchemy
async function getTokenMetadata(
  contractAddress: string,
  apiKey: string,
): Promise<TokenMetadata> {
  const url = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
  const data = {
    jsonrpc: '2.0',
    id: 1,
    method: 'alchemy_getTokenMetadata',
    params: [contractAddress],
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  return json.result;
}

// Helper: Fetch USD prices from CoinGecko
async function fetchTokenPrices(
  tokenAddresses: string[],
): Promise<Record<string, { usd: number }>> {
  if (!tokenAddresses.length) return {};
  const ids = tokenAddresses.join(',');
  const url = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${ids}&vs_currencies=usd`;
  const res = await fetch(url);
  const json = await res.json();
  return json; // { [address]: { usd: price } }
}

// Main handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { address } = req.query;
  const apiKey = process.env.ALCHEMY_API_KEY;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid address' });
  }

  // Get token balances
  const url = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
  const data = {
    jsonrpc: '2.0',
    id: 1,
    method: 'alchemy_getTokenBalances',
    params: [address],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await response.json();

  // Enrich with metadata
  const tokenBalances: TokenBalance[] = json.result.tokenBalances;
  const enrichedTokens: (TokenEnriched | null)[] = await Promise.all(
    tokenBalances.map(async (t) => {
      if (t.tokenBalance === '0x0' || t.tokenBalance === '0x') return null; // skip 0 balances
      const meta = await getTokenMetadata(t.contractAddress, apiKey as string);
      return {
        ...t,
        ...meta,
        balance:
          meta && meta.decimals
            ? parseInt(t.tokenBalance, 16) / 10 ** meta.decimals
            : parseInt(t.tokenBalance, 16),
      };
    }),
  );

  // Remove nulls (tokens with 0 balance)
  const filteredTokens: TokenEnriched[] = enrichedTokens.filter(
    Boolean,
  ) as TokenEnriched[];

  // Fetch USD prices from CoinGecko
  const tokenAddresses = filteredTokens.map((t) =>
    t.contractAddress.toLowerCase(),
  );
  const prices = await fetchTokenPrices(tokenAddresses);

  // Add price info to each token
  const tokensWithPrices: TokenEnriched[] = filteredTokens.map((token) => ({
    ...token,
    usd: prices[token.contractAddress.toLowerCase()]?.usd || 0,
    usdValue:
      token.balance * (prices[token.contractAddress.toLowerCase()]?.usd || 0),
  }));

  res.status(200).json({ address, tokens: tokensWithPrices });
}
