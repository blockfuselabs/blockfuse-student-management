"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Wallet, Shield, Loader2 } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount} from "wagmi";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const { isConnected, isConnecting: wagmiIsConnecting } = useAccount();

  useEffect(() => {
    setIsConnecting(wagmiIsConnecting);
    if (isConnected) {
      router.push("/admin");
    }
  }, [isConnected, wagmiIsConnecting, router]);

  return (
    <div className="w-full flex flex-row h-screen min-h-screen overflow-hidden">
      {/* Left Side - Image with Overlay */}
      <div className="hidden md:flex md:w-1/2 h-full relative">
        <div
          className="w-full h-full bg-cover bg-center relative"
          style={{
            backgroundImage: "url('/icons8-team-FcLyt7lW5wg-unsplash.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-blue-900/70 to-indigo-800/80"></div>
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 z-10">
            <div className="text-center max-w-md">
              <div className="mb-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  BlockFuse SMS
                </h2>
                <p className="text-lg text-blue-100 leading-relaxed">
                  Secure, decentralized student management powered by blockchain
                  technology
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>Secure Wallet Authentication</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>Track Attendance & Performance</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Immutable Records</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="relative z-10 w-full max-w-md px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl mb-6 shadow-lg">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-lg">
              Connect your wallet to access your student portal
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="mb-6">
              <div className="flex items-center flex-col gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">
                    Wallet Authentication
                  </h3>
                  <p className="text-sm text-gray-600">
                    Secure login with your crypto wallet
                  </p>
                </div>
              </div>
            </div>
            <ConnectButton.Custom>
              {({ account, openAccountModal, openConnectModal, mounted }) => {
                const connected = mounted && account;

                return (
                  <button
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    disabled={isConnecting}
                    onClick={connected ? openAccountModal : openConnectModal}
                    className={`
                      w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform
                      ${
                        isConnecting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 hover:scale-105 hover:shadow-xl active:scale-95"
                      }
                      text-white shadow-lg
                      ${
                        isHovered && !isConnecting
                          ? "shadow-2xl shadow-blue-500/25"
                          : ""
                      }
                    `}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : connected ? (
                        <span>{account.displayName}</span>
                      ) : (
                        <span>Connect Wallet</span>
                      )}
                    </div>
                  </button>
                );
              }}
            </ConnectButton.Custom>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-4">
                Supported Wallets
              </p>
              <div className="flex justify-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl overflow-hidden flex items-center justify-center hover:bg-blue-200 transition-colors cursor-pointer">
                  <Image
                    src="/metamask.jpg"
                    alt="MetaMask"
                    width={50}
                    height={50}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Don&#39;t have a wallet?
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 font-medium ml-1"
              >
                Learn how to set one up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
