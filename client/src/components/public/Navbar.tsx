import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Phone, School } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/admissions", label: "Admissions" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="bg-primary text-primary-foreground text-xs py-1.5 px-4 flex items-center justify-between gap-2">
        <span className="hidden sm:flex items-center gap-1">
          <Phone className="w-3 h-3" />
          <span>9151312209 | 7398312209</span>
        </span>
        <span className="flex-1 text-center sm:text-right text-muted/80">
          Varanasi–Lucknow Road, Pindra, UP – 221206
        </span>
      </div>
      <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "bg-white dark:bg-card shadow-md" : "bg-white dark:bg-card border-b border-border"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow">
                <School className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight text-foreground">S.N. Public School</div>
                <div className="text-xs text-muted-foreground leading-tight">स.न. पब्लिक स्कूल</div>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}>
                  <span className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${location === link.href ? "text-primary bg-accent" : "text-foreground/80 hover:text-primary hover:bg-accent"}`}>
                    {link.label}
                  </span>
                </Link>
              ))}
              <Link href="/admin">
                <Button size="sm" className="ml-2" data-testid="button-admin-login">Admin Login</Button>
              </Link>
            </div>

            <button className="md:hidden p-2 rounded-md" onClick={() => setIsOpen(!isOpen)} data-testid="button-mobile-menu">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-border bg-white dark:bg-card px-4 pb-4 animate-fade-in">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <span onClick={() => setIsOpen(false)} className={`block py-2.5 px-3 rounded-md text-sm font-medium my-0.5 cursor-pointer ${location === link.href ? "text-primary bg-accent" : "text-foreground/80"}`}>
                  {link.label}
                </span>
              </Link>
            ))}
            <Link href="/admin">
              <Button size="sm" className="mt-2 w-full" onClick={() => setIsOpen(false)}>Admin Login</Button>
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
