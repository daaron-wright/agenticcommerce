"use client";

import { createContext, useContext } from "react";

type BannerControlsContextType = {
  bannerControls: React.ReactNode;
  setBannerControls: (node: React.ReactNode) => void;
};

export const BannerControlsContext = createContext<BannerControlsContextType>({
  bannerControls: null,
  setBannerControls: () => {},
});

export function useBannerControls() {
  return useContext(BannerControlsContext);
}
