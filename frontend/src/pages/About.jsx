import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { GraduationCap, Users, Target, Heart, Sparkles, Handshake } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Purpose-Driven",
    description:
      "Every feature is built to shorten the distance between students seeking opportunities and alumni ready to give back.",
  },
  {
    icon: Handshake,
    title: "Mentorship First",
    description:
      "We believe that guidance from someone who has walked the path is often more valuable than any curriculum.",
  },
  {
    icon: Heart,
    title: "Lifelong Community",
    description:
      "SGSITS is more than a college — it is a family. The portal keeps that bond alive long after graduation.",
  },
  {
    icon: Sparkles,
    title: "Trust & Verification",
    description:
      "Every alumni profile is verified so students can engage with confidence and companies with credibility.",
  },
];

const stats = [
  { label: "Alumni Registered", value: "1,200+" },
  { label: "Active Students", value: "3,500+" },
  { label: "Partner Companies", value: "180+" },
  { label: "Jobs Posted", value: "600+" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-gray-950 dark:to-gray-900 flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <p className="text-base font-extrabold tracking-widest text-blue-600 dark:text-cyan-400 uppercase">
              About the Portal
            </p>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white">
              Bridging Generations of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                SGSITS Talent
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              The SGSITS Alumni Portal exists to keep students, alumni, and the
              institution connected — turning individual success stories into a
              shared network of mentorship, referrals, and opportunity.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-2 items-center">
              <div className="space-y-5">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Our Story
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  For decades, SGSITS graduates have gone on to build careers
                  across the world — in engineering, research, entrepreneurship,
                  and public service. Yet the connection between those alumni
                  and the students walking the same corridors was, for a long
                  time, informal and fragmented.
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  This portal was created to change that. It gives students a
                  single place to discover verified job opportunities from
                  alumni, and gives alumni a simple way to give back — whether
                  by posting a role, mentoring a junior, or hiring a familiar
                  face they can trust.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-2xl blur-2xl" />
                <Card className="relative border-t-4 border-blue-500/80 shadow-xl">
                  <CardContent className="pt-8 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          The Institution
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Shri Govindram Seksaria Institute of Technology and
                          Science — a legacy of engineering excellence since
                          1952.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          The Community
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          A growing network of verified alumni, current
                          students, and hiring partners committed to mutual
                          growth.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-white/60 dark:bg-gray-950/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                <span className="pb-1 border-b-2 border-blue-500/50 dark:border-cyan-500/50">
                  What We Stand For
                </span>
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map(({ icon: Icon, title, description }) => (
                <Card
                  key={title}
                  className="border-t-4 border-blue-500/60 shadow-lg hover:shadow-2xl transition-shadow bg-white dark:bg-gray-900"
                >
                  <CardContent className="pt-6 space-y-3">
                    <div className="w-11 h-11 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map(({ label, value }) => (
                <div
                  key={label}
                  className="text-center bg-white dark:bg-gray-900 rounded-xl py-8 shadow-md border border-gray-100 dark:border-gray-800"
                >
                  <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                    {value}
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
