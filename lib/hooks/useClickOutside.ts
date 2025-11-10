"use client";

import { useEffect, useRef } from "react";

/**
 * Invoke `handler` when a pointer event happens outside the attached element.
 *
 * @param handler Function to call on outside interaction.
 * @param active  Optional flag; pass `false` to disable the listener temporarily.
 */
export function useClickOutside<T extends HTMLElement>(
  handler: () => void,
  active = true,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!ref.current) return;
      if (ref.current.contains(event.target as Node)) return;
      handler();
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [handler, active]);

  return ref;
}

