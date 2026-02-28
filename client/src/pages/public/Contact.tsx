import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, MapPin, Globe, Mail, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Please write at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

const contactInfo = [
  { icon: Phone, label: "Phone", values: ["9151312209", "7398312209"] },
  { icon: MapPin, label: "Address", values: ["Varanasi–Lucknow Road, Pindra", "Uttar Pradesh – 221206"] },
  { icon: Globe, label: "Website", values: ["stsnpublicschool.com"] },
  { icon: Mail, label: "Email", values: ["info@stsnpublicschool.com"] },
  { icon: Clock, label: "School Hours", values: ["Mon–Sat: 8:00 AM – 2:00 PM"] },
];

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", phone: "", subject: "", message: "" } });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) setSubmitted(true);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="hero-gradient text-white py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Badge className="mb-4 bg-secondary/90 text-secondary-foreground border-0">Get In Touch</Badge>
          <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-white/80 text-lg">We'd love to hear from you</p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
            <div className="space-y-4">
              {contactInfo.map(info => (
                <Card key={info.label} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-muted-foreground mb-1">{info.label}</div>
                      {info.values.map(v => <div key={v} className="text-foreground">{v}</div>)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            {submitted ? (
              <Card className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground text-sm">Thank you for reaching out. We'll get back to you within 24 hours.</p>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" {...form.register("name")} placeholder="Your name" className="mt-1" data-testid="input-contact-name" />
                        {form.formState.errors.name && <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" {...form.register("phone")} placeholder="Mobile number" className="mt-1" data-testid="input-contact-phone" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" {...form.register("email")} placeholder="your@email.com" className="mt-1" data-testid="input-contact-email" />
                      {form.formState.errors.email && <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input id="subject" {...form.register("subject")} placeholder="What is this about?" className="mt-1" data-testid="input-contact-subject" />
                      {form.formState.errors.subject && <p className="text-xs text-destructive mt-1">{form.formState.errors.subject.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea id="message" {...form.register("message")} placeholder="Write your message here..." rows={5} className="mt-1" data-testid="input-contact-message" />
                      {form.formState.errors.message && <p className="text-xs text-destructive mt-1">{form.formState.errors.message.message}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={loading} data-testid="button-send-message">
                      {loading ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-lg overflow-hidden border border-border h-64">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14445.5!2d82.77!3d25.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDIxJzAwLjAiTiA4MsKwNDYnMTIuMCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen title="School Map"
          />
        </div>
      </section>
      <Footer />
    </div>
  );
}
