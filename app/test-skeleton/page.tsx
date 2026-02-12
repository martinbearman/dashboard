"use client";

import { DashboardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function TestSkeletonPage() {
  return (
    <div className="space-y-8">
      {/* Full Dashboard Skeleton */}
      <DashboardSkeleton />

      {/* Individual Skeleton examples */}
      <div className="container mx-auto px-4 py-8 space-y-4">
        <h2 className="text-white text-lg font-semibold">Individual Skeleton Examples</h2>
        <Skeleton className="h-4 w-64 bg-slate-700/60" />
        <Skeleton className="h-4 w-48 bg-slate-700/60" />
        <Skeleton className="h-10 w-32 bg-slate-700/60" />
        <Skeleton className="h-24 w-full bg-white/5" />
      </div>
    </div>
  );
}
