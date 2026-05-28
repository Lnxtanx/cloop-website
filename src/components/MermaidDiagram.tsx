import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

// Initialize mermaid with a clean config
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
  },
  flowchart: {
    curve: "basis",
    padding: 12,
    htmlLabels: true,
    useMaxWidth: true,
  },
  securityLevel: "loose",
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

  useEffect(() => {
    if (!code || !containerRef.current) return;

    const renderDiagram = async () => {
      setIsRendering(true);
      setError("");

      try {
        const uniqueId = `mermaid-${Date.now()}-${++diagramCounter}`;
        const { svg } = await mermaid.render(uniqueId, code);
        setSvgContent(svg);
      } catch (err: unknown) {
        console.error("Mermaid render error:", err);
        setError("Could not render diagram");
      } finally {
        setIsRendering(false);
      }
    };

    void renderDiagram();
  }, [code]);

  // Trigger label for the badge
  const triggerLabel =
    trigger === "correction"
      ? "📝 Correction Aid"
      : trigger === "user_request"
        ? "🔍 Visual Explanation"
        : "💡 Concept Visual";

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
          maxWidth: "75%",
          minWidth: 240,
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
            <span style={{ fontSize: 14 }}>📊</span>
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
          style={{
            padding: "16px 12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 100,
            background: "#fefefe",
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
                padding: "12px 16px",
                background: "#fef2f2",
                borderRadius: 10,
                fontSize: 12,
                color: "#dc2626",
              }}
            >
              ⚠️ {error}
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
    </div>
  );
}
