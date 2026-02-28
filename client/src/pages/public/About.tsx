import { Target, Eye, Heart, Star, Users, BookOpen, Shield, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

const values = [
  { icon: Star, title: "Academic Excellence", desc: "We maintain high academic standards through rigorous curriculum, regular assessments, and dedicated teachers." },
  { icon: Heart, title: "Character Building", desc: "We develop moral values, integrity, compassion, and social responsibility in every student." },
  { icon: Users, title: "Inclusive Education", desc: "We welcome students from all backgrounds and ensure every child receives quality education." },
  { icon: Lightbulb, title: "Innovation", desc: "We encourage creative thinking, problem-solving, and critical analysis to prepare students for the future." },
  { icon: Shield, title: "Safety First", desc: "We provide a safe, nurturing, and disciplined environment where students feel secure to learn." },
  { icon: BookOpen, title: "Holistic Development", desc: "Beyond academics, we focus on sports, arts, culture, and co-curricular activities." },
];

const milestones = [
  { year: "2009", event: "School established in Pindra, Varanasi" },
  { year: "2012", event: "Expanded to secondary classes (9th & 10th)" },
  { year: "2016", event: "New science laboratory inaugurated" },
  { year: "2019", event: "Achieved 100% board examination results" },
  { year: "2021", event: "Computer lab and digital classroom setup" },
  { year: "2024", event: "Online admission system launched" },
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="hero-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-secondary/90 text-secondary-foreground border-0">About Us</Badge>
          <h1 className="text-4xl font-bold mb-4">About S.N. Public School</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
            Dedicated to shaping the future of children in Varanasi through quality education and holistic development.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-3">Our Story</Badge>
            <h2 className="text-3xl font-bold mb-4">15+ Years of Educational Excellence</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              S.N. Public School was established with a vision to provide quality, affordable education to children in and around Pindra, Varanasi. Since our inception in 2009, we have grown into one of the most trusted educational institutions in the region.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our school offers classes from Nursery to Class 10th, following the UP Board curriculum. With a team of experienced and dedicated teachers, we ensure every student receives personalized attention and achieves their academic goals.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We believe that true education goes beyond textbooks. Our school fosters creativity, discipline, sportsmanship, and social values that prepare our students for life's challenges.
            </p>
          </div>
          <div className="space-y-4">
            <Card className="border-l-4 border-l-primary p-5">
              <div className="flex items-start gap-3">
                <Eye className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Our Vision</h3>
                  <p className="text-muted-foreground text-sm">To be the leading educational institution in Varanasi, recognized for academic excellence, character development, and producing responsible citizens who contribute positively to society.</p>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-secondary p-5">
              <div className="flex items-start gap-3">
                <Target className="w-6 h-6 text-secondary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Our Mission</h3>
                  <p className="text-muted-foreground text-sm">To provide quality, value-based education in a nurturing environment that empowers students intellectually, emotionally, physically, and morally, enabling them to excel in all walks of life.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge className="mb-3">What We Stand For</Badge>
            <h2 className="text-2xl font-bold">Our Core Values</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(v => (
              <Card key={v.title} className="p-5 hover-elevate">
                <CardContent className="p-0">
                  <v.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Badge className="mb-3">Our Journey</Badge>
          <h2 className="text-2xl font-bold">Key Milestones</h2>
        </div>
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-border hidden md:block" />
          <div className="space-y-8">
            {milestones.map((m, i) => (
              <div key={m.year} className={`flex items-center gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : ""}`}>
                  <Card className="p-4 inline-block">
                    <div className="font-bold text-primary text-lg">{m.year}</div>
                    <div className="text-sm text-muted-foreground">{m.event}</div>
                  </Card>
                </div>
                <div className="w-4 h-4 rounded-full bg-primary border-4 border-background relative z-10 flex-shrink-0 hidden md:block" />
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
