"use client";

import { useEffect, useState } from "react";

interface NftNotificationProps {
  tokenId: string;
  onClose: () => void;
}

export default function NftNotification({ tokenId, onClose }: NftNotificationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 400);
    }, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[340px] max-w-[90vw]
        transition-all duration-400
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
    >
      <div className="glass-card rounded-2xl shadow-[0_8px_40px_rgba(0,82,255,0.15)] border border-blue-100 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-base-blue to-indigo-500" />
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-base-blue to-indigo-600
            flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <span className="text-2xl">🏆</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[#1a1a2e] font-extrabold text-sm">
              Early Adopter NFT Received!
            </div>
            <div className="text-[#8b8fa3] text-xs mt-0.5">
              Token #{tokenId} minted to your wallet
            </div>
            <div className="text-base-blue text-[10px] font-bold mt-1 uppercase tracking-wider">
              2048 on Base
            </div>
          </div>
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 400);
            }}
            className="text-[#c0c4d8] hover:text-[#6b6f87] transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
