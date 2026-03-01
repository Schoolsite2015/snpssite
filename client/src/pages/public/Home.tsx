import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ChevronRight, Star, Users, BookOpen, Award, Phone, ArrowRight, Megaphone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

interface NewsItem { id: number; title: string; content: string; category: string; publishedAt: string; }
interface GalleryItem { id: number; title: string; imageUrl: string; category: string; }

const stats = [
  { icon: Users, label: "Students", value: "500+", color: "text-blue-600" },
  { icon: BookOpen, label: "Classes", value: "1–10", color: "text-green-600" },
  { icon: Award, label: "Board Results", value: "100%", color: "text-amber-500" },
  { icon: Star, label: "Years of Excellence", value: "15+", color: "text-purple-600" },
];

const features = [
  { title: "Academic Excellence", desc: "Comprehensive curriculum with experienced faculty focused on academic growth.", icon: "📚" },
  { title: "Sports & Activities", desc: "Wide range of co-curricular activities to develop holistic personalities.", icon: "⚽" },
  { title: "Modern Infrastructure", desc: "State-of-the-art classrooms, labs, and sports facilities.", icon: "🏫" },
  { title: "Safe Environment", desc: "Secure, caring environment where every student thrives.", icon: "🛡️" },
];

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  useEffect(() => {
    fetch("/api/news").then(r => r.json()).then(d => setNews(d.slice(0, 3))).catch(() => {});
    fetch("/api/gallery").then(r => r.json()).then(d => setGallery(d.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-secondary animate-float" />
          <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full bg-white/30" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-secondary/90 text-secondary-foreground border-0">
              Admissions Open 2026-27
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              S.N. Public School
              <span className="block text-2xl sm:text-3xl font-normal text-white/80 mt-2">
                स.न. पब्लिक स्कूल, पिंडरा
              </span>
            </h1>
            <p className="text-lg text-white/85 mb-8 max-w-xl leading-relaxed">
              Shaping young minds with quality education, strong values, and holistic development. Located in Pindra, Varanasi — a school you can trust.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/admissions">
                <Button size="lg" variant="secondary" className="gap-2" data-testid="button-apply-now">
                  Apply for Admission <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white gap-2">
                  Learn More <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-6 text-sm text-white/70">
              <Phone className="w-4 h-4" />
              <span>Call us: 9151312209 | 7398312209</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-card border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(stat => (
              <div key={stat.label} className="text-center" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
                <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-3">About Our School</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">Excellence in Education Since 2014</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              S.N. Public School is a premier educational institution situated on the Varanasi–Lucknow Road in Pindra. We are committed to providing quality education that nurtures academic brilliance alongside character development.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Our dedicated team of experienced teachers, modern infrastructure, and a child-centric approach ensures that every student reaches their full potential.
            </p>
            <Link href="/about">
              <Button className="gap-2">Read More <ChevronRight className="w-4 h-4" /></Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {features.map(f => (
              <Card key={f.title} className="p-4 hover-elevate">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      {news.length > 0 && (
        <section className="py-12 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Badge className="mb-2">Latest Updates</Badge>
                <h2 className="text-2xl font-bold">News & Notices</h2>
              </div>
              <Link href="/contact">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {news.map(item => (
                <Card key={item.id} className="hover-elevate" data-testid={`card-news-${item.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Megaphone className="w-4 h-4 text-primary" />
                      <Badge variant="secondary" className="text-xs capitalize">{item.category}</Badge>
                    </div>
                    <h3 className="font-semibold mb-2 leading-tight">{item.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Preview */}
      {gallery.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Badge className="mb-2">Our Moments</Badge>
              <h2 className="text-2xl font-bold">Photo Gallery</h2>
            </div>
            <Link href="/gallery">
              <Button variant="outline" size="sm" className="gap-1">View All <ChevronRight className="w-4 h-4" /></Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gallery.map(item => (
              <div key={item.id} className="relative group overflow-hidden rounded-lg aspect-video bg-muted" data-testid={`img-gallery-${item.id}`}>
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end p-3">
                  <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="hero-gradient text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Our School Family?</h2>
          <p className="text-white/80 mb-8 text-lg">Enrol your child in one of Varanasi's leading schools. Limited seats available for 2026-27.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/admissions">
              <Button size="lg" variant="secondary" className="gap-2">
                Apply Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <Badge className="mb-2">Find Us</Badge>
          <h2 className="text-2xl font-bold">Our Location</h2>
        </div>
        <div className="rounded-lg overflow-hidden border border-border h-80">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14445.5!2d82.77!3d25.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDIxJzAwLjAiTiA4MsKwNDYnMTIuMCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen title="School Location"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
