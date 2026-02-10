"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ModuleProps, ArticleBodyModuleConfig } from "@/lib/types/dashboard";

/**
 * Article module
 *
 * Displays long-form markdown content, typically used as the main story
 * in a dashboard layout. Content is expected to be populated by the LLM
 * or via the module config panel.
 */
export default function ArticleModule({ moduleId, config }: ModuleProps) {
  const articleConfig = (config ?? {}) as ArticleBodyModuleConfig;
  const { title, body, style = "primary" } = articleConfig;

  const hasBody = typeof body === "string" && body.trim().length > 0;

  const headingClasses =
    style === "primary"
      ? "text-xl font-semibold tracking-tight text-slate-900"
      : "text-lg font-semibold tracking-tight text-slate-800";

  if (!hasBody) {
    return (
      <div className="flex h-full w-full items-center justify-center px-4 py-6 text-sm text-gray-500 italic">
        No article content yet.
      </div>
    );
  }

  return (
    <article className="flex h-full w-full flex-col overflow-auto px-4 py-4 gap-3">
      {title && <h2 className={headingClasses}>{title}</h2>}
      <div className="prose prose-sm max-w-none text-slate-800 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:list-inside [&_ol]:list-inside [&_pre]:bg-slate-100 [&_pre]:p-2 [&_pre]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:rounded [&_h1]:font-bold [&_h1]:text-lg [&_h2]:font-bold [&_h2]:text-base [&_p]:my-1 leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </div>
    </article>
  );
}

