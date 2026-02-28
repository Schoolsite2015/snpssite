import { Link } from "wouter";
import { Phone, MapPin, Globe, Mail, School } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <School className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <div className="font-bold text-lg leading-tight">S.N. Public School</div>
                <div className="text-xs text-primary-foreground/70">स.न. पब्लिक स्कूल</div>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/75 leading-relaxed">
              Committed to excellence in education and holistic development of students since our establishment. Shaping tomorrow's leaders today.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-secondary mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About Us" },
                { href: "/admissions", label: "Admissions" },
                { href: "/gallery", label: "Gallery" },
                { href: "/contact", label: "Contact" },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-primary-foreground/75 hover:text-secondary cursor-pointer transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-secondary mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-primary-foreground/75">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-secondary" />
                <span>Varanasi–Lucknow Road, Pindra, Uttar Pradesh – 221206</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/75">
                <Phone className="w-4 h-4 flex-shrink-0 text-secondary" />
                <span>9151312209, 7398312209</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/75">
                <Globe className="w-4 h-4 flex-shrink-0 text-secondary" />
                <a href="https://stsnpublicschool.com" className="hover:text-secondary transition-colors">stsnpublicschool.com</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/75">
                <Mail className="w-4 h-4 flex-shrink-0 text-secondary" />
                <span>info@stsnpublicschool.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-10 pt-6 text-center text-xs text-primary-foreground/60">
          <p>© {new Date().getFullYear()} S.N. Public School, Pindra, Varanasi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
