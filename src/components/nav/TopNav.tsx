import { useCarStore } from "@/state/carStore";
import {
  BG_GLASS,
  BG_GLASS_HOVER,
  BORDER_COLOR,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  BLUR_GLASS,
  ACCENT_BLUE,
} from "@/theme/color";
import { css } from "@emotion/react";
import { DetailedHTMLProps, ButtonHTMLAttributes, useState } from "react";
import { Modal } from "../modal/Modal";
import { Column } from "../flex/Column";
import { Title } from "../text/Title";

const TOP_PANEL_HEIGHT = "3rem";

const breakpoints = [768];
const mq = breakpoints.map((bp) => `@media (max-width: ${bp}px)`);

interface NavButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  isShow?: boolean;
}

export function TopNav({ step }: { step: number }) {
  const setThirdMode = useCarStore((state) => state.setThirdMode);
  const thirdMode = useCarStore((state) => state.thirdMode);
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <div
        css={css({
          display: "flex",
          transition: "all 0.3s ease",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: TOP_PANEL_HEIGHT,
          backgroundColor: "rgba(255, 255, 255, 0.80)",
          backdropFilter: BLUR_GLASS,
          borderBottom: `1px solid ${BORDER_COLOR}`,
          zIndex: 9999,
          justifyContent: "space-between",
          alignItems: "center",
        })}
      >
        {/* Logo */}
        <div
          css={css({
            paddingLeft: "2rem",
            alignItems: "center",
            flexDirection: "row",
            display: "flex",
            gap: "0.75rem",
          })}
        >
          <span
            css={css({
              fontSize: "14px",
              fontWeight: "600",
              color: TEXT_SECONDARY,
            })}
          >
            🗺️ Rios
          </span>

          {/* Step Indicator */}
          <div
            css={css({
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginLeft: "1rem",
              [mq[0]]: { display: "none" },
            })}
          >
            {["Select", "Process", "View"].map((label, i) => (
              <div
                key={label}
                css={css({
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                })}
              >
                <div
                  css={css({
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor:
                      i <= step ? ACCENT_BLUE : "rgba(0, 0, 0, 0.12)",
                    transition: "all 0.3s ease",
                    boxShadow:
                      i === step ? `0 0 6px ${ACCENT_BLUE}` : "none",
                  })}
                />
                <span
                  css={css({
                    fontSize: "11px",
                    fontWeight: i === step ? "500" : "400",
                    color: i === step ? TEXT_PRIMARY : TEXT_SECONDARY,
                    transition: "all 0.3s ease",
                    [mq[0]]: { display: "none" },
                  })}
                >
                  {label}
                </span>
                {i < 2 && (
                  <div
                    css={css({
                      width: "16px",
                      height: "1px",
                      backgroundColor:
                        i < step
                          ? "rgba(0, 123, 255, 0.3)"
                          : "rgba(0, 0, 0, 0.08)",
                      transition: "all 0.3s ease",
                    })}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          css={css({
            padding: "0rem 0rem",
            [mq[0]]: { display: "none" },
          })}
        />

        {/* Right-side actions */}
        <div
          css={css({
            paddingRight: "2rem",
            display: "flex",
            flexDirection: "row",
            gap: "0.5rem",
          })}
        >
          <NavButton
            isShow={true}
            onClick={() => window.open("https://github.com/Invariants0/rios")}
          >
            GitHub
          </NavButton>
          <NavButton isShow={step >= 1} onClick={() => setOpenModal(true)}>
            Options
          </NavButton>

          {!isMobile && (
            <>
              {thirdMode ? (
                <NavButton
                  isShow={step === 2}
                  onClick={() => setThirdMode(false)}
                >
                  Disable Car
                </NavButton>
              ) : (
                <NavButton
                  isShow={step === 2}
                  onClick={() => setThirdMode(true)}
                >
                  Car Mode
                </NavButton>
              )}
            </>
          )}
        </div>
      </div>

      <Modal isOpen={openModal} onClose={() => setOpenModal(false)}>
        <Column gap="0.5rem">
          <Title>Options</Title>
        </Column>
      </Modal>
    </>
  );
}

export function NavButton(props: NavButtonProps) {
  return (
    <button
      css={css({
        color: TEXT_PRIMARY,
        backgroundColor: BG_GLASS,
        backdropFilter: BLUR_GLASS,
        border: "none",
        padding: "0.5rem 1rem",
        borderRadius: "8px",
        fontWeight: "300",
        fontSize: "12px",
        outline: `${BORDER_COLOR} solid 0.1rem`,
        display: props.isShow ? "" : "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
        ":hover": {
          backgroundColor: BG_GLASS_HOVER,
        },
      })}
      {...props}
    >
      {props.children}
    </button>
  );
}
