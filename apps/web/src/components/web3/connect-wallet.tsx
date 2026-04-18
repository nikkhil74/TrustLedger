'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { formatUnits } from 'viem';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Check, AlertCircle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const SUPPORTED_CHAINS = [polygon, polygonAmoy];

export function ConnectWallet({ className }: { className?: string }) {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [noWalletDetected, setNoWalletDetected] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleConnect = () => {
    const injectedConnector = connectors.find((c) => c.id === 'injected');

    if (!injectedConnector) {
      setNoWalletDetected(true);
      return;
    }

    setNoWalletDetected(false);

    // Always attempt to connect — wagmi/connector will handle detection.
    // If MetaMask is present, it will popup. If not, the error callback fires.
    connect(
      { connector: injectedConnector },
      {
        onError: () => {
          // Connection failed — likely no wallet extension in this browser
          setNoWalletDetected(true);
        },
      },
    );
  };

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  const isWrongChain = chain && !SUPPORTED_CHAINS.some((c) => c.id === chain.id);

  // ── Not Connected ──
  if (!isConnected) {
    return (
      <div className={cn('relative', className)}>
        <button
          onClick={handleConnect}
          disabled={isPending}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
            'bg-gradient-to-r from-tl-cyan to-tl-purple text-tl-deep hover:brightness-110',
            'disabled:opacity-60 disabled:cursor-wait',
          )}
        >
          <Wallet size={16} />
          {isPending ? 'Connecting...' : 'Connect Wallet'}
        </button>

        {/* No wallet detected prompt */}
        <AnimatePresence>
          {noWalletDetected && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-72 rounded-xl border border-tl-border bg-tl-surface p-4 shadow-2xl z-50"
            >
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle size={18} className="text-tl-orange mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-tl-text">No Wallet Detected</p>
                  <p className="text-xs text-tl-text-secondary mt-1">
                    You need a Web3 wallet to use TrustLedger. Install one of these:
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-tl-border hover:border-tl-cyan/30 hover:bg-tl-cyan/5 transition-all group"
                >
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <span className="text-base">🦊</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-tl-text group-hover:text-tl-cyan transition-colors">MetaMask</p>
                    <p className="text-xs text-tl-text-muted">Most popular wallet</p>
                  </div>
                  <Download size={14} className="text-tl-text-muted group-hover:text-tl-cyan transition-colors" />
                </a>

                <a
                  href="https://www.coinbase.com/wallet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-tl-border hover:border-tl-cyan/30 hover:bg-tl-cyan/5 transition-all group"
                >
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <span className="text-base">🔵</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-tl-text group-hover:text-tl-cyan transition-colors">Coinbase Wallet</p>
                    <p className="text-xs text-tl-text-muted">Easy for beginners</p>
                  </div>
                  <Download size={14} className="text-tl-text-muted group-hover:text-tl-cyan transition-colors" />
                </a>
              </div>

              <button
                onClick={() => setNoWalletDetected(false)}
                className="mt-3 w-full text-xs text-tl-text-muted hover:text-tl-text transition-colors text-center cursor-pointer"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connection error */}
        {error && !noWalletDetected && (
          <div className="absolute top-full right-0 mt-2 w-64 rounded-xl border border-tl-pink/30 bg-tl-surface p-3 shadow-xl z-50">
            <p className="text-xs text-tl-pink">{error.message.split('\n')[0]}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Wrong Chain ──
  if (isWrongChain) {
    return (
      <button
        onClick={() => switchChain({ chainId: polygon.id })}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer',
          'bg-tl-orange/10 text-tl-orange border border-tl-orange/30 hover:bg-tl-orange/20 transition-all',
          className,
        )}
      >
        <AlertCircle size={16} />
        Switch to Polygon
      </button>
    );
  }

  // ── Connected ──
  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
          'border border-tl-border hover:border-tl-cyan/30 bg-tl-card hover:bg-tl-elevated',
          dropdownOpen && 'border-tl-cyan/30 bg-tl-elevated',
        )}
      >
        {/* Chain indicator */}
        <div className="h-5 w-5 rounded-full bg-tl-purple/20 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-tl-green" />
        </div>

        <span className="text-tl-text font-mono">{truncatedAddress}</span>

        {balance && (
          <span className="text-tl-text-muted text-xs hidden sm:inline">
            {parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} {balance.symbol}
          </span>
        )}

        <ChevronDown
          size={14}
          className={cn(
            'text-tl-text-muted transition-transform',
            dropdownOpen && 'rotate-180',
          )}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-64 rounded-xl border border-tl-border bg-tl-surface shadow-2xl z-50 overflow-hidden"
          >
            {/* Wallet info */}
            <div className="p-4 border-b border-tl-border">
              <p className="text-xs text-tl-text-muted mb-1">Connected Wallet</p>
              <p className="text-sm font-mono text-tl-text">{truncatedAddress}</p>
              {chain && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="h-2 w-2 rounded-full bg-tl-green" />
                  <span className="text-xs text-tl-text-secondary">{chain.name}</span>
                </div>
              )}
              {balance && (
                <p className="text-sm font-semibold text-tl-text mt-2">
                  {parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} {balance.symbol}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="p-1.5">
              <button
                onClick={copyAddress}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-tl-text-secondary hover:text-tl-text hover:bg-white/5 transition-colors cursor-pointer"
              >
                {copied ? <Check size={15} className="text-tl-green" /> : <Copy size={15} />}
                {copied ? 'Copied!' : 'Copy Address'}
              </button>

              {address && (
                <a
                  href={`https://polygonscan.com/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-tl-text-secondary hover:text-tl-text hover:bg-white/5 transition-colors"
                >
                  <ExternalLink size={15} />
                  View on Explorer
                </a>
              )}

              {/* Chain switcher */}
              <div className="border-t border-tl-border my-1.5" />
              <p className="px-3 py-1.5 text-xs text-tl-text-muted">Switch Network</p>
              {SUPPORTED_CHAINS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    switchChain({ chainId: c.id });
                    setDropdownOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                    chainId === c.id
                      ? 'text-tl-cyan bg-tl-cyan/5'
                      : 'text-tl-text-secondary hover:text-tl-text hover:bg-white/5',
                  )}
                >
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      chainId === c.id ? 'bg-tl-cyan' : 'bg-tl-text-muted',
                    )}
                  />
                  {c.name}
                  {chainId === c.id && (
                    <Check size={14} className="ml-auto text-tl-cyan" />
                  )}
                </button>
              ))}

              <div className="border-t border-tl-border my-1.5" />
              <button
                onClick={() => {
                  disconnect();
                  setDropdownOpen(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-tl-pink hover:bg-tl-pink/5 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
                Disconnect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
