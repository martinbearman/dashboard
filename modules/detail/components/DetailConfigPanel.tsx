"use client";

import { useState, useEffect } from "react";
import type { ModuleConfigProps } from "@/lib/types/dashboard";
import type { DetailModuleConfig, DetailLink, DetailLinkType } from "@/lib/types/dashboard";

/**
 * DetailConfigPanel
 *
 * Simple editor for the Detail module:
 * - Title (short label)
 * - Content (long-form text / notes)
 * - Image URLs (optional list)
 * - Links (optional list)
 *
 * This is intentionally minimal so it's easy to extend later
 * and easy for an AI to write to the same shape.
 */
export default function DetailConfigPanel({
  moduleId,
  config,
  onConfigChange,
  onClose,
}: ModuleConfigProps) {
  // Interpret the generic config blob as a DetailModuleConfig
  const typedConfig = (config ?? {}) as DetailModuleConfig;

  const [title, setTitle] = useState<string>(typedConfig.title ?? "Untitled detail");
  const [content, setContent] = useState<string>(typedConfig.content ?? "");
  const [imageUrlsText, setImageUrlsText] = useState<string>(
    (typedConfig.imageUrls ?? []).join("\n")
  );
  const [links, setLinks] = useState<DetailLink[]>(typedConfig.links ?? []);

  // Keep local state in sync if config changes externally
  useEffect(() => {
    if (typedConfig.title !== undefined) {
      setTitle(typedConfig.title);
    }
    if (typedConfig.content !== undefined) {
      setContent(typedConfig.content);
    }
    if (typedConfig.imageUrls !== undefined) {
      setImageUrlsText(typedConfig.imageUrls.join("\n"));
    }
    if (typedConfig.links !== undefined) {
      setLinks(typedConfig.links);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedConfig.title, typedConfig.content]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onConfigChange({
      ...config,
      title: newTitle,
    } as DetailModuleConfig);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onConfigChange({
      ...config,
      content: newContent,
    } as DetailModuleConfig);
  };

  const handleImageUrlsChange = (text: string) => {
    setImageUrlsText(text);
    const urls = text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    onConfigChange({
      ...config,
      imageUrls: urls,
    } as DetailModuleConfig);
  };

  const handleAddLink = () => {
    const newLink: DetailLink = {
      type: 'external',
      url: '',
      label: '',
    };
    const updatedLinks = [...links, newLink];
    setLinks(updatedLinks);
    onConfigChange({
      ...config,
      links: updatedLinks,
    } as DetailModuleConfig);
  };

  const handleUpdateLink = (index: number, updates: Partial<DetailLink>) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], ...updates };
    setLinks(updatedLinks);
    onConfigChange({
      ...config,
      links: updatedLinks,
    } as DetailModuleConfig);
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
    onConfigChange({
      ...config,
      links: updatedLinks,
    } as DetailModuleConfig);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter a short title..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Write detailed notes, breakdowns, or context here..."
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-y text-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URLs (one per line)
        </label>
        <textarea
          value={imageUrlsText}
          onChange={(e) => handleImageUrlsChange(e.target.value)}
          placeholder="https://example.com/image-1.png&#10;https://example.com/image-2.png"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-y text-gray-900"
        />
        <p className="mt-1 text-xs text-gray-500">
          Each non-empty line will be treated as an image URL and shown in the
          Detail module.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Links
          </label>
          <button
            type="button"
            onClick={handleAddLink}
            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            + Add Link
          </button>
        </div>
        
        {links.length === 0 ? (
          <p className="text-sm text-gray-500 italic py-2">
            No links added. Click &quot;Add Link&quot; to add internal or external links.
          </p>
        ) : (
          <div className="space-y-3">
            {links.map((link, index) => (
              <div
                key={index}
                className="p-3 border border-gray-300 rounded-md bg-gray-50"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={link.type}
                        onChange={(e) => {
                          const newType = e.target.value as DetailLinkType;
                          let updatedUrl = link.url;
                          
                          if (newType === 'external') {
                            // If switching to external and URL doesn't have protocol, add http://
                            // Don't prefix if URL is empty or starts with / (relative path)
                            if (updatedUrl && !updatedUrl.startsWith('http://') && !updatedUrl.startsWith('https://') && !updatedUrl.startsWith('/')) {
                              updatedUrl = `http://${updatedUrl}`;
                            }
                          } else if (newType === 'internal') {
                            // If switching to internal and URL has protocol, remove it
                            if (updatedUrl.startsWith('http://')) {
                              updatedUrl = updatedUrl.slice(7);
                            } else if (updatedUrl.startsWith('https://')) {
                              updatedUrl = updatedUrl.slice(8);
                            }
                          }
                          
                          handleUpdateLink(index, {
                            type: newType,
                            url: updatedUrl,
                          });
                        }}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                      >
                        <option value="external">External URL</option>
                        <option value="internal">Internal</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(index)}
                        className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md focus:outline-none"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => {
                        let newUrl = e.target.value;
                        const updates: Partial<DetailLink> = {};
                        
                        // Auto-detect link type when URL starts with http:// or https://
                        const isActuallyExternal = newUrl.startsWith('http://') || newUrl.startsWith('https://');
                        
                        // If link type is external and URL doesn't have protocol, prefix with http://
                        if (link.type === 'external' && newUrl && !isActuallyExternal && !newUrl.startsWith('/')) {
                          newUrl = `http://${newUrl}`;
                        }
                        
                        updates.url = newUrl;
                        
                        // If URL clearly has a protocol, auto-set to external
                        if (isActuallyExternal && link.type !== 'external') {
                          updates.type = 'external';
                        }
                        
                        handleUpdateLink(index, updates);
                      }}
                      placeholder={
                        link.type === 'internal'
                          ? "Path to internal resource (e.g., /api/files/document, /dashboards/123, or file path)"
                          : "https://example.com/page"
                      }
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                    />
                    
                    <input
                      type="text"
                      value={link.label || ''}
                      onChange={(e) =>
                        handleUpdateLink(index, {
                          label: e.target.value || undefined,
                        })
                      }
                      placeholder="Optional display label (leave empty to show URL)"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <p className="mt-2 text-xs text-gray-500">
          External links open in a new tab. Internal links are for resources
          within the app (files, dashboards, or other internal content).
        </p>
      </div>
    </div>
  );
}


