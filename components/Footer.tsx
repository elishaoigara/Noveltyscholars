import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-[#050b16] text-slate-300 border-t border-white/5">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <span className="text-2xl">☁️</span> NoveltyScholars
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Professional academic writing services for students worldwide.
            Essays, research papers, online classes, and exam help.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white text-sm tracking-wide mb-3">QUICK LINKS</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li><Link href="/services" className="hover:text-primary transition-colors">Our Services</Link></li>
            <li><Link href="/services/take-my-online-class" className="hover:text-primary transition-colors">Take My Online Class</Link></li>
            <li><Link href="/services/take-my-online-exam" className="hover:text-primary transition-colors">Take My Online Exam</Link></li>
            <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            <li><Link href="/order" className="hover:text-primary transition-colors">Order Now</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white text-sm tracking-wide mb-3">SUPPORT</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms &amp; Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white text-sm tracking-wide mb-3">CONTACT</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              
                href="mailto:noveltyscholars@gmail.com"
                className="hover:text-primary transition-colors break-all"
              >
                {"noveltyscholars@gmail.com"}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              
                href="tel:+12095600466"
                className="hover:text-primary transition-colors"
              >
                {"+1 (209) 560-0466"}
              </a>
            </li>
            <li className="text-primary font-medium">Available 24/7</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 py-6">
          <p className="text-sm text-slate-500 text-center max-w-3xl mx-auto">
            NoveltyScholars connects students with expert academic professionals
            for personalized tutoring, guided study support, and online class
            assistance. Our services are designed to help you understand course
            material, meet deadlines, and achieve your academic goals — with
            experienced specialists by your side every step of the way.
          </p>
          <p className="text-sm text-slate-600 text-center mt-4">
            &copy; {new Date().getFullYear()} NoveltyScholars. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}