import React, { useEffect, useState } from "react";
import { css, keyframes } from "@emotion/react";
import { BG_OVERLAY, BORDER_COLOR, SHADOW_GLASS } from "@/theme/color";

interface ModalProps {
  children?: React.ReactNode;
  onClose?: () => void;
  isOpen?: boolean;
  isScroll?: boolean;
}

const fadeInBackground = keyframes`
  from { backdrop-filter: brightness(100%); opacity: 0; }
  to   { backdrop-filter: brightness(70%); opacity: 1; }
`;

const fadeOutBackground = keyframes`
  from { backdrop-filter: brightness(70%); opacity: 1; }
  to   { backdrop-filter: brightness(100%); opacity: 0; }
`;

const fadeIn = keyframes`
  from { transform: translateY(-10px); opacity: 0.4; }
  to   { transform: translateY(0px);   opacity: 1; }
`;

const fadeOut = keyframes`
  from { transform: translateY(0px);   opacity: 1; }
  to   { transform: translateY(-10px); opacity: 0; }
`;

function Modal({ children, onClose, isOpen, isScroll = false }: ModalProps) {
  const [open, setOpen] = useState(false);
  const [contentAnim, setContentAnim] = useState(
    `${fadeIn} 0.3s forwards`
  );
  const [bgAnim, setBgAnim] = useState(
    `${fadeInBackground} 0.3s forwards`
  );

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).id !== "modal") return;
    setContentAnim(`${fadeOut} 0.3s forwards`);
    setBgAnim(`${fadeOutBackground} 0.3s forwards`);
    setTimeout(() => {
      onClose?.();
      setOpen(false);
    }, 280);
  };

  useEffect(() => {
    if (isOpen) {
      setOpen(true);
      setContentAnim(`${fadeIn} 0.3s forwards`);
      setBgAnim(`${fadeInBackground} 0.3s forwards`);
    } else if (open) {
      setContentAnim(`${fadeOut} 0.3s forwards`);
      setBgAnim(`${fadeOutBackground} 0.3s forwards`);
      setTimeout(() => {
        onClose?.();
        setOpen(false);
      }, 280);
    }
  }, [isOpen]);

  return (
    <div
      onClick={handleClose}
      id="modal"
      css={css({
        display: open ? "flex" : "none",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        backdropFilter: "brightness(70%)",
        animation: bgAnim,
        scrollbarWidth: "none",
        zIndex: 3000,
        transition: "0.1s",
      })}
    >
      <div
        css={css({
          width: "100%",
          height: isScroll ? "70vh" : "auto",
          "@media (min-width: 1000px)": { width: "40vw" },
          "@media (min-width: 1400px)": { width: "30vw" },
          margin: "2rem",
          padding: "1.6rem 1.6rem",
          backgroundColor: "#ffffff",
          borderRadius: "0.6rem",
          border: `0.1rem solid #dddddd`,
          boxShadow: SHADOW_GLASS,
          overflow: isScroll ? "auto" : "visible",
          wordBreak: "break-all",
          animation: contentAnim,
        })}
      >
        {children}
      </div>
    </div>
  );
}

export { Modal };
