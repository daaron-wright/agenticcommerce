import { memo } from "react";

export const BackgroundLayer = memo(() => {
  return (
    <>
      <div className="professional-background"></div>
      <div className="grid-pattern"></div>
    </>
  );
});

BackgroundLayer.displayName = "BackgroundLayer";
