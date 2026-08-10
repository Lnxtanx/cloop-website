import React from "react";

export function DiffText({ html }: { html: string }) {
  if (!html) return null;
  const parts = html.replace(/<\/?p>/g, "").split(/(<del>.*?<\/del>|<ins>.*?<\/ins>)/g);
  return (
    <span className="correction" style={{ fontSize: 14, lineHeight: 1.6 }}>
      {parts.map((p, i) => {
        if (p.startsWith("<del>"))
          return <del key={i}>{p.replace(/<\/?del>/g, "")}</del>;
        if (p.startsWith("<ins>"))
          return <ins key={i}>{p.replace(/<\/?ins>/g, "")}</ins>;
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
}

export function stripTags(html: string) {
  return html ? html.replace(/<[^>]+>/g, "") : "";
}

export default DiffText;
