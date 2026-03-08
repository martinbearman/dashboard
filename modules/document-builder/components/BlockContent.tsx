"use client";

import type {
  DocumentBlock,
  HeadingBlock,
  ParagraphBlock,
  BulletsBlock,
  TableBlock,
  ImageBlock,
} from "@/lib/types/document";

interface BlockContentProps {
  block: DocumentBlock;
  isEditing?: boolean;
  onContentChange?: (updates: Record<string, unknown>) => void;
  onEditEnd?: () => void;
}

const inputClass =
  "w-full rounded border border-slate-200 px-2 py-1.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none";

function EditDoneBar({ onDone }: { onDone: () => void }) {
  return (
    <div className="mt-2 flex justify-end">
      <button
        type="button"
        onClick={onDone}
        className="rounded bg-slate-700 px-2 py-1 text-xs font-medium text-white hover:bg-slate-800"
      >
        Done
      </button>
    </div>
  );
}

/**
 * Renders a single block by type. Click to edit; when isEditing, shows inputs and Done.
 */
export default function BlockContent({
  block,
  isEditing = false,
  onContentChange,
  onEditEnd,
}: BlockContentProps) {
  if (isEditing && onContentChange && onEditEnd) {
    switch (block.type) {
      case "heading": {
        const b = block as HeadingBlock;
        return (
          <div className="space-y-2">
            <select
              value={b.level}
              onChange={(e) =>
                onContentChange({
                  level: Number(e.target.value) as 1 | 2 | 3,
                })
              }
              className={`${inputClass} w-auto`}
            >
              <option value={1}>Heading 1</option>
              <option value={2}>Heading 2</option>
              <option value={3}>Heading 3</option>
            </select>
            <input
              type="text"
              value={b.text ?? ""}
              onChange={(e) => onContentChange({ text: e.target.value })}
              className={inputClass}
              placeholder="Heading text"
              autoFocus
            />
            <EditDoneBar onDone={onEditEnd} />
          </div>
        );
      }
      case "paragraph": {
        const b = block as ParagraphBlock;
        return (
          <div className="space-y-2">
            <textarea
              value={b.text ?? ""}
              onChange={(e) => onContentChange({ text: e.target.value })}
              className={`${inputClass} min-h-[80px] resize-y`}
              placeholder="Paragraph text"
              autoFocus
            />
            <EditDoneBar onDone={onEditEnd} />
          </div>
        );
      }
      case "bullets": {
        const b = block as BulletsBlock;
        const items = b.items ?? [""];
        return (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-slate-400 pt-1.5">•</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = e.target.value;
                    onContentChange({ items: next });
                  }}
                  className={inputClass}
                  placeholder={`Item ${i + 1}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = items.filter((_, j) => j !== i);
                    onContentChange({ items: next.length ? next : [""] });
                  }}
                  className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove item"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                onContentChange({ items: [...items, ""] })
              }
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              + Add item
            </button>
            <EditDoneBar onDone={onEditEnd} />
          </div>
        );
      }
      case "table": {
        const b = block as TableBlock;
        const headers = b.headers ?? [""];
        const rows = b.rows ?? [[""]];
        return (
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-500">Headers</div>
            <div className="flex flex-wrap gap-2">
              {headers.map((h, i) => (
                <input
                  key={i}
                  type="text"
                  value={h}
                  onChange={(e) => {
                    const next = [...headers];
                    next[i] = e.target.value;
                    onContentChange({ headers: next });
                  }}
                  className={`${inputClass} max-w-[120px]`}
                  placeholder={`Col ${i + 1}`}
                />
              ))}
              <button
                type="button"
                onClick={() =>
                  onContentChange({ headers: [...headers, ""] })
                }
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                + Col
              </button>
            </div>
            <div className="text-xs font-medium text-slate-500 mt-2">Rows</div>
            {rows.map((row, ri) => (
              <div key={ri} className="flex flex-wrap gap-2 items-center">
                {row.map((cell, ci) => (
                  <input
                    key={ci}
                    type="text"
                    value={cell}
                    onChange={(e) => {
                      const nextRows = rows.map((r, i) =>
                        i === ri ? r.map((c, j) => (j === ci ? e.target.value : c)) : r
                      );
                      onContentChange({ rows: nextRows });
                    }}
                    className={`${inputClass} max-w-[100px]`}
                    placeholder=""
                  />
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const next = rows.filter((_, i) => i !== ri);
                    onContentChange({ rows: next.length ? next : [[""]] });
                  }}
                  className="rounded p-1 text-slate-400 hover:text-red-600"
                  aria-label="Remove row"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                onContentChange({
                  rows: [...rows, headers.map(() => "")],
                })
              }
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              + Add row
            </button>
            <EditDoneBar onDone={onEditEnd} />
          </div>
        );
      }
      case "image": {
        const b = block as ImageBlock;
        return (
          <div className="space-y-2">
            <input
              type="url"
              value={b.url ?? ""}
              onChange={(e) => onContentChange({ url: e.target.value })}
              className={inputClass}
              placeholder="Image URL"
              autoFocus
            />
            <input
              type="text"
              value={b.alt ?? ""}
              onChange={(e) => onContentChange({ alt: e.target.value })}
              className={inputClass}
              placeholder="Alt text"
            />
            <input
              type="text"
              value={b.caption ?? ""}
              onChange={(e) => onContentChange({ caption: e.target.value })}
              className={inputClass}
              placeholder="Caption (optional)"
            />
            <EditDoneBar onDone={onEditEnd} />
          </div>
        );
      }
      default:
        return (
          <div className="text-slate-500 italic text-sm">
            Unknown block type
          </div>
        );
    }
  }

  // Read-only view
  switch (block.type) {
    case "heading": {
      const b = block as HeadingBlock;
      const Tag = `h${b.level}` as keyof JSX.IntrinsicElements;
      return (
        <Tag className="font-semibold text-slate-800 tracking-tight">
          {b.text || "Heading"}
        </Tag>
      );
    }
    case "paragraph":
      return (
        <p className="text-slate-700 text-sm leading-relaxed">
          {(block as ParagraphBlock).text || "Paragraph text."}
        </p>
      );
    case "bullets": {
      const b = block as BulletsBlock;
      return (
        <ul className="list-disc list-inside text-slate-700 text-sm space-y-1">
          {b.items?.length
            ? b.items.map((item, i) => <li key={i}>{item || "Item"}</li>)
            : "• Add items"}
        </ul>
      );
    }
    case "table": {
      const b = block as TableBlock;
      return (
        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="min-w-full text-sm text-slate-700">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                {b.headers?.length
                  ? b.headers.map((h, i) => (
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
              {b.rows?.length
                ? b.rows.map((row, ri) => (
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
    }
    case "image": {
      const b = block as ImageBlock;
      return (
        <figure className="space-y-1">
          <img
            src={b.url || "https://via.placeholder.com/400x200?text=Image"}
            alt={b.alt ?? ""}
            className="w-full rounded border border-slate-200 object-cover max-h-48"
          />
          {b.caption && (
            <figcaption className="text-xs text-slate-500">
              {b.caption}
            </figcaption>
          )}
        </figure>
      );
    }
    default:
      return (
        <div className="text-slate-500 italic text-sm">
          Unknown block type
        </div>
      );
  }
}
