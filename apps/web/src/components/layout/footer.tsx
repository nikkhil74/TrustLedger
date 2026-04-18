import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-tl-border bg-tl-surface/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-tl-cyan to-tl-purple flex items-center justify-center">
                <span className="text-tl-deep font-bold text-sm">TL</span>
              </div>
              <span className="text-lg font-bold text-tl-text">
                Trust<span className="text-tl-cyan">Ledger</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-tl-text-muted max-w-xs">
              Hybrid Web3 credit scoring combining traditional finance with
              on-chain reputation.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-tl-text mb-3">Product</h4>
            <ul className="space-y-2">
              {['Features', 'How It Works', 'Pricing', 'API Docs'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-tl-text-muted hover:text-tl-cyan transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-tl-text mb-3">Resources</h4>
            <ul className="space-y-2">
              {['Documentation', 'Blog', 'Changelog', 'Status'].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-tl-text-muted hover:text-tl-cyan transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-tl-text mb-3">Legal</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-sm text-tl-text-muted hover:text-tl-cyan transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-tl-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-tl-text-muted">
            &copy; {new Date().getFullYear()} TrustLedger. All rights reserved.
          </p>
          <p className="text-xs text-tl-text-muted">
            Built on{' '}
            <span className="text-tl-purple">Polygon</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
