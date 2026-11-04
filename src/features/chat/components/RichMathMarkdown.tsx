import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface RichMathMarkdownProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Pre-processes text to ensure LaTeX math notation is recognized by remark-math.
 * Converts \( ... \) to $ ... $ and \[ ... \] to $$ ... $$.
 */
function normalizeMathDelimiters(text: string): string {
  if (!text) return "";
  let processed = text;
  // Convert \[ ... \] to $$ ... $$
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `$$${math}$$`);
  // Convert \( ... \) to $ ... $
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math}$`);
  return processed;
}

export function RichMathMarkdown({ content, className = "", inline = false }: RichMathMarkdownProps) {
  if (!content) return null;

  const normalized = normalizeMathDelimiters(content);

  return (
    <div className={`rich-math-markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => (
            <p className={inline ? "inline m-0 leading-relaxed" : "mb-2.5 last:mb-0 leading-relaxed"}>
              {children}
            </p>
          ),
          ul: ({ children }) => <ul className="list-disc pl-5 mb-2.5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-2.5 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="mb-0.5">{children}</li>,
          strong: ({ children }) => <strong className="font-bold text-inherit">{children}</strong>,
          em: ({ children }) => <em className="italic text-inherit">{children}</em>,
          code: ({ className: codeClassName, children, ...props }) => {
            const isInlineCode = !codeClassName;
            if (isInlineCode) {
              return (
                <code
                  className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded text-[0.9em] font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={codeClassName} {...props}>
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-purple-300 pl-3 my-2 italic text-gray-700">
              {children}
            </blockquote>
          ),
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}

export default RichMathMarkdown;

