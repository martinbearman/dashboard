import Link from "next/link";

function GoogleMark() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

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
          <div className="hidden items-center gap-3 md:flex md:gap-4">
            {/* <Link href="/guide" className="text-sm font-medium text-slate-500 hover:text-slate-900">
              How to use
            </Link>
            <span className="text-sm font-medium text-slate-500 cursor-not-allowed" title="Coming soon">
              Sign in
            </span> */}
            <button
              type="button"
              disabled
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white opacity-60 cursor-not-allowed"
              title="Coming soon"
            >
              Get started
            </button>
          </div>
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
                <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900">Create Dashboard</h1>
                <p className="mt-2 text-sm text-slate-600">
                  No account required. Session data persists in local storage.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-6 flex w-full min-w-0 max-w-full items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 via-sky-600 to-slate-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition hover:from-sky-400 hover:via-sky-500 hover:to-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 sm:w-1/2"
                >
                  Create new dashboard
                </Link>
              </div>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              New here?{" "}
              <Link href="/guide" className="font-medium text-sky-700 underline-offset-4 hover:underline">
                How to use the dashboard
              </Link>
            </p>
          </div>
        </section>

        {/* Right: auth — UI placeholder until auth is implemented */}
        <section className="flex flex-1 flex-col justify-center py-12 lg:min-w-0 lg:bg-white/90 lg:py-14 lg:backdrop-blur-sm">
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
                Sign-in coming soon
              </p>

              <div className="pointer-events-none select-none opacity-[0.55] grayscale">
                <div className="mb-8 space-y-1 text-center lg:text-left">
                  <h2 id="auth-heading" className="text-2xl font-semibold text-slate-900">
                    Welcome back
                  </h2>
                  <p className="text-sm text-slate-500">Please enter your details to continue.</p>
                </div>

                <div className="space-y-5">
                  <button
                    type="button"
                    disabled
                    className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 shadow-sm"
                    title="Coming soon"
                  >
                    <GoogleMark />
                    Continue with Google
                    <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Soon
                    </span>
                  </button>

                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs font-medium uppercase tracking-wide">
                      <span className="bg-slate-100/90 px-3 text-slate-400">or</span>
                    </div>
                  </div>

                  <div className="space-y-4">
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
