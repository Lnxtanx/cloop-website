import { useMemo } from "react";

interface TextDiagramProps {
  code: string;
  title?: string;
  trigger?: "correction" | "teaching" | "user_request";
  diagramType?: "ascii" | "tree" | "table" | "arrow" | "auto";
}

/**
 * TextDiagram Component
 * Renders text-based diagrams (ASCII art, tree diagrams, tables, flow diagrams)
 * as an alternative to Mermaid when graphical rendering isn't needed or desired.
 */
export default function TextDiagram({ code, title, trigger, diagramType = "auto" }: TextDiagramProps) {
  
  // Detect diagram type if auto
  const detectedType = useMemo(() => {
    if (diagramType !== "auto") return diagramType;
    
    const lines = code.trim().split("\n");
    const firstLine = lines[0];
    
    // Check for tree structure (indentation-based)
    if (lines.some(l => /^[│├└┌─│┤]/.test(l) || /^\s*[├└]/.test(l))) {
      return "tree";
    }
    
    // Check for table structure
    if (firstLine.includes("|") && lines[1]?.match(/^[\s\-:|]+$/)) {
      return "table";
    }
    
    // Check for arrow-based flow
    if (code.includes("→") || code.includes("-->") || code.includes("==>") || code.includes("->")) {
      return "arrow";
    }
    
    // Default to ASCII
    return "ascii";
  }, [code, diagramType]);

  // Render different diagram types
  const renderedContent = useMemo(() => {
    const lines = code.trim().split("\n");
    
    switch (detectedType) {
      case "tree":
        return renderTreeDiagram(lines);
      case "table":
        return renderTableDiagram(lines);
      case "arrow":
        return renderArrowDiagram(lines);
      default:
        return renderAsciiDiagram(lines);
    }
  }, [code, detectedType]);

  // Trigger label for the badge
  const triggerLabel =
    trigger === "correction"
      ? "📝 Quick Visual"
      : trigger === "user_request"
        ? "🔍 Text Diagram"
        : "💡 Quick Reference";

  const triggerColor =
    trigger === "correction"
      ? { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" }
      : trigger === "user_request"
        ? { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" }
        : { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };

  const typeIcon = {
    ascii: "📝",
    tree: "🌳",
    table: "📊",
    arrow: "➡️",
  }[detectedType] || "📝";

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
          minWidth: 220,
          borderRadius: 14,
          overflow: "hidden",
          border: "1.5px solid #e9d5ff",
          background: "#fafafa",
          boxShadow: "0 2px 8px rgba(124, 58, 237, 0.06)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
            borderBottom: "1px solid #e9d5ff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13 }}>{typeIcon}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#5b21b6",
              }}
            >
              {title || "Text Diagram"}
            </span>
          </div>
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: 6,
              background: triggerColor.bg,
              color: triggerColor.text,
              border: `1px solid ${triggerColor.border}`,
              textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}
          >
            {triggerLabel}
          </span>
        </div>

        {/* Diagram Body */}
        <div
          style={{
            padding: "12px 14px",
            background: "#fefefe",
          }}
        >
          {renderedContent}
        </div>
      </div>
    </div>
  );
}

// ─── Renderers ─────────────────────────────────────────────────────────────

function renderAsciiDiagram(lines: string[]) {
  return (
    <pre
      style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
        fontSize: 12,
        lineHeight: 1.5,
        color: "#374151",
        margin: 0,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {lines.join("\n")}
    </pre>
  );
}

function renderTreeDiagram(lines: string[]) {
  // Enhanced tree rendering with better styling
  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
        fontSize: 12,
        lineHeight: 1.6,
        color: "#374151",
      }}
    >
      {lines.map((line, i) => {
        // Detect root nodes (no indentation, no tree chars at start)
        const isRoot = !line.match(/^[\s│├└┌]/) && line.trim().length > 0;
        // Detect branch nodes
        const isBranch = line.includes("├──") || line.includes("└──") || line.includes("┌──");
        // Get indentation level
        const indent = line.search(/\S/);
        
        // Split line into tree characters and content
        const treeMatch = line.match(/^([\s│├└┌─]+)?(.*)$/);
        const treeChars = treeMatch?.[1] || "";
        const content = treeMatch?.[2] || "";
        
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              paddingLeft: indent,
            }}
          >
            {treeChars && (
              <span style={{ color: "#a78bfa", fontWeight: 500 }}>{treeChars}</span>
            )}
            <span
              style={{
                color: isRoot ? "#5b21b6" : "#4c1d95",
                fontWeight: isRoot ? 700 : 400,
                marginLeft: treeChars ? 0 : 4,
              }}
            >
              {content}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function renderTableDiagram(lines: string[]) {
  // Parse markdown-style table
  const headerLine = lines[0];
  const separatorLine = lines[1];
  const bodyLines = lines.slice(2);
  
  const headers = headerLine.split("|").map(h => h.trim()).filter(Boolean);
  const rows = bodyLines.map(line => 
    line.split("|").map(cell => cell.trim()).filter(Boolean)
  );
  
  // Check for alignment indicators
  const alignments = separatorLine?.split("|").map(cell => {
    if (cell.includes(":") && cell.includes("-")) {
      const start = cell.startsWith(":");
      const end = cell.endsWith(":");
      if (start && end) return "center" as const;
      if (end) return "right" as const;
    }
    return "left" as const;
  }).filter((_, i) => i < headers.length) || headers.map(() => "left" as const);
  
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 11,
        }}
      >
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th
                key={i}
                style={{
                  padding: "6px 10px",
                  background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
                  color: "#5b21b6",
                  fontWeight: 700,
                  textAlign: alignments[i],
                  borderBottom: "2px solid #a78bfa",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : "#fafafa" }}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: "5px 10px",
                    color: "#4c1d95",
                    textAlign: alignments[ci],
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderArrowDiagram(lines: string[]) {
  // Render arrow-based flow diagrams with enhanced styling
  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 12,
        lineHeight: 1.6,
      }}
    >
      {lines.map((line, i) => {
        // Detect arrow symbols and style them
        const hasArrow = line.includes("→") || line.includes("→") || 
                         line.includes("-->") || line.includes("==>");
        
        if (hasArrow) {
          // Split by arrow and create styled segments
          const parts = line.split(/(\s*[→→]\s*|\s*-->\s*|\s*==>\s*)/);
          
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 4,
                marginBottom: 4,
              }}
            >
              {parts.map((part, j) => {
                const isArrow = part.match(/^[→→]*$|^\s*-->\s*$|^\s*==>\s*$/);
                
                if (isArrow) {
                  return (
                    <span
                      key={j}
                      style={{
                        color: "#8b5cf6",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      →
                    </span>
                  );
                }
                
                return (
                  <span
                    key={j}
                    style={{
                      background: part.trim() ? "#ede9fe" : "transparent",
                      color: "#5b21b6",
                      padding: part.trim() ? "2px 8px" : 0,
                      borderRadius: 6,
                      fontWeight: 500,
                    }}
                  >
                    {part}
                  </span>
                );
              })}
            </div>
          );
        }
        
        // Non-arrow lines
        return (
          <div key={i} style={{ color: "#374151", marginBottom: 4 }}>
            {line}
          </div>
        );
      })}
    </div>
  );
}
