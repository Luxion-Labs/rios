import { css } from "@emotion/react";
import { useCarStore } from "@/state/carStore";
import { type ReactNode, useEffect } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

type Direction = "w" | "a" | "s" | "d";

export function MovementPad({ isVisible }: { isVisible: boolean }) {
  const setKey = useCarStore((state) => state.setKey);

  useEffect(() => {
    return () => setKey(null);
  }, [setKey]);

  const press = (direction: Direction) => setKey(direction);
  const release = () => setKey(null);

  if (!isVisible) return null;

  return (
    <div
      css={css({
        position: "fixed",
        right: "1rem",
        bottom: "1rem",
        zIndex: 9999,
        display: "grid",
        gridTemplateColumns: "repeat(3, 3rem)",
        gridTemplateRows: "repeat(3, 3rem)",
        gap: "0.35rem",
        userSelect: "none",
        padding: "0.65rem",
        borderRadius: "20px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(247,249,253,0.82))",
        border: "1px solid rgba(17,24,39,0.08)",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.14)",
      })}
    >
      <div />
      <PadButton label="W" icon={<ArrowUp size={14} />} onPress={() => press("w")} onRelease={release} />
      <div />
      <PadButton label="A" icon={<ArrowLeft size={14} />} onPress={() => press("a")} onRelease={release} />
      <PadButton label="S" icon={<ArrowDown size={14} />} onPress={() => press("s")} onRelease={release} />
      <PadButton label="D" icon={<ArrowRight size={14} />} onPress={() => press("d")} onRelease={release} />
    </div>
  );
}

function PadButton({
  label,
  icon,
  onPress,
  onRelease,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  onRelease: () => void;
}) {
  return (
    <button
      type="button"
      onPointerDown={onPress}
      onPointerUp={onRelease}
      onPointerLeave={onRelease}
      onTouchEnd={onRelease}
      css={css({
        border: "1px solid rgba(17,24,39,0.08)",
        borderRadius: "14px",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
        color: "#111827",
        fontWeight: 800,
        fontSize: "14px",
        cursor: "pointer",
        touchAction: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.15rem",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        ":hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
        },
      })}
    >
      <span css={css({ color: "#2563eb" })}>{icon}</span>
      {label}
    </button>
  );
}
