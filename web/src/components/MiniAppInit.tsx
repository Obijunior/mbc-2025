"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect } from "react";

export default function MiniAppInit() {
  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready();
      } catch (e) {
        console.error("Failed to initialize MiniApp SDK", e);
      }
    };
    init();
  }, []);

  return null;
}
