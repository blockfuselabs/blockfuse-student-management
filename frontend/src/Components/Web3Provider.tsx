import { ReactNode } from "react"; 
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
    getDefaultConfig({
      chains: [mainnet, sepolia],
      transports: {
        [mainnet.id]: http(
          `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_ID}`,
        ),
        [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_PUBLIC_ALCHEMY_API_KEY}`)

         },
      walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
      appName: "School Management System",
      appDescription: "Your App Description",
      appUrl: "https://family.co",
      appIcon: "https://family.co/logo.png",
    }),
  );
  
 
const queryClient = new QueryClient();


export const Web3Provider = ({ children }: { children: ReactNode }) => {   
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
         customTheme={{
            "--ck-accent-color": "#00D54B",
            "--ck-accent-text-color": "#ffffff",
          }}
        
        >{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};