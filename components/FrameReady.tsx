"use client";

import { useEffect } from "react";
import sdk from "@farcaster/frame-sdk";

export default function FrameReady() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return null;
}
