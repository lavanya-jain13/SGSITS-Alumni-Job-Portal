import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { Calendar, MapPin, Clock, Users } from "lucide-react";

const upcomingEvents = [
  {
    title: "Annual Alumni Reunion 2026",
    date: "December 20, 2026",
    time: "10:00 AM onwards",
    location: "SGSITS Campus, Indore",
    tag: "Reunion",
    description:
      "The flagship annual gathering — cultural performances, campus tours, and a batch-wise reunion dinner.",
  },
  {
    title: "Tech Talk: The Future of AI",
    date: "August 5, 2026",
    time: "6:00 PM IST",
    location: "Online · Zoom",
    tag: "Webinar",
    description:
      "A candid conversation with senior alumni working at the frontier of applied AI research and industry.",
  },
  {
    title: "Career Mentorship Meet",
    date: "September 14, 2026",
    time: "4:00 PM IST",
    location: "Auditorium, SGSITS",
    tag: "Mentorship",
    description:
      "Small-group sessions with alumni across engineering, product, consulting, and entrepreneurship tracks.",
  },
  {
    title: "Golden Jubilee Batch — Class of 1976",
    date: "October 2, 2026",
    time: "11:00 AM onwards",
    location: "SGSITS Campus, Indore",
    tag: "Reunion",
    description:
      "A special celebration honouring the 50-year milestone of the 1976 graduating batch.",
  },
];

const pastEvents = [
  {
    title: "Alumni Startup Showcase 2026",
    date: "March 22, 2026",
    location: "SGSITS Innovation Hub",
    attendees: "220+",
  },
  {
    title: "Women in Tech Panel",
    date: "January 18, 2026",
    location: "Online",
    attendees: "500+",
  },
  {
    title: "Silver Jubilee — Class of 2001",
    date: "November 10, 2025",
    location: "SGSITS Campus",
    attendees: "180+",
  },
];

export default function Events() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-gray-950 dark:to-gray-900 flex flex-col">
      <PublicHeader />

      <main className="flex-1 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {/* Header */}
          <div className="text-center space-y-4">
            <p className="text-base font-extrabold tracking-widest text-blue-600 dark:text-cyan-400 uppercase">
              Stay Connected
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
              Events &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Reunions
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              From batch reunions to career webinars, these are the moments that
              keep the SGSITS community close.
            </p>
          </div>

          {/* Upcoming */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-center">
              <span className="pb-1 border-b-2 border-blue-500/50 dark:border-cyan-500/50 text-gray-800 dark:text-gray-200">
                Upcoming
              </span>
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              {upcomingEvents.map((event) => (
                <Card
                  key={event.title}
                  className="border-t-4 border-blue-500/60 shadow-lg hover:shadow-2xl transition-shadow bg-white dark:bg-gray-900"
                >
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {event.title}
                      </h3>
                      <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white shrink-0">
                        {event.tag}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {event.description}
                    </p>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
                        {event.date}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
                        {event.time}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
                        {event.location}
                      </p>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90">
                      Register Interest
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Past */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-center">
              <span className="pb-1 border-b-2 border-blue-500/50 dark:border-cyan-500/50 text-gray-800 dark:text-gray-200">
                Recent Highlights
              </span>
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event) => (
                <Card
                  key={event.title}
                  className="border border-gray-200 dark:border-gray-800 shadow-md bg-white dark:bg-gray-900"
                >
                  <CardContent className="pt-6 space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
                      {event.date}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
                      {event.location}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
                      {event.attendees} attendees
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
