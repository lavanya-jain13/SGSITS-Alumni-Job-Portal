import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "1. Information We Collect",
    body: (
      <>
        <p>
          When you register on the SGSITS Alumni Portal we collect the
          information you provide directly, including your name, email address,
          batch year, branch, current role, resume, and any additional profile
          details you choose to share.
        </p>
        <p>
          We also collect limited technical information (browser type, IP
          address, session cookies) required to operate the platform, keep it
          secure, and understand aggregate usage.
        </p>
      </>
    ),
  },
  {
    title: "2. How We Use Your Information",
    body: (
      <>
        <p>Your information is used to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Verify your identity as a student, alumnus, or administrator.</li>
          <li>
            Match students with relevant jobs and enable alumni to review
            applicants.
          </li>
          <li>Communicate updates about applications, events, and reunions.</li>
          <li>Improve the platform based on aggregate usage patterns.</li>
        </ul>
      </>
    ),
  },
  {
    title: "3. What We Share",
    body: (
      <>
        <p>
          We do not sell personal information. Alumni profile details are
          visible only to verified members of the SGSITS network. When you apply
          to a job, the posting alumnus can see your application, resume, and
          relevant profile fields.
        </p>
        <p>
          We may share information with service providers strictly to operate
          the platform — for example, Cloudinary for resume storage and email
          providers for transactional notifications.
        </p>
      </>
    ),
  },
  {
    title: "4. Cookies & Sessions",
    body: (
      <p>
        We use a secure, HTTP-only session cookie (<code>access_token</code>) to
        keep you signed in. No third-party advertising or tracking cookies are
        set by the portal.
      </p>
    ),
  },
  {
    title: "5. Data Retention",
    body: (
      <p>
        Profile and application data are retained for as long as your account is
        active. You can request deletion at any time by writing to
        alumni@sgsits.ac.in.
      </p>
    ),
  },
  {
    title: "6. Your Rights",
    body: (
      <p>
        You can view, edit, or delete your profile information at any time from
        your dashboard. For any request related to your data, please contact
        us through the Contact page.
      </p>
    ),
  },
  {
    title: "7. Security",
    body: (
      <p>
        Passwords are hashed, sessions are signed, and access is guarded by
        role-based checks on every request. We work to maintain reasonable
        safeguards, though no online service is entirely risk-free.
      </p>
    ),
  },
  {
    title: "8. Changes to this Policy",
    body: (
      <p>
        We may update this policy from time to time. Material changes will be
        communicated by email or a notice on this page.
      </p>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-gray-950 dark:to-gray-900 flex flex-col">
      <PublicHeader />

      <main className="flex-1 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
              Privacy{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Policy
              </span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: July 18, 2026
            </p>
          </div>

          <Card className="shadow-lg bg-white dark:bg-gray-900">
            <CardContent className="pt-8 pb-8 space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                This policy explains what information the SGSITS Alumni Portal
                collects, how it is used, and the choices you have. By using
                the platform, you agree to the practices described below.
              </p>
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
                Questions? Reach us at{" "}
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
