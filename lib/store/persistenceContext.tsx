"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

export type InitialDataSource = "cloud" | "local" | "empty";

export type PersistenceContextValue = {
  /** Where the hydrated Redux state came from on this page load */
  initialDataSource: InitialDataSource;
};

const PersistenceContext = createContext<PersistenceContextValue | null>(null);

export function PersistenceContextProvider({
  initialDataSource,
  children,
}: {
  initialDataSource: InitialDataSource;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ initialDataSource }),
    [initialDataSource]
  );
  return (
    <PersistenceContext.Provider value={value}>
      {children}
    </PersistenceContext.Provider>
  );
}

export function usePersistenceSource(): PersistenceContextValue {
  const ctx = useContext(PersistenceContext);
  if (!ctx) {
    throw new Error("usePersistenceSource must be used within PersistenceContextProvider");
  }
  return ctx;
}
