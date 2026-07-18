import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { ScrollText } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance",
    body: (
      <p>
        By creating an account or otherwise using the SGSITS Alumni Portal (the
        "Portal"), you agree to these Terms of Service. If you do not agree,
        please do not use the Portal.
      </p>
    ),
  },
  {
    title: "2. Eligibility",
    body: (
      <p>
        The Portal is intended for current students and verified alumni of
        SGSITS, along with administrators authorised by the institution. You
        must provide accurate information during registration.
      </p>
    ),
  },
  {
    title: "3. Accounts & Verification",
    body: (
      <>
        <p>
          You are responsible for keeping your login credentials secure. Alumni
          profiles are subject to verification by the SGSITS admin team;
          approval may take a few working days.
        </p>
        <p>
          You may not share your account, impersonate another person, or
          create duplicate accounts.
        </p>
      </>
    ),
  },
  {
    title: "4. Acceptable Use",
    body: (
      <>
        <p>When using the Portal you agree not to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Post false, misleading, discriminatory, or fraudulent job listings.
          </li>
          <li>
            Solicit unrelated services, spam other members, or scrape profile
            data.
          </li>
          <li>Upload malicious files or attempt to interfere with the service.</li>
          <li>Violate any applicable law or the rights of others.</li>
        </ul>
      </>
    ),
  },
  {
    title: "5. Job Postings",
    body: (
      <p>
        Only verified alumni and admins may post job openings. Postings must
        reflect real opportunities. The SGSITS admin team reserves the right to
        remove any listing that appears misleading, expired, or off-mission.
      </p>
    ),
  },
  {
    title: "6. Applications",
    body: (
      <p>
        Students are responsible for the accuracy of the information submitted
        with each application, including resumes. The Portal facilitates
        introductions but does not guarantee interviews, offers, or employment.
      </p>
    ),
  },
  {
    title: "7. Content Ownership",
    body: (
      <p>
        You retain ownership of the content you upload — profile information,
        resumes, job descriptions, and messages. By posting, you grant SGSITS a
        limited license to display it within the Portal for the purpose of
        operating the service.
      </p>
    ),
  },
  {
    title: "8. Termination",
    body: (
      <p>
        We may suspend or terminate accounts that violate these terms, are
        inactive for extended periods, or pose a risk to the community. You may
        request account deletion at any time.
      </p>
    ),
  },
  {
    title: "9. Disclaimer",
    body: (
      <p>
        The Portal is provided on an "as is" basis. SGSITS makes reasonable
        efforts to maintain uptime, verify alumni, and moderate content, but
        does not warrant that the service will be error-free or that any
        specific outcome will result from its use.
      </p>
    ),
  },
  {
    title: "10. Governing Law",
    body: (
      <p>
        These terms are governed by the laws of India. Any dispute will be
        subject to the exclusive jurisdiction of the courts at Indore, Madhya
        Pradesh.
      </p>
    ),
  },
  {
    title: "11. Changes",
    body: (
      <p>
        We may update these terms occasionally. Continued use of the Portal
        after changes are posted constitutes acceptance of the revised terms.
      </p>
    ),
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-gray-950 dark:to-gray-900 flex flex-col">
      <PublicHeader />

      <main className="flex-1 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
              <ScrollText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
              Terms of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Service
              </span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: July 18, 2026
            </p>
          </div>

          <Card className="shadow-lg bg-white dark:bg-gray-900">
            <CardContent className="pt-8 pb-8 space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
              {sections.map(({ title, body }) => (
                <section key={title} className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                  <div className="space-y-3 text-gray-600 dark:text-gray-400">
                    {body}
                  </div>
                </section>
              ))}
              <p className="text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-800">
                For any clarification, write to{" "}
                <a
                  href="mailto:alumni@sgsits.ac.in"
                  className="text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  alumni@sgsits.ac.in
                </a>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
