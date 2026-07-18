import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({
        title: "Please fill in the required fields",
        description: "Name, email, and message are required.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    // No public contact API yet — build a mailto so the message reaches the team.
    const mailto = `mailto:alumni@sgsits.ac.in?subject=${encodeURIComponent(
      form.subject || `Portal enquiry from ${form.name}`,
    )}&body=${encodeURIComponent(
      `${form.message}\n\n— ${form.name}\n${form.email}`,
    )}`;
    window.location.href = mailto;
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: "Opening your email client",
        description: "Complete sending the message from your mail app.",
      });
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-gray-950 dark:to-gray-900 flex flex-col">
      <PublicHeader />

      <main className="flex-1 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <p className="text-base font-extrabold tracking-widest text-blue-600 dark:text-cyan-400 uppercase">
              We&apos;d love to hear from you
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
              Contact{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Us
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Whether you have a question, want to partner with us, or need help
              with your account — we&apos;re one message away.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Contact info */}
            <div className="space-y-6 lg:col-span-1">
              <Card className="border-t-4 border-blue-500/60 shadow-md bg-white dark:bg-gray-900">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Email
                      </h3>
                      <a
                        href="mailto:alumni@sgsits.ac.in"
                        className="text-sm text-blue-600 dark:text-cyan-400 hover:underline"
                      >
                        alumni@sgsits.ac.in
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Phone
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        +91-731-2582000
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Address
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        SGSITS, 23, Park Road,
                        <br />
                        Indore, Madhya Pradesh 452003
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Working Hours
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mon – Fri, 10:00 AM – 6:00 PM IST
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Form */}
            <Card className="lg:col-span-2 shadow-lg bg-white dark:bg-gray-900">
              <CardContent className="pt-8 pb-8">
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Full name<span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Email<span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={onChange}
                      placeholder="What is this about?"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Message<span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={onChange}
                      rows={6}
                      placeholder="Tell us how we can help..."
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
