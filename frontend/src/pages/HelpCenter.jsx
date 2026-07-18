import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Search, LifeBuoy, UserPlus, Briefcase, ShieldCheck, Mail } from "lucide-react";

const categories = [
  {
    icon: UserPlus,
    title: "Getting Started",
    description: "Create an account, verify your profile, and set things up.",
  },
  {
    icon: Briefcase,
    title: "Jobs & Applications",
    description: "Post roles, apply to openings, and track your applications.",
  },
  {
    icon: ShieldCheck,
    title: "Verification & Trust",
    description: "How alumni verification and profile security work.",
  },
  {
    icon: LifeBuoy,
    title: "Troubleshooting",
    description: "Fixes for common issues with sign-in, uploads, and email.",
  },
];

const faqs = [
  {
    q: "How do I register as an alumnus?",
    a: "Click Sign Up, choose Alumni, and fill in your batch, branch, and current role. Your profile will be reviewed by the SGSITS admin team before it goes live in the directory.",
  },
  {
    q: "How long does alumni verification take?",
    a: "Verification typically takes 1–3 working days. You will receive an email confirmation once your profile is approved and visible to students.",
  },
  {
    q: "Can students post jobs?",
    a: "No. Only verified alumni and admins can post job opportunities. Students can browse, filter, and apply to any posted role.",
  },
  {
    q: "I forgot my password. What do I do?",
    a: "Use the Forgot Password link on the login screen. You will receive a reset link on your registered email address. If it does not arrive, please check your spam folder.",
  },
  {
    q: "How do I edit my profile or resume?",
    a: "Sign in and go to your Profile section from the dashboard. You can update your bio, experience, and upload a new resume at any time.",
  },
  {
    q: "Who can see my contact information?",
    a: "Only signed-in and verified members of the SGSITS network can view detailed contact information. Public visitors see only your name, batch, and role.",
  },
  {
    q: "How do I report a suspicious job posting?",
    a: "Use the Contact Us page or email alumni@sgsits.ac.in with the job link and a short description. The admin team reviews reports promptly.",
  },
  {
    q: "Can I represent my company for campus hiring?",
    a: "Yes, verified alumni can post roles on behalf of their employer. For dedicated campus drives, please reach out to the placement cell via the Contact page.",
  },
];

export default function HelpCenter() {
  const [query, setQuery] = useState("");
  const filtered = faqs.filter((f) =>
    (f.q + " " + f.a).toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-gray-950 dark:to-gray-900 flex flex-col">
      <PublicHeader />

      <main className="flex-1 py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <p className="text-base font-extrabold tracking-widest text-blue-600 dark:text-cyan-400 uppercase">
              Support
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
              Help{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Center
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Answers to the most common questions about using the SGSITS Alumni
              Portal.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search help articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-12 text-base bg-white dark:bg-gray-900 shadow-md"
            />
          </div>

          {/* Categories */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="border-t-4 border-blue-500/60 shadow-md bg-white dark:bg-gray-900"
              >
                <CardContent className="pt-6 space-y-3">
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ */}
          <Card className="shadow-lg bg-white dark:bg-gray-900">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              {filtered.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 py-6 text-center">
                  No articles match your search.
                </p>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filtered.map((f, i) => (
                    <AccordionItem key={f.q} value={`item-${i}`}>
                      <AccordionTrigger className="text-left text-base font-medium">
                        {f.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {f.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <Card className="border-t-4 border-blue-500/80 shadow-xl bg-white dark:bg-gray-900">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Still need help?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                Our team usually responds within one working day.
              </p>
              <Button asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
