"use client";

import { useEffect, useState } from "react";

const APP_URL = "https://2048onbased.vercel.app";
const BASE_APP_DEEP_LINK = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(APP_URL)}`;

function isInBaseApp(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes("coinbasebrowser") ||
    ua.includes("coinbase") ||
    ua.includes("base.app") ||
    !!window.ethereum
  );
}

export default function BaseAppGate({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [inside, setInside] = useState(false);

  useEffect(() => {
    const result = isInBaseApp();
    setInside(result);
    setChecked(true);
    if (!result) {
      const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = BASE_APP_DEEP_LINK;
      }
    }
  }, []);

  if (!checked) {
    return (
      <div className="flex items-center justify-center h-[100dvh] bg-[#f0f2f5]">
        <div className="w-8 h-8 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (inside) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="animated-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="relative z-10 flex items-center justify-center h-[100dvh] px-6">
        <div className="glass-card rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-8 max-w-[340px] w-full text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-base-blue flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/20">
            <svg
              width="28"
              height="28"
              viewBox="0 0 111 111"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
                fill="white"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-black text-[#1a1a2e] tracking-tight mb-1">
            2048
          </h1>
          <p className="text-[#8b8fa3] text-sm mb-6">on Base</p>

          <a
            href={BASE_APP_DEEP_LINK}
            className="block w-full py-3 bg-base-blue text-white font-bold text-sm rounded-xl
              shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30
              active:scale-95 transition-all"
          >
            Open in Base App
          </a>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[#e0e4ec]" />
            <span className="text-[10px] text-[#c0c4d8] font-semibold uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[#e0e4ec]" />
          </div>

          <a
            href="https://apps.apple.com/app/base/id6738294936"
            className="block w-full py-3 glass-card text-[#1a1a2e] font-bold text-sm rounded-xl
              shadow-sm hover:bg-white/80 active:scale-95 transition-all mb-2"
          >
            Download Base App
          </a>

          <p className="text-[10px] text-[#c0c4d8] mt-4">
            This game is designed to be played inside the Base App
          </p>
        </div>
      </div>
    </>
  );
}
