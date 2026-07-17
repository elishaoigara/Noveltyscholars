import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="text-white font-bold text-xl">
              📚 NoveltyScholars
            </Link>
            <p className="text-sm text-gray-400">
              Professional academic writing services for students worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#services"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/order"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Order Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>support@noveltyscholars.com</li>
              <li>Available 24/7</li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500 text-center">
            <strong>Disclaimer:</strong> We provide model papers for reference purpose only. All
            work is intended to be used as research and reference material to assist students in
            their academic pursuits. We do not support or condone plagiarism.
          </p>
          <p className="text-sm text-gray-600 text-center mt-4">
            &copy; {new Date().getFullYear()} NoveltyScholars. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
