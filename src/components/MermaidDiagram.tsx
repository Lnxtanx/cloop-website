import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

// Initialize mermaid with full feature support
mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    primaryColor: "#ede9fe",
    primaryTextColor: "#4c1d95",
    primaryBorderColor: "#a78bfa",
    lineColor: "#8b5cf6",
    secondaryColor: "#f5f3ff",
    tertiaryColor: "#faf5ff",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "13px",
    nodeBorder: "#a78bfa",
    clusterBkg: "#f5f3ff",
    clusterBorder: "#c4b5fd",
    edgeLabelBackground: "#ffffff",
    // Additional theme variables for better visuals
    mainBkg: "#ede9fe",
    nodeTextColor: "#4c1d95",
    branchLabelColor: "#5b21b6",
    commitLabelColor: "#5b21b6",
    commitLabelBackground: "#f5f3ff",
    tagLabelColor: "#4c1d95",
    tagLabelBackground: "#ede9fe",
    git0: "#8b5cf6",
    git1: "#a78bfa",
    git2: "#c4b5fd",
    git3: "#ddd6fe",
    git4: "#ede9fe",
    git5: "#f5f3ff",
    git6: "#faf5ff",
    git7: "#e9d5ff",
  },
  flowchart: {
    curve: "basis",
    padding: 15,
    htmlLabels: true,
    useMaxWidth: true,
    defaultRenderer: "dagre",
  },
  sequence: {
    diagramMarginX: 10,
    diagramMarginY: 10,
    actorMargin: 50,
    width: 150,
    height: 65,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    mirrorActors: true,
    bottomMarginAdj: 1,
    useMaxWidth: true,
    rightAngles: false,
    showSequenceNumbers: false,
  },
  gantt: {
    titleTopMargin: 25,
    barHeight: 20,
    barGap: 4,
    topPadding: 50,
    leftPadding: 75,
    gridLineStartPadding: 35,
    fontSize: 11,
    sectionFontSize: 11,
    numberSectionStyles: 4,
    axisFormat: "%Y-%m-%d",
    topAxis: false,
  },
  class: {
    useMaxWidth: true,
    hideEmptyMembersBox: true,
  },
  state: {
    useMaxWidth: true,
    labelHeight: 30,
  },
  er: {
    useMaxWidth: true,
    titleTopMargin: 25,
    diagramPadding: 20,
    layoutDirection: "TB",
    minEntityWidth: 100,
    minEntityHeight: 75,
    entityPadding: 15,
    stroke: "#a78bfa",
    fill: "#ede9fe",
    fontSize: 12,
  },
  pie: {
    useMaxWidth: true,
    textPosition: 0.75,
  },
  mindmap: {
    useMaxWidth: true,
    padding: 10,
    maxNodeWidth: 200,
  },
  quadrantChart: {
    chartWidth: 500,
    chartHeight: 500,
    titleTopMargin: 25,
    titleFontSize: 20,
    quadrantLabelFontSize: 16,
    quadrantTextTopPadding: 5,
    quadrantLabelPadding: 10,
    labelFontSize: 14,
    quadrant1Fill: "#ede9fe",
    quadrant2Fill: "#f5f3ff",
    quadrant3Fill: "#faf5ff",
    quadrant4Fill: "#e9d5ff",
    quadrant1TextFill: "#4c1d95",
    quadrant2TextFill: "#5b21b6",
    quadrant3TextFill: "#6b21a8",
    quadrant4TextFill: "#7c3aed",
    quadrantPointFill: "#4c1d95",
    quadrantPointTextFill: "#4c1d95",
  },
  requirement: {
    useMaxWidth: true,
    rect_fill: "#f5f3ff",
    text_color: "#4c1d95",
    rect_border_size: "1",
    rect_border_color: "#a78bfa",
    rect_min_width: 200,
    rect_min_height: 10,
  },
  securityLevel: "loose",
  logLevel: "error",
});

interface MermaidDiagramProps {
  code: string;
  title?: string;
  trigger?: "correction" | "teaching" | "user_request";
}

let diagramCounter = 0;

export default function MermaidDiagram({ code, title, trigger }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRendering, setIsRendering] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!code || !containerRef.current) return;

    const renderDiagram = async () => {
      setIsRendering(true);
      setError("");

      try {
        // Clean and validate the code
        let cleanCode = code.trim();
        
        // Remove any existing ```mermaid fences if present
        cleanCode = cleanCode.replace(/^```mermaid\s*\n?/i, "").replace(/\n?```$/i, "");
        
        const uniqueId = `mermaid-${Date.now()}-${++diagramCounter}`;
        const { svg } = await mermaid.render(uniqueId, cleanCode);
        setSvgContent(svg);
      } catch (err: unknown) {
        console.error("Mermaid render error:", err);
        const errorMessage = err instanceof Error ? err.message : "Could not render diagram";
        setError(errorMessage);
      } finally {
        setIsRendering(false);
      }
    };

    void renderDiagram();
  }, [code]);

  // Trigger label for the badge without icons/emojis
  const triggerLabel =
    trigger === "correction"
      ? "Correction Aid"
      : trigger === "user_request"
        ? "Visual Explanation"
        : "Concept Visual";

  const triggerColor =
    trigger === "correction"
      ? { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" }
      : trigger === "user_request"
        ? { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" }
        : { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 16,
      }}
    >
      {/* AI Avatar */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          flexShrink: 0,
          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        C.
      </div>

      {/* Diagram Card */}
      <div
        style={{
          maxWidth: "85%",
          minWidth: 280,
          borderRadius: 16,
          overflow: "hidden",
          border: "1.5px solid #e9d5ff",
          background: "#fff",
          boxShadow: "0 2px 12px rgba(124, 58, 237, 0.08)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
            borderBottom: "1px solid #e9d5ff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#5b21b6",
                letterSpacing: "0.01em",
              }}
            >
              {title || "Visual Diagram"}
            </span>
          </div>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 8,
              background: triggerColor.bg,
              color: triggerColor.text,
              border: `1px solid ${triggerColor.border}`,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {triggerLabel}
          </span>
        </div>

        {/* Diagram Body */}
        <div
          ref={containerRef}
          className="mermaid-container"
          onClick={() => {
            if (!isRendering && !error && svgContent) {
              setIsModalOpen(true);
            }
          }}
          title={!isRendering && !error && svgContent ? "Click to zoom in" : undefined}
          style={{
            padding: "16px 12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 120,
            background: "#fefefe",
            overflow: "auto",
            cursor: !isRendering && !error && svgContent ? "zoom-in" : "default",
          }}
        >
          {isRendering ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  border: "2px solid #e9d5ff",
                  borderTopColor: "#7c3aed",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <span style={{ fontSize: 12, color: "#9ca3af" }}>
                Rendering diagram…
              </span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : error ? (
            <div
              style={{
                padding: "16px",
                background: "#fef2f2",
                borderRadius: 10,
                fontSize: 12,
                color: "#dc2626",
                textAlign: "center",
              }}
            >
              <div style={{ marginBottom: 8 }}>⚠️ {error}</div>
              <div
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  fontFamily: "monospace",
                  background: "#f5f5f5",
                  padding: 8,
                  borderRadius: 6,
                  maxWidth: 400,
                  overflow: "auto",
                }}
              >
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{code}</pre>
              </div>
            </div>
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: svgContent }}
              style={{
                width: "100%",
                overflow: "auto",
              }}
            />
          )}
        </div>
      </div>

      {/* Zoom Dialog Modal Overlay */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            cursor: "zoom-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "90vw",
              maxHeight: "90vh",
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              border: "1px solid #e9d5ff",
              cursor: "default",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                background: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1e1b4b",
                }}
              >
                {title || "Visual Diagram"}
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 20,
                  color: "#6b7280",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div
              className="mermaid-modal-container"
              style={{
                padding: 32,
                overflow: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#ffffff",
                flex: 1,
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: svgContent }}
                style={{
                  width: "100%",
                  maxHeight: "70vh",
                  display: "flex",
                  justifyContent: "center",
                }}
              />
            </div>
          </div>
          <style>{`
            .mermaid-modal-container svg {
              width: auto !important;
              height: auto !important;
              max-width: 100% !important;
              max-height: 70vh !important;
            }
          `}</style>
        </div>
      )}

      {/* Global styles for mermaid diagrams */}
      <style>{`
        .mermaid-container svg {
          max-width: 100%;
          height: auto;
        }
        .mermaid-container .node rect,
        .mermaid-container .node circle,
        .mermaid-container .node ellipse,
        .mermaid-container .node polygon,
        .mermaid-container .node path {
          stroke: #a78bfa !important;
          stroke-width: 1.5px !important;
        }
        .mermaid-container .nodeLabel {
          color: #4c1d95 !important;
        }
        .mermaid-container .edgePath .path {
          stroke: #8b5cf6 !important;
          stroke-width: 1.5px !important;
        }
        .mermaid-container .edgeLabel {
          background-color: #f5f3ff !important;
          color: #5b21b6 !important;
        }
        .mermaid-container .arrowheadPath {
          fill: #8b5cf6 !important;
        }
      `}</style>
    </div>
  );
}
