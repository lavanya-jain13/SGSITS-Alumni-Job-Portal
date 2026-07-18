import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import {
  Search,
  Lock,
  Briefcase,
  MapPin,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

// Sample public preview — full directory access requires sign in.
const previewAlumni = [
  {
    name: "Ananya Verma",
    batch: "2015 · Computer Engineering",
    role: "Senior SDE at Google",
    location: "Bengaluru, India",
  },
  {
    name: "Rohan Malhotra",
    batch: "2012 · Electronics",
    role: "Product Manager at Microsoft",
    location: "Hyderabad, India",
  },
  {
    name: "Priya Sharma",
    batch: "2018 · Information Technology",
    role: "Founder, ClearScope",
    location: "Pune, India",
  },
  {
    name: "Devendra Rathore",
    batch: "2010 · Mechanical",
    role: "Engineering Lead at Tata Motors",
    location: "Pune, India",
  },
  {
    name: "Neha Agarwal",
    batch: "2016 · Chemical",
    role: "Research Scientist at BASF",
    location: "Mumbai, India",
  },
  {
    name: "Vikram Chauhan",
    batch: "2008 · Civil",
    role: "Director, L&T Infrastructure",
    location: "Delhi, India",
  },
];

export default function AlumniDirectory() {
  const [query, setQuery] = useState("");

  const filtered = previewAlumni.filter((a) =>
    [a.name, a.batch, a.role, a.location]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-gray-950 dark:to-gray-900 flex flex-col">
      <PublicHeader />

      <main className="flex-1 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <p className="text-base font-extrabold tracking-widest text-blue-600 dark:text-cyan-400 uppercase">
              Our Network
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
              Alumni{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Directory
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Discover verified SGSITS alumni across companies, cities, and
              domains. Search by name, batch, or role to find someone whose path
              inspires yours.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, batch, company, or city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-12 text-base bg-white dark:bg-gray-900 shadow-md"
            />
          </div>

          {/* Preview Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((alum) => (
              <Card
                key={alum.name}
                className="border-t-4 border-blue-500/60 shadow-lg hover:shadow-2xl transition-shadow bg-white dark:bg-gray-900"
              >
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                      {alum.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {alum.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-cyan-400">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
                      {alum.batch}
                    </p>
                    <p className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
                      {alum.role}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
                      {alum.location}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
                No alumni match your search.
              </div>
            )}
          </div>

          {/* Locked full-access CTA */}
          <Card className="border-t-4 border-blue-500/80 shadow-xl bg-white dark:bg-gray-900">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                See the full directory
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                This is a public preview. Sign in as a verified student or
                alumnus to view profiles, contact information, and career
                paths.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/signup">Create Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
