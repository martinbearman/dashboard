import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to use — Universal Dashboard",
  description: "What the dashboard does and how to get started.",
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-100 text-slate-800">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link href="/" className="text-sm font-semibold text-sky-700 hover:underline">
            ← Home
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg bg-gradient-to-r from-sky-500 via-sky-600 to-slate-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/20 hover:from-sky-400 hover:via-sky-500 hover:to-slate-500"
          >
            Open dashboard
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">How to use Universal Dashboard</h1>
        <p className="mt-4 text-lg text-slate-600">
          Universal Dashboard is a modular workspace: you arrange widgets (modules) on a grid, customize them, and
          your layout and settings can be saved in the browser on this device.
        </p>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">What it does</h2>
          <ul className="list-disc space-y-2 pl-5 text-slate-700">
            <li>Add modules from the app toolbar to build your own layout.</li>
            <li>Drag and resize modules when organize mode is available.</li>
            <li>Switch between dashboards or views using the tab bar when configured.</li>
            <li>State for your workspace is persisted locally in the browser (local storage) when you use the anonymous path.</li>
          </ul>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Getting started</h2>
          <ol className="list-decimal space-y-2 pl-5 text-slate-700">
            <li>From the home page, choose <strong className="text-slate-900">Launch</strong> to open the dashboard without an account.</li>
            <li>Use the floating controls to add modules and change modes (e.g. organise vs use).</li>
            <li>Open a module&apos;s settings from its menu when you need to configure it.</li>
          </ol>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Accounts and sign-in</h2>
          <p className="text-slate-700">
            Email, password, and Google sign-in are not available yet. When they ship, you&apos;ll be able to sync
            across devices; until then, local storage keeps your data on this browser only.
          </p>
        </section>

        <p className="mt-12 text-sm text-slate-500">
          <Link href="/" className="font-medium text-sky-700 hover:underline">
            Back to home
          </Link>
        </p>
      </article>
    </div>
  );
}
