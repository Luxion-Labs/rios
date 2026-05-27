import { css } from "@emotion/react";
import React from "react";
import { BLUR_GLASS } from "@/theme/color";

export function FullscreenModal({
  children,
  isOpen = false,
}: {
  children: React.ReactNode;
  isOpen?: boolean;
}) {
  return (
    <div
      css={css({
        width: "100%",
        height: "100%",
        position: "fixed",
        zIndex: 999,
        backgroundColor: "rgba(255, 255, 255, 0.88)",
        backdropFilter: BLUR_GLASS,
        display: isOpen ? "flex" : "none",
      })}
    >
      <div
        css={css({
          padding: "2rem",
          paddingTop: "4rem",
          width: "100%",
        })}
      >
        {children}
      </div>
    </div>
  );
}
