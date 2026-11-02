import jsPDF from "jspdf";
import { RevisionSheetData } from "@/features/chat/components/ChatCards";

/**
 * Clean and format safe filename from topic title
 */
export function getRevisionSheetPdfFilename(topicTitle?: string): string {
  const safe = (topicTitle || "Revision-Sheet")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${safe || "cloop"}-revision-sheet.pdf`;
}

/**
 * Load image from URL, downsample to crisp print resolution (144x144 px), and convert to Base64 PNG.
 * Downsampling is essential: raw high-res images (e.g. 5044x5044 px favicon) cause jsPDF to embed
 * a 76MB uncompressed raster bitmap into the PDF stream!
 */
async function loadLogoBase64(src: string, targetPx: number = 144): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = targetPx;
        canvas.height = targetPx;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, targetPx, targetPx);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Generate a clean, beautifully styled Revision Sheet PDF that matches the Cloop UI
 */
export async function generateRevisionSheetPdf(data: RevisionSheetData): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 18;
  const rightMargin = 18;
  const contentWidth = pageWidth - leftMargin - rightMargin; // 174mm
  const topMargin = 18;
  const bottomMargin = 18;

  let currentY = topMargin;

  // Try to load the official Cloop favicon logo (downsampled to 144x144 px for crisp 300 DPI print quality)
  const logoDataUrl = await loadLogoBase64("/favicon.ico", 144);

  // Helper to ensure vertical space, triggering a page break if needed
  const ensureSpace = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      currentY = topMargin;
      drawSubsequentHeader();
    }
  };

  // Header drawn on pages 2+
  const drawSubsequentHeader = () => {
    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, "PNG", leftMargin, currentY, 6, 6, "cloop-logo", "FAST");
      } catch {
        // Fallback
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 27, 75);
    const textX = logoDataUrl ? leftMargin + 8 : leftMargin;
    doc.text("Cloop Revision Sheet", textX, currentY + 4.5);

    if (data.topic) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      const truncated = data.topic.length > 50 ? data.topic.substring(0, 48) + "..." : data.topic;
      doc.text(`— ${truncated}`, textX + doc.getTextWidth("Cloop Revision Sheet ") + 2, currentY + 4.5);
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, currentY + 8, leftMargin + contentWidth, currentY + 8);

    currentY += 13;
  };

  // ─────────────────────────────────────────────────────────────
  // 1. BRAND HEADER (Matching Cloop platform branding)
  // ─────────────────────────────────────────────────────────────
  const drawMainHeader = () => {
    const logoSize = 12;

    if (logoDataUrl) {
      try {
        // Embed the authentic Cloop favicon icon (reusing the 'cloop-logo' XObject)
        doc.addImage(logoDataUrl, "PNG", leftMargin, currentY, logoSize, logoSize, "cloop-logo", "FAST");
      } catch {
        // Vector fallback if image embedding fails
        doc.setFillColor(216, 180, 254);
        doc.roundedRect(leftMargin, currentY, logoSize, logoSize, 2.5, 2.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(0, 0, 0);
        doc.text("C.", leftMargin + 2.5, currentY + 8);
      }
    } else {
      // Vector fallback
      doc.setFillColor(216, 180, 254);
      doc.roundedRect(leftMargin, currentY, logoSize, logoSize, 2.5, 2.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text("C.", leftMargin + 2.5, currentY + 8);
    }

    // Brand Name "Cloop"
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(26, 10, 60); // #1A0A3C
    doc.text("Cloop", leftMargin + logoSize + 3.5, currentY + 7);

    // Tagline
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text("AI Academic Tutor  •  Concept Mastery", leftMargin + logoSize + 3.5, currentY + 11);

    // Right Side: REVISION SHEET Badge
    const badgeText = "REVISION SHEET";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const badgeWidth = doc.getTextWidth(badgeText) + 8;
    const badgeX = leftMargin + contentWidth - badgeWidth;

    doc.setFillColor(241, 245, 249); // #F1F5F9
    doc.setDrawColor(203, 213, 225); // #CBD5E1
    doc.setLineWidth(0.3);
    doc.roundedRect(badgeX, currentY + 1, badgeWidth, 6, 2, 2, "FD");

    doc.setTextColor(71, 85, 105); // Slate-600
    doc.text(badgeText, badgeX + 4, currentY + 5.1);

    // Current Date
    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate-400
    const dateWidth = doc.getTextWidth(today);
    doc.text(today, leftMargin + contentWidth - dateWidth, currentY + 11);

    // Divider Line
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.4);
    doc.line(leftMargin, currentY + 15, leftMargin + contentWidth, currentY + 15);

    currentY += 21;
  };

  drawMainHeader();

  // ─────────────────────────────────────────────────────────────
  // 2. TOPIC TITLE (Matches the UI: clean, bold, no clunky box)
  // ─────────────────────────────────────────────────────────────
  const topicTitle = data.topic || "Topic Revision Sheet";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 27, 75); // #1E1B4B
  const topicLines: string[] = doc.splitTextToSize(topicTitle, contentWidth);

  ensureSpace(topicLines.length * 6.5 + 4);
  doc.text(topicLines, leftMargin, currentY + 5);

  currentY += topicLines.length * 6.5 + 4;

  // ─────────────────────────────────────────────────────────────
  // 3. KEY CONCEPTS (Clean Amber Section Header & Indented Points)
  // ─────────────────────────────────────────────────────────────
  const concepts = data.key_concepts?.length
    ? data.key_concepts
    : data.key_points?.length
    ? data.key_points
    : data.concepts_covered;

  if (concepts && concepts.length > 0) {
    ensureSpace(12);

    // Section title matching UI: Key Concepts (#B45309)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9); // #B45309
    doc.text("Key Concepts", leftMargin, currentY + 3);
    currentY += 6.5;

    // Concept Points
    concepts.forEach((concept) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const lines: string[] = doc.splitTextToSize(concept, contentWidth - 8);
      const blockHeight = lines.length * 4.6 + 2;

      ensureSpace(blockHeight);

      // Clean amber circular bullet
      doc.setFillColor(217, 119, 6); // #D97706
      doc.circle(leftMargin + 2, currentY + 2.2, 0.9, "F");

      // Text in clean dark slate (#334155)
      doc.setTextColor(51, 65, 85);
      doc.text(lines, leftMargin + 6, currentY + 3.3);

      currentY += blockHeight;
    });

    currentY += 3;
  }

  // ─────────────────────────────────────────────────────────────
  // 4. DEFINITIONS (Pink Section Header & Clean Term: Definition)
  // ─────────────────────────────────────────────────────────────
  if (data.definitions && data.definitions.length > 0) {
    ensureSpace(12);

    // Section title matching UI: Definitions (#DB2777)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(219, 39, 119); // #DB2777
    doc.text("Definitions", leftMargin, currentY + 3);
    currentY += 6.5;

    data.definitions.forEach((d) => {
      // In the UI: Term in #6B40D8, Definition in #334155
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      const termStr = `${d.term}: `;
      const termWidth = doc.getTextWidth(termStr);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const fullText = `${d.term}:  ${d.definition}`;
      const lines: string[] = doc.splitTextToSize(fullText, contentWidth - 4);
      const itemHeight = lines.length * 4.6 + 2;

      ensureSpace(itemHeight);

      // Check if definition fits on the first line next to the term
      const firstLineDefWidth = contentWidth - 4 - termWidth;
      const defWords = d.definition.split(" ");
      let firstLineDef = "";
      let remainingDef = "";
      let isMultiLine = false;

      for (let i = 0; i < defWords.length; i++) {
        const test = firstLineDef ? `${firstLineDef} ${defWords[i]}` : defWords[i];
        if (doc.getTextWidth(test) <= firstLineDefWidth) {
          firstLineDef = test;
        } else {
          remainingDef = defWords.slice(i).join(" ");
          isMultiLine = true;
          break;
        }
      }

      // Draw Term in vibrant purple (#6B40D8)
      doc.setFont("helvetica", "bold");
      doc.setTextColor(107, 64, 216);
      doc.text(termStr, leftMargin + 2, currentY + 3.3);

      // Draw first part of Definition in dark slate (#334155)
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.text(firstLineDef, leftMargin + 2 + termWidth, currentY + 3.3);

      if (isMultiLine && remainingDef) {
        const remainingLines: string[] = doc.splitTextToSize(remainingDef, contentWidth - 4);
        doc.text(remainingLines, leftMargin + 2, currentY + 3.3 + 4.6);
      }

      currentY += itemHeight;
    });

    currentY += 3;
  }

  // ─────────────────────────────────────────────────────────────
  // 5. FORMULAS (if present)
  // ─────────────────────────────────────────────────────────────
  if (data.formulas && data.formulas.length > 0) {
    ensureSpace(12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229); // #4F46E5
    doc.text("Formulas", leftMargin, currentY + 3);
    currentY += 6.5;

    data.formulas.forEach((f) => {
      const symbolsText = f.symbols ? ` (${f.symbols})` : "";
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const fullText = `${f.name}: ${f.expression}${symbolsText}`;
      const lines: string[] = doc.splitTextToSize(fullText, contentWidth - 12);
      const boxHeight = lines.length * 4.6 + 4;

      ensureSpace(boxHeight + 2);

      // Light indigo card matching UI
      doc.setFillColor(238, 242, 255); // #EEF2FF
      doc.setDrawColor(224, 231, 255); // #E0E7FF
      doc.setLineWidth(0.3);
      doc.roundedRect(leftMargin, currentY, contentWidth, boxHeight, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 27, 75);
      doc.text(`${f.name}: `, leftMargin + 4, currentY + 4.5);

      const nameW = doc.getTextWidth(`${f.name}: `);
      doc.setFont("courier", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(79, 70, 229);
      doc.text(f.expression, leftMargin + 4 + nameW, currentY + 4.5);

      if (f.symbols) {
        const exprW = doc.getTextWidth(f.expression);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(` (${f.symbols})`, leftMargin + 4 + nameW + exprW + 1, currentY + 4.5);
      }

      currentY += boxHeight + 2.5;
    });

    currentY += 3;
  }

  // ─────────────────────────────────────────────────────────────
  // 6. QUICK RECALL TIPS & COMMON MISTAKES
  // ─────────────────────────────────────────────────────────────
  const tips = data.quick_recall_tips?.length
    ? data.quick_recall_tips
    : data.common_mistakes?.length
    ? data.common_mistakes
    : data.one_minute_recall;

  if (tips && tips.length > 0) {
    ensureSpace(12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(220, 38, 38); // #DC2626
    doc.text("Quick Recall Tips", leftMargin, currentY + 3);
    currentY += 6.5;

    tips.forEach((tip) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const lines: string[] = doc.splitTextToSize(tip, contentWidth - 8);
      const blockHeight = lines.length * 4.6 + 2;

      ensureSpace(blockHeight);

      // Red circular bullet
      doc.setFillColor(220, 38, 38);
      doc.circle(leftMargin + 2, currentY + 2.2, 0.9, "F");

      doc.setTextColor(51, 65, 85);
      doc.text(lines, leftMargin + 6, currentY + 3.3);

      currentY += blockHeight;
    });

    currentY += 3;
  }

  // ─────────────────────────────────────────────────────────────
  // 7. PRACTICE NEXT TIME (Soft Green Card matching UI)
  // ─────────────────────────────────────────────────────────────
  if (data.practice_next_time) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const lines: string[] = doc.splitTextToSize(data.practice_next_time, contentWidth - 12);
    const boxHeight = lines.length * 4.4 + 9;

    ensureSpace(boxHeight + 4);

    // Green container box matching UI: background #F0FDF4, border #BBF7D0
    doc.setFillColor(240, 253, 244); // #F0FDF4
    doc.setDrawColor(187, 247, 208); // #BBF7D0
    doc.setLineWidth(0.3);
    doc.roundedRect(leftMargin, currentY, contentWidth, boxHeight, 2.5, 2.5, "FD");

    // Title: Practice Next Time (#166534)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(22, 101, 52); // #166534
    doc.text("Practice Next Time", leftMargin + 5, currentY + 5);

    // Content: #14532D
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(20, 83, 45); // #14532D
    doc.text(lines, leftMargin + 5, currentY + 9.5);

    currentY += boxHeight + 4;
  }

  // ─────────────────────────────────────────────────────────────
  // 7b. RECOMMENDED VIDEO LESSONS (Clickable links in PDF)
  // ─────────────────────────────────────────────────────────────
  if (data.recommended_videos && data.recommended_videos.length > 0) {
    ensureSpace(14);

    // Section Title: Recommended Video Lessons (#4338CA)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(67, 56, 202); // #4338CA
    doc.text("Recommended Video Lessons", leftMargin, currentY + 3);
    currentY += 7;

    data.recommended_videos.forEach((video) => {
      ensureSpace(12);

      // Play icon circle
      doc.setFillColor(239, 68, 68); // Red #EF4444
      doc.circle(leftMargin + 2.5, currentY + 2.2, 1.4, "F");

      // Draw white triangle inside play circle
      doc.setFillColor(255, 255, 255);
      doc.triangle(
        leftMargin + 2.1, currentY + 1.2,
        leftMargin + 2.1, currentY + 3.2,
        leftMargin + 3.3, currentY + 2.2,
        "F"
      );

      // Video title as clickable link in Indigo (#4F46E5)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(79, 70, 229); // #4F46E5

      const titleLines: string[] = doc.splitTextToSize(video.title, contentWidth - 12);
      titleLines.forEach((line: string, lineIdx: number) => {
        const textY = currentY + 3 + lineIdx * 4.2;
        doc.text(line, leftMargin + 6, textY);
        // Add PDF hyperlink to URL
        if (video.url) {
          const textWidth = doc.getTextWidth(line);
          doc.link(leftMargin + 6, textY - 3, textWidth, 4.2, { url: video.url });
        }
      });

      const titleHeight = titleLines.length * 4.2;

      // Channel & Duration below title
      if (video.channel || video.duration) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139); // Slate-500
        const details = [video.channel, video.duration].filter(Boolean).join("  •  ");
        doc.text(details, leftMargin + 6, currentY + 3 + titleHeight);
      }

      currentY += titleHeight + 6;
    });

    currentY += 2;
  }

  // ─────────────────────────────────────────────────────────────
  // 8. RUNNING FOOTER ON EVERY PAGE
  // ─────────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    const footerY = pageHeight - 11;

    // Divider line
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.3);
    doc.line(leftMargin, footerY, leftMargin + contentWidth, footerY);

    // Left: Cloop branding & website
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(107, 64, 216); // #6B40D8
    doc.text("Cloop", leftMargin, footerY + 4.5);

    const brandWidth = doc.getTextWidth("Cloop");
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text("  •  Learn Smarter, Grow Faster  •  cloopapp.com", leftMargin + brandWidth, footerY + 4.5);

    // Right: Page number
    const pageStr = `Page ${p} of ${totalPages}`;
    const pageStrWidth = doc.getTextWidth(pageStr);
    doc.text(pageStr, leftMargin + contentWidth - pageStrWidth, footerY + 4.5);
  }

  // Trigger browser download
  const filename = getRevisionSheetPdfFilename(data.topic);
  doc.save(filename);
}
