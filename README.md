# DeFi Portfolio Tracker

A modern DeFi Portfolio Tracker web app built with **Next.js**, **RainbowKit**, **wagmi**, **Alchemy**, and **CoinGecko**.
Tracks your wallet’s ERC-20 token balances and their live USD value, showing portfolio allocation and analytics—**all in your browser**.

---

## **Features**

* 🔗 **Connect Wallet**: Supports MetaMask and WalletConnect via RainbowKit
* 🪙 **View ERC-20 & Native Balances**: Reads all assets for your connected wallet
* 💵 **USD Value & Price Fetch**: Uses CoinGecko for live prices
* 📊 **Pie Chart**: Visualize portfolio allocation per token
* 📈 **Total Portfolio Value**: See your current net worth in USD
* 🏷️ **Token Metadata**: Shows name, symbol, logo, and contract address
* ⚡️ **Fast & Secure**: No keys or tokens stored, fetches via serverless Next.js API
* 💻 **Open Source**: MIT License

---

## **Tech Stack**

* **Next.js** (App Router or Pages, easy SSR)
* **React** (UI & state management)
* **RainbowKit** + **wagmi**: Wallet connect hooks
* **Alchemy**: Blockchain RPC, token balances, metadata
* **CoinGecko API**: Live ERC-20 prices (public, free)
* **Recharts**: For data visualization (pie/donut chart)
* **TypeScript**: Full type safety

---

## **Quickstart**

1. **Clone the Repo**

   ```bash
   git clone https://github.com/ibrahimjspy/defi-portfolio-tracker.git
   cd defi-portfolio-tracker
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Get Alchemy API Key**

   * Create a free account at [Alchemy](https://alchemy.com/)
   * Create a new App (Ethereum Mainnet or Sepolia for testnet)
   * Copy the **API key**

4. **Configure Environment**

   Create a `.env.local` file in your root directory:

   ```
   ALCHEMY_API_KEY=your-alchemy-key-here
   ```

5. **Run the App**

   ```bash
   npm run dev
   ```

   * Open [http://localhost:3000](http://localhost:3000)
   * Connect your wallet and see your DeFi dashboard!

---

## **Project Structure**

```
/pages
  index.tsx         # Main dashboard UI
  /api
    balances.ts     # API route for fetching balances, metadata, and USD prices
```

* **API Layer**: Fetches balances from Alchemy, enriches with token metadata, fetches USD prices from CoinGecko, returns to frontend.
* **UI Layer**: Connect wallet, displays table of tokens, portfolio pie chart, value summary.

---

## **How It Works**

1. **Connect Wallet** (RainbowKit)
2. **API Route** (`/api/balances`)

   * Calls Alchemy for all ERC-20 balances
   * Calls Alchemy for each token’s metadata (symbol, decimals, name, logo)
   * Calls CoinGecko for live USD prices
   * Returns structured JSON with all info
3. **Frontend**

   * Displays token balances, USD value, portfolio value
   * Renders allocation chart via Recharts

---

## **Development History & Milestones**

* **Step 1:** Setup Next.js + RainbowKit wallet connect
* **Step 2:** Add API route for ERC-20 balances via Alchemy
* **Step 3:** Fetch token metadata (symbol, name, decimals)
* **Step 4:** Integrate CoinGecko for live USD prices
* **Step 5:** Table UI for tokens, prices, USD value
* **Step 6:** Pie chart for portfolio allocation (Recharts)
* **Step 7:** TypeScript refactor for both API and UI
* **(we are here! 🎉)**
* **Planned Next:**

  * Historical portfolio value charts
  * Token filters/search
  * NFTs tab
  * DeFi protocol balances (Aave, Compound, etc)

---

## **To Do / Roadmap**

* [ ] Add historical price & portfolio charts
* [ ] Search and filter tokens in dashboard
* [ ] Show NFT assets
* [ ] Multi-chain support (Polygon, BSC, etc)
* [ ] User settings (currency, dark mode)
* [ ] Deploy to Vercel or Netlify
* [ ] ...and more!

---

## **Contributing**

Pull requests and issues are welcome!
Built for learning, open source, and DeFi enthusiasts.

---

## **License**

MIT



