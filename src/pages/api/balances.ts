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

// Helper: get Alchemy endpoint by chain
function getAlchemyEndpoint(chain: string, apiKeys: Record<string, string>) {
  switch (chain) {
    case 'sepolia':
      return `https://eth-sepolia.g.alchemy.com/v2/${apiKeys.sepolia}`;
    case 'goerli':
      return `https://eth-goerli.g.alchemy.com/v2/${apiKeys.goerli}`;
    case 'mainnet':
    default:
      return `https://eth-mainnet.g.alchemy.com/v2/${apiKeys.mainnet}`;
  }
}

// Helper: Fetch token metadata from Alchemy
async function getTokenMetadata(
  contractAddress: string,
  apiKey: string,
  chain: string = 'mainnet',
): Promise<TokenMetadata> {
  let baseUrl = '';
  switch (chain) {
    case 'sepolia':
      baseUrl = `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
      break;
    case 'goerli':
      baseUrl = `https://eth-goerli.g.alchemy.com/v2/${apiKey}`;
      break;
    case 'mainnet':
    default:
      baseUrl = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
      break;
  }
  const data = {
    jsonrpc: '2.0',
    id: 1,
    method: 'alchemy_getTokenMetadata',
    params: [contractAddress],
  };
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  return json.result;
}

// Helper: Fetch USD prices from CoinGecko (works for mainnet tokens only)
async function fetchTokenPrices(
  tokenAddresses: string[],
  chain: string,
): Promise<Record<string, { usd: number }>> {
  if (!tokenAddresses.length || chain !== 'mainnet') return {}; // Only fetch for mainnet
  const ids = tokenAddresses.join(',');
  const url = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${ids}&vs_currencies=usd`;
  const res = await fetch(url);
  const json = await res.json();
  return json; // { [address]: { usd: price } }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { address, chain = 'mainnet' } = req.query;
  // Load API keys from environment variables
  const apiKeys: Record<string, string> = {
    mainnet: process.env.ALCHEMY_API_KEY as string,
    sepolia: process.env.ALCHEMY_SEPOLIA_API_KEY as string,
    goerli: process.env.ALCHEMY_GOERLI_API_KEY as string,
  };

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid address' });
  }
  if (!apiKeys[chain as string]) {
    return res
      .status(400)
      .json({ error: 'Missing Alchemy key for this chain' });
  }

  // Get token balances
  const url = getAlchemyEndpoint(chain as string, apiKeys);
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
      const meta = await getTokenMetadata(
        t.contractAddress,
        apiKeys[chain as string],
        chain as string,
      );
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

  // Fetch USD prices (only mainnet)
  const tokenAddresses = filteredTokens.map((t) =>
    t.contractAddress.toLowerCase(),
  );
  const prices = await fetchTokenPrices(tokenAddresses, chain as string);

  // Add price info to each token (USD value for mainnet, 0 for testnets)
  const tokensWithPrices: TokenEnriched[] = filteredTokens.map((token) => ({
    ...token,
    usd: prices[token.contractAddress.toLowerCase()]?.usd || 0,
    usdValue:
      token.balance * (prices[token.contractAddress.toLowerCase()]?.usd || 0),
  }));

  res.status(200).json({ address, tokens: tokensWithPrices, chain });
}
