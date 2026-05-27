import { css } from "@emotion/react";
import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import {
  BG_GLASS,
  BG_GLASS_HOVER,
  BORDER_COLOR,
  TEXT_PRIMARY,
  BLUR_GLASS,
} from "@/theme/color";

interface ButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  isShow?: boolean;
}

const baseButtonStyles = css({
  color: TEXT_PRIMARY,
  backgroundColor: BG_GLASS,
  backdropFilter: BLUR_GLASS,
  border: "none",
  padding: "0.75rem 1.25rem",
  borderRadius: "8px",
  fontWeight: "300",
  fontSize: "14px",
  outline: `${BORDER_COLOR} solid 0.1rem`,
  cursor: "pointer",
  transition: "0.2s",
  alignItems: "center",
  gap: "0.5rem",
  ":hover": {
    backgroundColor: BG_GLASS_HOVER,
  },
  ":disabled": {
    backgroundColor: BG_GLASS_HOVER,
    cursor: "not-allowed",
  },
});

export function NextButton(props: ButtonProps) {
  return (
    <button
      css={[
        baseButtonStyles,
        css({
          position: "absolute",
          zIndex: 9999,
          right: "2rem",
          bottom: "2rem",
          display: props.isShow ? "flex" : "none",
        }),
      ]}
      {...props}
    >
      {props.children}
    </button>
  );
}

export function PrevButton(props: ButtonProps) {
  return (
    <button
      css={[
        baseButtonStyles,
        css({
          position: "absolute",
          zIndex: 9999,
          left: "2rem",
          bottom: "2rem",
          display: props.isShow ? "flex" : "none",
        }),
      ]}
      {...props}
    >
      {props.children}
    </button>
  );
}

export function Button(props: ButtonProps) {
  return (
    <button
      css={[
        baseButtonStyles,
        css({
          zIndex: 9999,
          display: props.isShow ? "inline-flex" : "none",
        }),
      ]}
      {...props}
    >
      {props.children}
    </button>
  );
}
