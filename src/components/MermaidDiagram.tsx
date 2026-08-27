import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Maximize2, ZoomIn, ZoomOut, X, Loader2 } from "lucide-react";

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
    defaultRenderer: "elk",
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
    numberSectionStyles: 4,
    axisFormat: "%Y-%m-%d",
    useMaxWidth: true,
  },
  journey: {
    diagramMarginX: 20,
    diagramMarginY: 20,
    leftMargin: 150,
    width: 150,
    height: 50,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
  },
  class: {
    useMaxWidth: true,
  },
  state: {
    useMaxWidth: true,
  },
  er: {
    useMaxWidth: true,
  },
  pie: {
    useMaxWidth: true,
  },
  quadrantChart: {
    chartWidth: 500,
    chartHeight: 500,
    titleFontSize: 16,
    titlePadding: 10,
    quadrantPadding: 10,
    xAxisLabelPadding: 5,
    yAxisLabelPadding: 5,
    quadrantLabelFontSize: 14,
    quadrantTextTopPadding: 5,
    pointTextPadding: 5,
    pointLabelFontSize: 12,
    pointRadius: 5,
    xAxisPosition: "bottom",
    yAxisPosition: "left",
  },
  xyChart: {
    width: 700,
    height: 500,
    titleFontSize: 16,
    titlePadding: 10,
    showDataLabel: false,
  },
  requirement: {
    rect_fill: "#f5f3ff",
    text_color: "#4c1d95",
    rect_border_size: "1px",
    rect_border_color: "#a78bfa",
    rect_min_width: 200,
    rect_min_height: 10,
  },
  architecture: {
    useMaxWidth: true,
  },
  block: {
    useMaxWidth: true,
  },
  c4: {
    useMaxWidth: true,
  },
  mindmap: {
    useMaxWidth: true,
  },
  sankey: {
    useMaxWidth: true,
  },
  timeline: {
    useMaxWidth: true,
  },
  gitGraph: {
    useMaxWidth: true,
  },
  packet: {
    useMaxWidth: true,
  },
  kanban: {
    useMaxWidth: true,
  },
  radar: {
    useMaxWidth: true,
  },
  securityLevel: "loose",
  logLevel: "error",
});

interface MermaidDiagramProps {
  code: string;
  title?: string;
  trigger?: "correction" | "teaching" | "user_request";
  hideAvatar?: boolean;
}

let diagramCounter = 0;

function sanitizeMermaidCode(code: string): string {
  return code
    .split("\n")
    .map((line) => {
      if (
        /^\s*(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|pie|gantt|journey|mindmap|gitGraph|subgraph|end|%%|style|class |click )/i.test(
          line
        )
      ) {
        return line;
      }

      line = line.replace(/(\w+)\[([^\]"]+)\]/g, (_match, nodeId, label) => {
        if (/[(){}|<>]/.test(label)) {
          const escaped = label.replace(/"/g, "#quot;");
          return `${nodeId}["${escaped}"]`;
        }
        return _match;
      });

      line = line.replace(/(\w+)\(([^)"]+(?:\([^)]*\))[^)"]*)\)/g, (_match, nodeId, label) => {
        const escaped = label.replace(/"/g, "#quot;");
        return `${nodeId}("${escaped}")`;
      });

      return line;
    })
    .join("\n");
}

export default function MermaidDiagram({
  code,
  title = "Concept Visual",
  trigger,
  hideAvatar = false,
}: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!code.trim()) {
        setError("Empty diagram code");
        return;
      }

      setIsRendering(true);
      setError(null);

      try {
        const id = `mermaid-diagram-${++diagramCounter}`;
        const sanitizedCode = sanitizeMermaidCode(code);
        const { svg } = await mermaid.render(id, sanitizedCode);
        setSvgContent(svg);
      } catch (err) {
        console.error("Failed to render Mermaid diagram:", err);
        const errorMessage = err instanceof Error ? err.message : "Could not render diagram";
        setError(errorMessage);
      } finally {
        setIsRendering(false);
      }
    };

    void renderDiagram();
  }, [code]);

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

  const cardContent = (
    <div
      style={{
        maxWidth: hideAvatar ? "100%" : "85%",
        minWidth: 280,
        borderRadius: 16,
        overflow: "hidden",
        border: "1.5px solid #e9d5ff",
        background: "#ffffff",
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
              color: "#581c87",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 12,
              background: triggerColor.bg,
              color: triggerColor.text,
              border: `1px solid ${triggerColor.border}`,
            }}
          >
            {triggerLabel}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "1px solid #d8b4fe",
              background: "#fff",
              color: "#6b21a8",
              cursor: "pointer",
            }}
            title="Expand diagram"
          >
            <Maximize2 style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      {/* Diagram Body */}
      <div
        style={{
          padding: 16,
          background: "#faf5ff",
          overflowX: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 120,
        }}
      >
        {isRendering && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8b5cf6", fontSize: 12 }}>
            <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
            <span>Rendering diagram...</span>
          </div>
        )}

        {error && (
          <div style={{ color: "#ef4444", fontSize: 12, textAlign: "center", padding: 12 }}>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>Diagram preview unavailable</p>
            <pre
              style={{
                fontSize: 11,
                background: "#fee2e2",
                padding: 8,
                borderRadius: 6,
                textAlign: "left",
                overflowX: "auto",
                maxWidth: 400,
              }}
            >
              {code}
            </pre>
          </div>
        )}

        {!isRendering && !error && svgContent && (
          <div
            ref={containerRef}
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      {hideAvatar ? (
        <div style={{ marginBottom: 4, width: "100%" }}>{cardContent}</div>
      ) : (
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
          {cardContent}
        </div>
      )}

      {/* Modal Viewer */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            padding: 24,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 900,
              maxHeight: "90vh",
              background: "#fff",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid #e9d5ff",
                background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: "#581c87" }}>{title}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.2))}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "1px solid #d8b4fe",
                    background: "#fff",
                    color: "#6b21a8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Zoom Out"
                >
                  <ZoomOut style={{ width: 14, height: 14 }} />
                </button>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#6b21a8", minWidth: 40, textAlign: "center" }}>
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "1px solid #d8b4fe",
                    background: "#fff",
                    color: "#6b21a8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Zoom In"
                >
                  <ZoomIn style={{ width: 14, height: 14 }} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "none",
                    background: "#6b21a8",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 8,
                  }}
                  title="Close (Esc)"
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
            <div
              style={{
                padding: 24,
                overflow: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#faf5ff",
                flex: 1,
              }}
            >
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "center center",
                  transition: "transform 0.2s ease",
                }}
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
