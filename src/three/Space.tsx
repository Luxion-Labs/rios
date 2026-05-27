import { useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useAreaStore } from "@/state/areaStore";
import { Html, Sky, Environment, Line } from "@react-three/drei";
import * as THREE from "three";
import { useActionStore } from "@/state/exportStore";
import { GLTFExporter } from "three/examples/jsm/Addons.js";
import Car from "./Car";
import instanceFleet from "@/api/axios";
import { create } from "zustand";

const SCALE = 51000;

// ─── Hidden Buildings Store ───
interface HiddenStore {
  hiddenIds: Set<number>;
  toggleHidden: (id: number) => void;
  showAll: () => void;
  hiddenCount: () => number;
}

export const useHiddenStore = create<HiddenStore>((set, get) => ({
  hiddenIds: new Set(),
  toggleHidden: (id) =>
    set((state) => {
      const next = new Set(state.hiddenIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { hiddenIds: next };
    }),
  showAll: () => set({ hiddenIds: new Set() }),
  hiddenCount: () => get().hiddenIds.size,
}));

// ─── Color palette for building types ───
const BUILDING_COLORS: Record<string, string> = {
  residential: "#b8a99a",
  apartments: "#b0a090",
  commercial: "#a0aab0",
  retail: "#a5b0a8",
  industrial: "#8a9098",
  office: "#9aa5b0",
  church: "#c8b8a0",
  school: "#a0b0a0",
  university: "#98a8a0",
  hospital: "#b0a0a8",
  default: "#9da0a3",
};

const HOVERED_COLOR = "#d4c8b8";
const SELECTED_COLOR = "#38b2ac";

function getBuildingColor(tags: Record<string, string | undefined>): string {
  const buildingType = tags.building ?? "default";
  return BUILDING_COLORS[buildingType] ?? BUILDING_COLORS.default;
}

// ─── Coordinate Projection ───
function createProjection(refLat: number, refLng: number) {
  return (lat: number, lng: number): THREE.Vector2 => {
    const x = (lng - refLng) * SCALE * Math.cos((refLat * Math.PI) / 180);
    const y = (lat - refLat) * SCALE;
    return new THREE.Vector2(x, y);
  };
}

// ─── Building Component ───
interface BuildingProps {
  shape: THREE.Shape;
  extrudeSettings: { steps: number; depth: number; bevelEnabled: boolean };
  tags: Record<string, string | undefined>;
  buildingId: number;
}

function Building({ shape, extrudeSettings, tags, buildingId }: BuildingProps) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hoverPos, setHoverPos] = useState<THREE.Vector3 | null>(null);
  const [showTranslations, setShowTranslations] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  const toggleHidden = useHiddenStore((s) => s.toggleHidden);

  const baseColor = getBuildingColor(tags);
  const displayColor =
    clicked ? SELECTED_COLOR : hovered ? HOVERED_COLOR : baseColor;

  const hasAnyData =
    tags.name ||
    (tags.building && tags.building !== "yes") ||
    tags.height ||
    tags["building:levels"] ||
    tags.amenity ||
    tags["addr:street"];

  return (
    <mesh
      onPointerOver={(e) => {
        setHovered(true);
        e.stopPropagation();
      }}
      onPointerOut={(e) => {
        setHovered(false);
        e.stopPropagation();
      }}
      onPointerMove={(e) => {
        setHoverPos(e.point.clone());
        e.stopPropagation();
      }}
      onClick={(e) => {
        setClicked(!clicked);
        e.stopPropagation();
      }}
      rotation={[-Math.PI / 2, 0, 0]}
      userData={{ exportToGLB: true }}
    >
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial color={displayColor} />
      {(hovered || clicked) && hoverPos && (
        <Html
          position={[
            hoverPos.x,
            hoverPos.y + extrudeSettings.depth + 0.5,
            hoverPos.z,
          ]}
          center
        >
          <div
            role="dialog"
            aria-label={tags.name || "Building Information"}
            style={{
              color: "#000000",
              backgroundColor: "#ffffff96",
              backdropFilter: "blur(8px)",
              border: "none",
              padding: "14px",
              borderRadius: "10px",
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "13px",
              width: "220px",
              boxShadow: "0 2px 14px rgba(0, 0, 0, 0.16)",
              transition: "all 0.2s ease-in-out",
            }}
          >
            {/* Title */}
            <div
              style={{
                fontWeight: "600",
                fontSize: "15px",
                borderBottom: tags.name
                  ? "1px solid rgba(0, 0, 0, 0.08)"
                  : "none",
                paddingBottom: tags.name ? "6px" : "0",
                marginBottom: tags.name ? "8px" : "4px",
              }}
            >
              {tags.name || "Building Information"}
            </div>

            {/* Core info or No Data */}
            {hasAnyData ? (
              <>
                {[
                  "building",
                  "height",
                  "building:levels",
                  "amenity",
                  "denomination",
                ].map(
                  (key) =>
                    tags[key] &&
                    (key !== "building" || tags[key] !== "yes") && (
                      <InfoRow
                        key={key}
                        label={formatLabel(key)}
                        value={
                          key === "height"
                            ? `${tags[key]} m`
                            : String(tags[key])
                        }
                      />
                    )
                )}

                {/* Address block */}
                {[
                  "addr:street",
                  "addr:housenumber",
                  "addr:district",
                  "addr:city",
                  "addr:postcode",
                ].some((key) => tags[key]) && (
                  <div
                    style={{
                      margin: "10px 0 8px",
                      borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                      paddingTop: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "500",
                        marginBottom: "4px",
                        color: "#5f6368",
                      }}
                    >
                      Address
                    </div>
                    <div
                      style={{
                        marginLeft: "4px",
                        fontSize: "12px",
                        color: "#5f6368",
                      }}
                    >
                      {[
                        [tags["addr:street"], tags["addr:housenumber"]]
                          .filter(Boolean)
                          .join(" "),
                        tags["addr:district"],
                        tags["addr:city"],
                        tags["addr:postcode"],
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  color: "#8f8f96",
                  fontSize: "12px",
                  textAlign: "center",
                  padding: "6px 0",
                }}
              >
                No data available
              </div>
            )}

            {/* Additional Info toggle */}
            {Object.entries(tags).filter(
              ([key]) =>
                ![
                  "building",
                  "name",
                  "height",
                  "building:levels",
                  "source",
                  "amenity",
                  "denomination",
                ].includes(key) &&
                !key.startsWith("addr:") &&
                !key.startsWith("name:") &&
                !key.startsWith("alt_name:")
            ).length > 0 && (
              <div
                style={{
                  margin: "10px 0 4px",
                  borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                  paddingTop: "8px",
                }}
              >
                <div
                  style={{
                    fontWeight: "500",
                    marginBottom: "4px",
                    color: "#5f6368",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                >
                  Additional Information
                  <span>{showAdditionalInfo ? "▲" : "▼"}</span>
                </div>
                {showAdditionalInfo && (
                  <div>
                    {Object.entries(tags)
                      .filter(
                        ([key]) =>
                          ![
                            "building",
                            "name",
                            "height",
                            "building:levels",
                            "source",
                            "amenity",
                            "denomination",
                          ].includes(key) &&
                          !key.startsWith("addr:") &&
                          !key.startsWith("name:") &&
                          !key.startsWith("alt_name:")
                      )
                      .map(([key, value]) => {
                        if (
                          key === "description" ||
                          (typeof value === "string" && value.length > 80)
                        ) {
                          return (
                            <div key={key} style={{ margin: "8px 0" }}>
                              <div
                                style={{
                                  fontWeight: "500",
                                  color: "#5f6368",
                                  marginBottom: "4px",
                                }}
                              >
                                {formatLabel(key)}
                              </div>
                              <div
                                style={{
                                  textAlign: "left",
                                  fontSize: "12px",
                                  color: "#5f6368",
                                  fontWeight: "400",
                                  whiteSpace: "pre-wrap",
                                  lineHeight: "1.4",
                                  backgroundColor: "rgba(0,0,0,0.02)",
                                  padding: "6px 8px",
                                  borderRadius: "4px",
                                }}
                              >
                                {String(value)}
                              </div>
                            </div>
                          );
                        }
                        return (
                          <InfoRow
                            key={key}
                            label={formatLabel(key)}
                            value={String(value)}
                          />
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* Translations toggle */}
            {Object.entries(tags).filter(([key]) => key.startsWith("name:"))
              .length > 0 && (
              <div
                style={{
                  margin: "10px 0 4px",
                  borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                  paddingTop: "8px",
                  textAlign: "right",
                }}
              >
                <div
                  style={{
                    fontWeight: "500",
                    marginBottom: "4px",
                    color: "#5f6368",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onClick={() => setShowTranslations(!showTranslations)}
                >
                  Name Translations
                  <span>{showTranslations ? "▲" : "▼"}</span>
                </div>
                {showTranslations && (
                  <div>
                    {Object.entries(tags)
                      .filter(([key]) => key.startsWith("name:"))
                      .map(([key, value]) => (
                        <InfoRow
                          key={key}
                          label={key.replace("name:", "").toUpperCase()}
                          value={String(value)}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Cut Building Button ── */}
            <div
              style={{
                marginTop: "10px",
                borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                paddingTop: "8px",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleHidden(buildingId);
                }}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "rgba(239, 68, 68, 0.15)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    "rgba(239, 68, 68, 0.08)";
                }}
              >
                ✂ Cut Building
              </button>
            </div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

// ─── Helpers ───
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        margin: "4px 0",
      }}
    >
      <span style={{ fontWeight: "500", color: "#5f6368" }}>{label}:</span>
      <span style={{ textTransform: "capitalize" }}>{value}</span>
    </div>
  );
}

function formatLabel(key: string): string {
  const labels: Record<string, string> = {
    building: "Type",
    height: "Height",
    "building:levels": "Levels",
    amenity: "Facility",
    denomination: "Denomination",
  };
  return (
    labels[key] ??
    key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")
  );
}

// ─── Road Colors ───
const ROAD_COLORS: Record<string, string> = {
  motorway: "#ffffff",
  trunk: "#e0e0e0",
  primary: "#d0d0d0",
  secondary: "#a0a0a0",
  tertiary: "#808080",
  residential: "#606060",
  service: "#505050",
  footway: "#404040",
  path: "#383838",
  default: "#34f516",
};

interface RoadElement {
  id: number;
  tags: Record<string, string | undefined>;
  geometry?: { lat: number; lon: number }[];
}

function Roads({
  area,
}: {
  area: { lat: number; lng: number }[] | undefined;
}) {
  const [roads, setRoads] = useState<RoadElement[]>([]);

  if (!area || area.length < 2) return null;

  const refLat = (area[1].lat + area[0].lat) / 2;
  const refLng = (area[1].lng + area[0].lng) / 2;
  const project = createProjection(refLat, refLng);

  useEffect(() => {
    const south = area[1].lat;
    const west = area[1].lng;
    const north = area[0].lat;
    const east = area[0].lng;
    const query = `[out:json][timeout:25];(way["highway"](${south},${west},${north},${east}););out body geom;`;

    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
      .then((response) => response.json())
      .then((data) => setRoads(data.elements))
      .catch((err) => console.error(err));
  }, [area]);

  return (
    <>
      {roads.map((road) => {
        if (!road.geometry || road.geometry.length < 2) return null;

        const color = "#34f516";

        const points = road.geometry.map((pt) => {
          const v = project(pt.lat, pt.lon);
          return new THREE.Vector3(v.x, 0.1, -v.y);
        });

        return (
          <Line
            key={road.id}
            points={points}
            color={color}
            lineWidth={1}
            userData={{ exportToGLB: true }}
          />
        );
      })}
    </>
  );
}

// ─── Export ───
export function Export() {
  const { scene } = useThree();
  const action = useActionStore((state) => state.action);
  const fleetSpaceId = useActionStore((state) => state.fleetSpaceId);
  const exportType = useActionStore((state) => state.exportType);
  const setAction = useActionStore((state) => state.setAction);

  useEffect(() => {
    if (action === true) {
      setAction(false);
      exportGLB();
    }
  }, [action, setAction, scene]);

  const uploadFleet = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("object", blob, "box3d.glb");
    formData.append("title", "New Object");
    formData.append("description", "");
    formData.append("spaceId", fleetSpaceId);

    await instanceFleet.post("space/file/mesh", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const exportGLB = () => {
    const exportRoot = new THREE.Group();
    scene.traverse((child) => {
      if (child.userData?.exportToGLB === true) {
        exportRoot.add(child.clone(true));
      }
    });

    const exporter = new GLTFExporter();
    const options = { binary: true, embedImages: true };

    exporter.parse(
      exportRoot,
      (result) => {
        if (result instanceof ArrayBuffer) {
          const blob = new Blob([result], { type: "model/gltf-binary" });

          if (exportType === "glb") {
            const link = document.createElement("a");
            link.style.display = "none";
            document.body.appendChild(link);
            link.href = URL.createObjectURL(blob);
            link.download = "scene.glb";
            link.click();
            document.body.removeChild(link);
          }

          if (exportType === "fleet") {
            uploadFleet(blob);
          }
        } else {
          console.error("GLB export failed: unexpected result", result);
        }
      },
      (error) => {
        console.error("An error occurred during export", error);
      },
      options
    );
  };

  return null;
}

// ─── Main Scene ───
export function Space() {
  const areas = useAreaStore((state) => state.areas);
  const hiddenIds = useHiddenStore((s) => s.hiddenIds);
  const [realCenter, setRealCenter] = useState<
    { lat: number; lng: number }[] | undefined
  >();
  const center = useAreaStore((state) => state.center);
  const refLat = (center[1].lat + center[0].lat) / 2;
  const refLng = (center[1].lng + center[0].lng) / 2;
  const project = createProjection(refLat, refLng);

  const buildingsData = useMemo(() => {
    const result: BuildingProps[] = [];
    areas.forEach(
      (bld: {
        id: number;
        geometry?: { lat: number; lng: number }[];
        tags: Record<string, string | undefined>;
      }) => {
        if (!bld.geometry || bld.geometry.length < 3) return;

        const shapePoints = bld.geometry.map((pt) =>
          project(pt.lat, pt.lng)
        );
        if (!shapePoints[0].equals(shapePoints[shapePoints.length - 1])) {
          shapePoints.push(shapePoints[0]);
        }
        const shape = new THREE.Shape(shapePoints);

        let heightValue = parseFloat(bld.tags.height || "");
        const heightLevels = parseFloat(bld.tags["building:levels"] || "");
        if (isNaN(heightValue)) heightValue = 10;
        if (!isNaN(heightLevels)) heightValue = heightLevels * 2.2;

        const extrudeSettings = {
          steps: 1,
          depth: heightValue,
          bevelEnabled: false,
        };

        result.push({
          shape,
          extrudeSettings,
          tags: bld.tags,
          buildingId: bld.id,
        });
      }
    );
    return result;
  }, [areas, refLat, refLng]);

  useEffect(() => {
    setRealCenter(center);
  }, [areas]);

  return (
    <Canvas camera={{ fov: 90, near: 0.1, far: 7000 }}>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />

      {buildingsData.map((item) =>
        hiddenIds.has(item.buildingId) ? null : (
          <Building
            key={item.buildingId}
            shape={item.shape}
            extrudeSettings={item.extrudeSettings}
            tags={item.tags}
            buildingId={item.buildingId}
          />
        )
      )}

      <Roads area={realCenter} />
      <pointLight
        position={[-10, -10, -10]}
        decay={0}
        intensity={Math.PI}
      />
      <Car />
      <Export />
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0.25}
      />
      <Environment preset="city" />
    </Canvas>
  );
}
