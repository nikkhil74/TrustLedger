import { createConfig, http } from 'wagmi';
import { polygon, polygonAmoy, hardhat } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [polygon, polygonAmoy, hardhat],
  connectors: [
    // Picks up MetaMask, Coinbase Wallet, or any browser-injected wallet
    injected(),
  ],
  transports: {
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
  ssr: true,
});
