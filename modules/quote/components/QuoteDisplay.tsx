"use client";

import { useState, useEffect } from "react";
import { ModuleProps } from "@/lib/types/dashboard";

interface Quote {
  text: string; // Quote text
  author: string; // Author name
  html: string; // HTML version of the quote
}

export default function QuoteDisplay({ moduleId, config }: ModuleProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/quote");
      
      if (!response.ok) {
        throw new Error("Failed to fetch quote.");
      }
      
      const data: Array<{ q: string; a: string; h: string }> = await response.json();
      
      if (data && data.length > 0) {
        // Map API response to readable format
        // API uses: q = quote text, a = author, h = HTML version
        const apiQuote = data[0];
        setQuote({
          text: apiQuote.q,    // q = quote text from API
          author: apiQuote.a,  // a = author from API
          html: apiQuote.h,    // h = HTML version from API
        });
      } else {
        throw new Error("No quote received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something not right, I couldn't load the quote.");
      console.error("Error fetching quote:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  const getWikipediaUrl = (author: string): string => {
    // Convert author name to Wikipedia URL format
    // Replace spaces with underscores and encode the URL
    const wikiTitle = author.trim().replace(/\s+/g, "_");
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTitle)}`;
  };

  // Show full-screen error only on initial load (when no quote exists)
  const showFullScreenError = error && !quote && !loading;

  return (
    <div className="h-full w-full px-4 py-0 flex flex-col justify-between rounded-lg">
      {loading && !quote && (
        <div className="flex items-center justify-center h-full">
          <div className="text-red-600 animate-pulse">Loading quote...</div>
        </div>
      )}

      {showFullScreenError && (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="text-red-600 text-sm">{error}</div>
          <button
            onClick={fetchQuote}
            className="px-4 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {quote && (
        <>
          <div className="flex-1 flex flex-col justify-center">
            <blockquote className="text-xl md:text-xl font-medium text-gray-800 mb-4 italic">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            <footer className="text-lg md:text-xl text-red-600 font-semibold">
              —{" "}
              <a
                href={getWikipediaUrl(quote.author)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-700 hover:underline transition-colors"
              >
                {quote.author}
              </a>
            </footer>
          </div>
          
          <div className="relative mt-4 pt-4 border-t border-gray-700">
            <button
              onClick={fetchQuote}
              className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-400 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              aria-label="Get quote"
            >
              {loading ? "Loading..." : "get quote"}
            </button>
            <div className="flex items-center justify-between">
              {error && quote && (
                <span className="text-xs text-red-600 italic whitespace-nowrap">
                  ⚠ {error}
                </span>
              )}
              
              <a
                href="https://zenquotes.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-600 hover:text-red-700 transition-colors ml-auto"
              >
                via ZenQuotes
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

