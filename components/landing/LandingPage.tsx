import Link from "next/link";
import GoogleSignInButton from "@/components/landing/GoogleSignInButton";

function BrandMark() {
  return (
    <svg
      className="h-9 w-9 shrink-0 text-[#1D63ED]"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="2" y="2" width="12" height="12" rx="2" fill="currentColor" opacity="0.95" />
      <rect x="18" y="2" width="12" height="12" rx="2" fill="currentColor" opacity="0.75" />
      <rect x="2" y="18" width="12" height="12" rx="2" fill="currentColor" opacity="0.75" />
      <rect x="18" y="18" width="12" height="12" rx="2" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg className="h-5 w-5 shrink-0 text-neutral-900" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.481 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.107 22 16.373 22 11.969 22 6.463 17.522 2 12 2z"
      />
    </svg>
  );
}

function KeyMark() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-neutral-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f9f9f9] text-neutral-900">
      <header className="w-full shrink-0 border-b border-neutral-300 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 md:gap-4 md:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-neutral-900">
            Universal Dashboard
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-[400px] space-y-3">
          <div className="rounded-md border border-neutral-300 bg-white px-8 py-10 shadow-sm">
            <div className="mb-8 flex flex-col items-center gap-1">
              <div className="flex items-center gap-2.5">
                <BrandMark />
                <span className="text-[1.35rem] font-semibold tracking-tight text-[#1D63ED]">
                  Universal Dashboard
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="mx-auto w-full max-w-md text-center">
                {/* <h2 className="text-xl font-semibold text-neutral-900">Create a Dashboard</h2> */}
                <p className="mt-2 text-sm text-neutral-600">No account required. (Local Storage Only)</p>
              </div>
              <Link
                href="/dashboard"
                className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 via-sky-600 to-slate-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition hover:from-sky-400 hover:via-sky-500 hover:to-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
              >
                Got to your dashboard
              </Link>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                <span className="bg-white px-3">or</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="mx-auto w-full max-w-md space-y-3 text-center">
                <p className="mt-2 text-sm text-neutral-600">
                  Sign in to save your dashboard in the cloud and access it on any device.
                </p>
                <GoogleSignInButton />
              </div>

              <button
                type="button"
                disabled
                title="Coming soon"
                className="flex w-full cursor-not-allowed items-center rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-500 opacity-70"
              >
                <span className="flex w-9 shrink-0 justify-start">
                  <GitHubMark />
                </span>
                <span className="flex-1 pr-9 text-center">Continue with GitHub</span>
              </button>
              <button
                type="button"
                disabled
                title="Coming soon"
                className="flex w-full cursor-not-allowed items-center rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-500 opacity-70"
              >
                <span className="flex w-9 shrink-0 justify-start">
                  <KeyMark />
                </span>
                <span className="flex-1 pr-9 text-center">Continue with SSO</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-200/80 py-5">
        <p className="text-center text-xs text-neutral-500">© 2026 Universal Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
}
