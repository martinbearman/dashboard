import Link from "next/link";
import GoogleSignInButton from "@/components/landing/GoogleSignInButton";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-800">
      <header className="border-b border-slate-300 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 md:gap-4 md:px-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
            Universal Dashboard
          </Link>
          {/* <nav
            className="order-3 flex w-full justify-center gap-6 text-sm font-medium text-slate-500 md:order-none md:w-auto md:gap-8"
            aria-label="Primary"
          >
            <a href="#product" className="transition hover:text-slate-900">
              Product
            </a>
            <a href="#workspace" className="transition hover:text-slate-900">
              Solutions
            </a>
            <span className="cursor-not-allowed text-slate-400" title="Coming soon">
              Pricing
            </span>
            <span className="cursor-not-allowed text-slate-400" title="Coming soon">
              Support
            </span>
          </nav> */}
        </div>
      </header>

      <div className="flex w-full flex-1 flex-col bg-gradient-to-b to-blue-100 from-slate-600">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 md:px-6 lg:flex-row lg:min-h-0 lg:gap-8">
        {/* Left: hero + anonymous card */}
        <section
          id="product"
          className="relative flex flex-col justify-center px-0 pb-0 pt-12 sm:px-6 sm:py-14 lg:flex-1 lg:min-w-0 lg:px-8 lg:py-16"
        >
          {/* <div className="max-w-xl space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-slate-800 md:text-5xl lg:text-[2.75rem] lg:leading-tight">
              Atmospheric Clarity
            </h1>
            <p className="text-base leading-relaxed text-slate-600 md:text-lg">
              Our platform provides institutional stability and high-fidelity precision, ensuring your digital assets are
              managed within a transparent, serene environment designed for focus and performance.
            </p>
          </div> */}

          <div id="workspace">
            <div className="relative rounded-xl border border-slate-200/80 bg-white/90 p-6 shadow-lg shadow-slate-200/60 backdrop-blur-sm">
              {/* <span className="absolute left-5 top-5 inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Incognito
              </span> */}
              <div className="py-7">
                <div className="mx-auto w-full max-w-md text-center lg:text-left">
                  <h1 className="text-2xl font-semibold text-slate-900 lg:text-3xl">Create a Dashboard</h1>
                  <p className="mt-2 text-sm text-slate-600">
                    No account required. Session data persists in local storage.
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="mt-6 flex w-full min-w-0 max-w-full items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 via-sky-600 to-slate-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition hover:from-sky-400 hover:via-sky-500 hover:to-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 sm:w-1/2 max-lg:mx-auto lg:mx-0"
                >
                  Create new dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Right: auth */}
        <section className="flex flex-1 flex-col justify-center py-12 lg:min-w-0 lg:py-14">
          <div className="mx-auto w-full max-w-md">
            <div
              role="region"
              aria-labelledby="auth-heading"
              aria-describedby="auth-soon-note"
              className="rounded-2xl border border-dashed border-slate-300/90 bg-slate-100/70 p-6 shadow-inner ring-1 ring-slate-200/40 md:p-8"
            >
              <p
                id="auth-soon-note"
                className="mb-6 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500"
              >
                Account sign-in
              </p>

              <div className="mb-8 space-y-1 text-center lg:text-left">
                <h2 id="auth-heading" className="text-2xl font-semibold text-slate-900">
                  Welcome back
                </h2>
                <p className="text-sm text-slate-500">Sign in with Google or use email when available.</p>
              </div>

              <div className="space-y-5">
                <GoogleSignInButton />

                <div className="pointer-events-none select-none">
                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide">
                      <span className="bg-slate-100/90 px-3 text-slate-400">or</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-5">
                    <div>
                      <label
                        htmlFor="landing-email"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                      >
                        Email address
                      </label>
                      <input
                        id="landing-email"
                        type="email"
                        placeholder="name@company.com"
                        disabled
                        tabIndex={-1}
                        autoComplete="email"
                        className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label
                          htmlFor="landing-password"
                          className="text-xs font-semibold uppercase tracking-wide text-slate-600"
                        >
                          Password
                        </label>
                        <span className="cursor-not-allowed text-xs font-medium text-slate-400">Forgot?</span>
                      </div>
                      <input
                        id="landing-password"
                        type="password"
                        placeholder="••••••••"
                        disabled
                        tabIndex={-1}
                        autoComplete="current-password"
                        className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-lg bg-gradient-to-r from-sky-500 via-sky-600 to-slate-600 py-3.5 text-sm font-semibold text-white"
                    title="Coming soon"
                  >
                    Sign in — coming soon
                  </button>

                  <p className="text-center text-sm text-slate-600">
                    Don&apos;t have an account?{" "}
                    <span className="cursor-not-allowed font-bold text-slate-800">Create account</span>
                  </p>
                </div>
                </div>
              </div>
            </div>
        </section>
        </div>
      </div>

      <footer className="border-t border-slate-200 bg-slate-50/80 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-xs text-slate-500 md:flex-row md:justify-between md:px-6">
          {/* <span className="font-semibold text-slate-700">Universal Dashboard</span> */}
          <p className="text-center">© 2026 Universal Dashboard. All rights reserved.</p>
          {/* <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="Footer">
            <a href="#" className="hover:text-slate-800">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-800">
              Terms of Service
            </a>
            <a href="#" className="hover:text-slate-800">
              Cookies
            </a>
            <Link href="/guide" className="font-medium text-sky-700 hover:text-sky-800">
              How to use
            </Link>
          </nav> */}
        </div>
      </footer>
    </div>
  );
}
