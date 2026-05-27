import { css, keyframes } from "@emotion/react";
import { Loader2 } from "lucide-react";

export interface Building {
  id: number;
  tags: { [key: string]: string | undefined };
  geometry?: { lat: number; lng: number }[];
}

const spinAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export function BuildingHeights({
  buildings,
  loading,
}: {
  buildings: Building[];
  loading: boolean;
}) {
  return (
    <div css={css({ position: "relative" })}>
      {loading && (
        <div
          css={css({
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#555",
          })}
        >
          <Loader2
            css={css({
              animation: `${spinAnimation} 1s linear infinite`,
            })}
            size={16}
          />
          Fetching building information...
        </div>
      )}

      {!loading && buildings.length > 0 && (
        <div
          css={css({
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#555",
            fontSize: "13px",
            padding: "0.5rem 0",
          })}
        >
          <span css={css({ color: "#007bff", fontWeight: 600 })}>
            {buildings.length}
          </span>
          buildings loaded — click Next Step to view in 3D
        </div>
      )}

      <ul
        css={css({
          overflow: "scroll",
          zIndex: 999,
          position: "absolute",
          top: "2.5rem",
          height: "70vh",
          listStyle: "none",
          padding: 0,
          margin: 0,
          color: "#666",
          fontSize: "12px",
        })}
      >
        {buildings.map((b) => (
          <li
            key={b.id}
            css={css({
              padding: "0.4rem 0",
              borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
            })}
          >
            <div css={css({ fontWeight: 500 })}>Building {b.id}</div>
            <div>Height: {b.tags.height || "No height info"}</div>
            {b.geometry ? (
              <div css={css({ fontSize: "11px", color: "#999" })}>
                {b.geometry.length} vertices
              </div>
            ) : (
              <div>No geometry info</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
