"use client";

import type { DocumentBlock } from "@/lib/types/document";

interface BlockContentProps {
  block: DocumentBlock;
  isEditing?: boolean;
  onContentChange?: (updates: Record<string, unknown>) => void;
}

/**
 * Renders a single block by type. Prototype: read-only display.
 */
export default function BlockContent({
  block,
  isEditing = false,
}: BlockContentProps) {
  switch (block.type) {
    case "heading": {
      const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
      return (
        <Tag className="font-semibold text-slate-800 tracking-tight">
          {block.text || "Heading"}
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p className="text-slate-700 text-sm leading-relaxed">
          {block.text || "Paragraph text."}
        </p>
      );
    case "bullets":
      return (
        <ul className="list-disc list-inside text-slate-700 text-sm space-y-1">
          {block.items?.length
            ? block.items.map((item, i) => (
                <li key={i}>{item || "Item"}</li>
              ))
            : "• Add items"}
        </ul>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="min-w-full text-sm text-slate-700">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                {block.headers?.length
                  ? block.headers.map((h, i) => (
                      <th
                        key={i}
                        className="px-3 py-2 text-left font-medium text-slate-800"
                      >
                        {h || `Col ${i + 1}`}
                      </th>
                    ))
                  : (
                    <th className="px-3 py-2 text-left font-medium text-slate-800">
                      Column
                    </th>
                  )}
              </tr>
            </thead>
            <tbody>
              {block.rows?.length
                ? block.rows.map((row, ri) => (
                    <tr
                      key={ri}
                      className="border-b border-slate-100 last:border-0"
                    >
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                : (
                  <tr>
                    <td className="px-3 py-2 text-slate-500 italic">
                      No rows
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      );
    case "image":
      return (
        <figure className="space-y-1">
          <img
            src={block.url || "https://via.placeholder.com/400x200?text=Image"}
            alt={block.alt ?? ""}
            className="w-full rounded border border-slate-200 object-cover max-h-48"
          />
          {block.caption && (
            <figcaption className="text-xs text-slate-500">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    default:
      return (
        <div className="text-slate-500 italic text-sm">
          Unknown block type
        </div>
      );
  }
}
