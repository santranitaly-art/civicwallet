import { createThirdwebClient, getContract, defineChain } from "thirdweb";
import { smartWallet, inAppWallet } from "thirdweb/wallets";

// Lazy initialization to avoid throwing during `next build` when env vars are absent.
let _client: ReturnType<typeof createThirdwebClient> | null = null;

export function getClient() {
  if (!_client) {
    const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
    if (!clientId) {
      throw new Error(
        "NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set. Check your .env file.",
      );
    }
    _client = createThirdwebClient({ clientId });
  }
  return _client;
}

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "80002");
export const chain = defineChain(chainId);

// ERC-4337 Account Abstraction Setup (Zero-Gas via Paymaster)
// We define the smart wallet wrapper configuration that will sponsor gas for all users.
export const civicSmartWalletConfig = smartWallet({
  chain,
  sponsorGas: true,
  factoryAddress: process.env.NEXT_PUBLIC_THIRDWEB_FACTORY_ADDRESS || "0x",
});

// Default available wallets for volunteers (Social login wrapped in Smart Wallet)
export const civicWallets = [
  inAppWallet({
    auth: {
      options: ["email", "google", "apple"],
    },
  })
];

let _contract: ReturnType<typeof getContract> | null = null;

export function getCivicBadgeContract() {
  if (!_contract) {
    _contract = getContract({
      client: getClient(),
      chain,
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
    });
  }
  return _contract;
}
