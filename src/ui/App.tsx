import { css, keyframes } from "@emotion/react";
import { Space, useHiddenStore } from "../three/Space";
import { FullscreenModal } from "../components/FullscreenModal";
import { Title } from "@/components/text/Title";
import { Description } from "@/components/text/Description";
import { Column } from "@/components/flex/Column";
import { MapComponent } from "@/components/map/SelectMap";
import { useEffect, useState } from "react";
import {
  Button,
  NextButton,
  PrevButton,
} from "@/components/button/BottomButton";
import { BuildingHeights, Building } from "@/components/map/Processing";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Eye,
} from "lucide-react";
import { useAreaStore } from "@/state/areaStore";
import { useActionStore } from "@/state/exportStore";
import { Modal } from "@/components/modal/Modal";
import { TopNav } from "@/components/nav/TopNav";
import { getCookie } from "@/utils/cookie";
import { Row } from "@/components/flex/Row";
import instanceFleet from "@/api/axios";
import { MovementPad } from "@/components/controls/MovementPad";
import { StatsPanel } from "@/components/panels/StatsPanel";

const IconSize = css({
  width: "14px",
  height: "14px",
});

const spinAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const STEPS = ["front", "processing"] as const;

function App() {
  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);
  const [areaData, setAreaData] = useState<{ lat: number; lng: number }[]>([]);
  const [step, setStep] = useState(0);
  const [isWarnModal, setIsWarnModal] = useState(false);
  const [isExportModal, setIsExportModal] = useState(false);
  const [isFleetLogin, setIsFleetLogin] = useState(false);
  const [isFleetModal, setIsFleetModal] = useState(false);
  const [spaceList, setSpaceList] = useState<
    { id: string; title: string }[]
  >([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isFetchingBuildings, setIsFetchingBuildings] = useState(false);
  const [hasFetchedBuildings, setHasFetchedBuildings] = useState(false);

  const setCenter = useAreaStore((state) => state.setCenter);
  const appendAreas = useAreaStore((state) => state.appendAreas);
  const setAction = useActionStore((state) => state.setAction);
  const setFleet = useActionStore((state) => state.setFleet);

  const hiddenIds = useHiddenStore((s) => s.hiddenIds);
  const showAll = useHiddenStore((s) => s.showAll);

  const checkIsBig = (): boolean => {
    if (areaData.length < 2) return false;
    const a = areaData[0].lat - areaData[1].lat;
    const b = areaData[0].lng - areaData[1].lng;
    return a + b > 0.1;
  };

  const exportFile = () => {
    setAction(true);
  };

  const exportFleet = () => {
    setAction(true);
  };

  const getFleetSpaces = async () => {
    const getSpace: { data: { spaces: { id: string; title: string }[] } } =
      await instanceFleet.get("space");
    setSpaceList(
      getSpace.data.spaces.map((item) => ({
        ...item,
        key: item.id,
      }))
    );
  };

  const putGlbOnFleetSpace = (spaceId: string) => {
    setFleet(spaceId, "fleet");
    setTimeout(() => {
      exportFleet();
    }, 100);
  };

  const loadFleetSpace = () => {
    getFleetSpaces();
    setIsFleetModal(true);
  };

  const checkFleetLogin = () => {
    try {
      const isCookie = getCookie("token");
      if (isCookie) {
        setIsFleetLogin(true);
      }
    } catch {
      // silently ignore cookie errors
    }
  };

  const handleDone = (data: { lat: number; lng: number }[]) => {
    setAreaData(data);
    setCenter(data);
    setIsNextButtonDisabled(false);
    setBuildings([]);
    setHasFetchedBuildings(false);
  };

  const handleRemove = () => {
    setAreaData([]);
    setIsNextButtonDisabled(true);
    setBuildings([]);
    setHasFetchedBuildings(false);
  };

  const requestBuildings = async () => {
    if (areaData.length < 2) return;
    setIsFetchingBuildings(true);

    const south = areaData[1].lat;
    const west = areaData[1].lng;
    const north = areaData[0].lat;
    const east = areaData[0].lng;
    const query = `[out:json][timeout:25];(way["building"]( ${south},${west},${north},${east} );relation["building"]( ${south},${west},${north},${east} ););out body geom;`;

    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const data = await response.json();
      const blds: Building[] = data.elements.map(
        (element: {
          id: number;
          tags: { [key: string]: string | undefined };
          geometry?: { lat: number; lon: number }[];
        }) => ({
          id: element.id,
          tags: element.tags,
          geometry: element.geometry
            ? element.geometry.map((pt) => ({ lat: pt.lat, lng: pt.lon }))
            : undefined,
        })
      );
      setBuildings(blds);
      appendAreas(blds);
      setHasFetchedBuildings(true);
    } catch (error) {
      console.error("Error fetching building data:", error);
    } finally {
      setIsFetchingBuildings(false);
    }
  };

  const handleClickNextStep = async () => {
    if (step === 0 && checkIsBig()) {
      setIsWarnModal(true);
      return;
    }
    if (step === 1 && !hasFetchedBuildings) {
      await requestBuildings();
      return;
    }
    setStep(step + 1);
  };

  const handleClickPrevStep = () => {
    setStep(step - 1);
  };

  const handleClickExport = () => {
    setIsExportModal(true);
  };

  useEffect(() => {
    checkFleetLogin();
  }, []);

  return (
    <div css={css({ height: "100%", width: "100%" })}>
      <TopNav step={step} />

      {/* Step 0: Map Selection */}
      <FullscreenModal isOpen={STEPS[step] === "front"}>
        <Column gap="1rem">
          <Column gap="0.5rem">
            <Title>Generate 3D Digital Twin</Title>
            <Description>
              Select a region on the map to generate an interactive 3D model.
              Search for any location or draw a bounding box to begin.
            </Description>
          </Column>
          <MapComponent onRemove={handleRemove} onDone={handleDone} />
        </Column>
      </FullscreenModal>

      {/* Step 1: Processing */}
      <FullscreenModal isOpen={STEPS[step] === "processing"}>
        <Column gap="1rem">
          <Column gap="0.5rem">
            <Title>Processing</Title>
            <Description>
              Click Next Step to fetch building information. Once loaded, click
              Next Step again to view the 3D scene.
            </Description>

            <BuildingHeights
              buildings={buildings}
              loading={isFetchingBuildings}
            />
          </Column>
        </Column>
      </FullscreenModal>

      {/* Navigation Buttons */}
      <PrevButton isShow={step !== 0} onClick={handleClickPrevStep}>
        <ChevronLeft css={IconSize} /> Prev Step
      </PrevButton>

      <NextButton
        isShow={step !== 2}
        disabled={isNextButtonDisabled || isFetchingBuildings}
        onClick={handleClickNextStep}
      >
        {isFetchingBuildings ? (
          <>
            <Loader2
              css={[
                IconSize,
                css({ animation: `${spinAnimation} 1s linear infinite` }),
              ]}
            />
            Fetching...
          </>
        ) : (
          <>
            Next Step <ChevronRight css={IconSize} />
          </>
        )}
      </NextButton>

      <NextButton isShow={step === 2} onClick={handleClickExport}>
        Export GLB <Download css={IconSize} />
      </NextButton>

      {/* Show All Buildings (visible when buildings are hidden) */}
      {step === 2 && hiddenIds.size > 0 && (
        <button
          onClick={showAll}
          css={css({
            position: "absolute",
            zIndex: 9999,
            right: "2rem",
            bottom: "5rem",
            color: "#000000",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(8px)",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            fontWeight: "300",
            fontSize: "12px",
            outline: "rgba(240, 240, 244, 0.51) solid 0.1rem",
            cursor: "pointer",
            transition: "0.2s",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            ":hover": {
              backgroundColor: "rgba(240, 242, 245, 0.9)",
            },
          })}
        >
          <Eye css={IconSize} /> Show All ({hiddenIds.size} hidden)
        </button>
      )}

      {/* Stats Panel (3D view) */}
      <StatsPanel
        buildings={buildings}
        area={areaData.length >= 2 ? areaData : null}
        isVisible={step === 2}
      />

      {/* Movement Pad (3D view, mobile) */}
      <MovementPad isVisible={step === 2} />

      {/* Warning Modal */}
      <Modal isOpen={isWarnModal} onClose={() => setIsWarnModal(false)}>
        <Column gap="0.5rem">
          <Title>The area is too big</Title>
          <Description>Do you want to proceed?</Description>
          <Button
            isShow={step !== 2}
            disabled={isNextButtonDisabled}
            onClick={() => {
              setStep(step + 1);
              setIsWarnModal(false);
            }}
          >
            Next Step <ChevronRight css={IconSize} />
          </Button>
        </Column>
      </Modal>

      {/* Export Modal */}
      <Modal isOpen={isExportModal} onClose={() => setIsExportModal(false)}>
        <Column gap="0.5rem">
          <Title>Export</Title>
          <Row gap="0.5rem">
            <Button isShow={true} onClick={exportFile}>
              GLB Download <Download css={IconSize} />
            </Button>
          </Row>
        </Column>
      </Modal>

      {/* Fleet Modal */}
      <Modal isOpen={isFleetModal} onClose={() => setIsFleetModal(false)}>
        <Column gap="0.5rem">
          <Title>Select Fleet Space</Title>
          {spaceList.map((item) => (
            <Button
              key={item.id}
              isShow={true}
              onClick={() => putGlbOnFleetSpace(item.id)}
            >
              {item.title}
            </Button>
          ))}
        </Column>
      </Modal>

      {/* 3D Scene */}
      <Space />
    </div>
  );
}

export default App;
