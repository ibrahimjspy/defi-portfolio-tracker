/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type Token = {
  contractAddress: string;
  logo?: string;
  name?: string;
  symbol?: string;
  balance: number;
  usd?: number;
  usdValue?: number;
};

export default function Home() {
  const { address, isConnected } = useAccount();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setLoading(true);
      fetch(`/api/balances?address=${address}`)
        .then((res) => res.json())
        .then((data) => {
          setTokens(data.tokens || []);
          setLoading(false);
        });
    } else {
      setTokens([]);
    }
  }, [address]);

  // Total portfolio USD value
  const totalValue = tokens.reduce((sum, t) => sum + (t.usdValue || 0), 0);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fafbfc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'sans-serif',
        padding: 40,
      }}
    >
      <h1 style={{ fontWeight: 800, marginBottom: 20 }}>
        DeFi Portfolio Tracker
      </h1>
      <ConnectButton />
      {isConnected && (
        <div
          style={{
            width: '100%',
            maxWidth: 900,
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 4px 20px 0 #eaeaea',
            marginTop: 30,
            padding: 30,
          }}
        >
          <div
            style={{
              marginBottom: 20,
              fontSize: 18,
              fontWeight: 500,
            }}
          >
            <span style={{ color: '#888' }}>Connected:</span>{' '}
            <span style={{ fontFamily: 'monospace' }}>{address}</span>
          </div>

          <div style={{ margin: '16px 0', fontWeight: 700, fontSize: 20 }}>
            Total Portfolio Value: ${totalValue.toFixed(2)}
          </div>

          {loading && <div>Loading balances...</div>}

          {!loading && tokens.length === 0 && (
            <div style={{ color: '#888' }}>
              No tokens found for this address.
            </div>
          )}

          {tokens.length > 0 && totalValue > 0 && (
            <div
              style={{
                width: '100%',
                maxWidth: 400,
                height: 300,
                margin: '0 auto',
              }}
            >
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={tokens.filter((t) => t.usdValue && t.usdValue > 0)}
                    dataKey="usdValue"
                    nameKey="symbol"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={60}
                    label={({ name, percent }: any) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {tokens
                      .filter((t) => t.usdValue && t.usdValue > 0)
                      .map((_, idx) => (
                        <Cell key={`cell-${idx}`} />
                      ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `$${Number(value).toFixed(2)}`
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {!loading && tokens.length > 0 && (
            <div style={{ overflowX: 'auto', marginTop: 18 }}>
              <table
                style={{
                  borderCollapse: 'collapse',
                  width: '100%',
                  minWidth: 700,
                  fontSize: 16,
                }}
              >
                <thead>
                  <tr style={{ background: '#f3f6fa' }}>
                    <th style={thStyle}>Token</th>
                    <th style={thStyle}>Symbol</th>
                    <th style={thStyle}>Balance</th>
                    <th style={thStyle}>USD Price</th>
                    <th style={thStyle}>USD Value</th>
                    <th style={thStyle}>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens
                    .sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0))
                    .map((t, i) => (
                      <tr
                        key={t.contractAddress}
                        style={i % 2 ? rowAlt : undefined}
                      >
                        <td style={tdStyle}>
                          {t.logo && (
                            <img
                              src={t.logo}
                              alt=""
                              width={28}
                              style={{
                                borderRadius: 6,
                                verticalAlign: 'middle',
                                marginRight: 8,
                              }}
                            />
                          )}
                          {t.name}
                        </td>
                        <td style={tdStyle}>{t.symbol}</td>
                        <td style={tdStyle}>
                          {Number(t.balance).toLocaleString()}
                        </td>
                        <td style={tdStyle}>
                          {typeof t.usd === 'number'
                            ? `$${t.usd.toFixed(2)}`
                            : '-'}
                        </td>
                        <td style={tdStyle}>
                          {typeof t.usdValue === 'number'
                            ? `$${t.usdValue.toFixed(2)}`
                            : '-'}
                        </td>
                        <td
                          style={{
                            ...tdStyle,
                            fontFamily: 'monospace',
                            fontSize: 13,
                          }}
                        >
                          {t.contractAddress}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

// Simple styles for table
const thStyle: React.CSSProperties = {
  padding: '12px 8px',
  textAlign: 'left',
  borderBottom: '2px solid #eaeaea',
};
const tdStyle: React.CSSProperties = {
  padding: '8px',
  borderBottom: '1px solid #f2f2f2',
};
const rowAlt: React.CSSProperties = {
  background: '#fafbfc',
};
