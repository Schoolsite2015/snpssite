import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

const schema = z.object({
  studentName: z.string().min(2, "Name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  classApplying: z.string().min(1, "Class is required"),
  fatherName: z.string().min(2, "Father's name is required"),
  motherName: z.string().min(2, "Mother's name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().min(10, "Full address is required"),
});

type FormData = z.infer<typeof schema>;

const classes = ["Nursery", "KG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const steps = ["Personal Details", "Parent Info", "Contact & Address"];

export default function Admissions() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { studentName: "", dob: "", gender: "male", classApplying: "", fatherName: "", motherName: "", phone: "", email: "", address: "" },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit");
      }
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-muted-foreground mb-6">Your admission application has been received. We will contact you within 2-3 working days. Please keep your phone number accessible.</p>
            <Badge className="text-sm">Application ID: {Date.now().toString().slice(-6)}</Badge>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="hero-gradient text-white py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Badge className="mb-4 bg-secondary/90 text-secondary-foreground border-0">2026-27 Admissions</Badge>
          <h1 className="text-4xl font-bold mb-3">Online Admission Form</h1>
          <p className="text-white/80 text-lg">Apply for admission to S.N. Public School, Pindra</p>
        </div>
      </section>

      <section className="py-12 max-w-3xl mx-auto px-4 flex-1">
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`ml-2 text-sm font-medium hidden sm:block ${i <= step ? "text-primary" : "text-muted-foreground"}`}>{s}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {error && <Alert variant="destructive" className="mb-4"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader><CardTitle>{steps[step]}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {step === 0 && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentName">Student Name *</Label>
                      <Input id="studentName" {...form.register("studentName")} placeholder="Full name" data-testid="input-student-name" className="mt-1" />
                      {form.formState.errors.studentName && <p className="text-xs text-destructive mt-1">{form.formState.errors.studentName.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="dob">Date of Birth *</Label>
                      <Input id="dob" type="date" {...form.register("dob")} data-testid="input-dob" className="mt-1" />
                      {form.formState.errors.dob && <p className="text-xs text-destructive mt-1">{form.formState.errors.dob.message}</p>}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Gender *</Label>
                      <Select onValueChange={(v) => form.setValue("gender", v as any)} defaultValue="male">
                        <SelectTrigger className="mt-1" data-testid="select-gender"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Class Applying For *</Label>
                      <Select onValueChange={(v) => form.setValue("classApplying", v)}>
                        <SelectTrigger className="mt-1" data-testid="select-class"><SelectValue placeholder="Select class" /></SelectTrigger>
                        <SelectContent>
                          {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.classApplying && <p className="text-xs text-destructive mt-1">{form.formState.errors.classApplying.message}</p>}
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div>
                    <Label htmlFor="fatherName">Father's Name *</Label>
                    <Input id="fatherName" {...form.register("fatherName")} placeholder="Father's full name" data-testid="input-father-name" className="mt-1" />
                    {form.formState.errors.fatherName && <p className="text-xs text-destructive mt-1">{form.formState.errors.fatherName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="motherName">Mother's Name *</Label>
                    <Input id="motherName" {...form.register("motherName")} placeholder="Mother's full name" data-testid="input-mother-name" className="mt-1" />
                    {form.formState.errors.motherName && <p className="text-xs text-destructive mt-1">{form.formState.errors.motherName.message}</p>}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" {...form.register("phone")} placeholder="10-digit mobile number" data-testid="input-phone" className="mt-1" />
                      {form.formState.errors.phone && <p className="text-xs text-destructive mt-1">{form.formState.errors.phone.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input id="email" type="email" {...form.register("email")} placeholder="email@example.com" data-testid="input-email" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Full Address *</Label>
                    <Textarea id="address" {...form.register("address")} placeholder="Village/City, District, State, PIN" data-testid="input-address" className="mt-1" rows={3} />
                    {form.formState.errors.address && <p className="text-xs text-destructive mt-1">{form.formState.errors.address.message}</p>}
                  </div>
                  <div>
                    <Label>Upload Documents (Optional)</Label>
                    <div className="mt-1 border-2 border-dashed border-border rounded-md p-6 text-center text-muted-foreground text-sm">
                      <Upload className="w-6 h-6 mx-auto mb-2" />
                      <p>Birth certificate, Aadhar card, etc.</p>
                      <p className="text-xs mt-1">(Max 5MB, PDF/JPG/PNG)</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</Button>
                {step < steps.length - 1 ? (
                  <Button type="button" onClick={() => setStep(step + 1)} data-testid="button-next-step">Next Step</Button>
                ) : (
                  <Button type="submit" disabled={loading} data-testid="button-submit-admission">
                    {loading ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </section>
      <Footer />
    </div>
  );
}
