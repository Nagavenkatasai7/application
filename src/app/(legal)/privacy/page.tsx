import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Resumint",
  description: "Privacy Policy for Resumint - AI-powered resume optimization platform",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>
        <p className="mb-4 text-muted-foreground">Last updated: December 1, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>
              Welcome to Resumint (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you use our AI-powered resume optimization platform at resumint.app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">Personal Information</h3>
            <p>We may collect the following personal information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address (for account creation and authentication)</li>
              <li>Resume content (including work experience, education, skills, and contact information)</li>
              <li>Job descriptions you provide for resume tailoring</li>
              <li>Usage data and analytics</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device and browser information</li>
              <li>IP address</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Usage patterns and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain our resume optimization services</li>
              <li>Process and analyze your resumes using AI technology</li>
              <li>Send you magic link authentication emails</li>
              <li>Improve our services and user experience</li>
              <li>Communicate with you about updates and features</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using industry-standard encryption. We use Vercel for hosting
              and PostgreSQL databases with encrypted connections. Resume data is processed using AI services
              (Anthropic Claude) and is not stored by third-party AI providers beyond the processing request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Sharing</h2>
            <p>We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service providers (hosting, email, AI processing) necessary for platform operation</li>
              <li>Legal authorities when required by law</li>
              <li>Business transfers in case of merger or acquisition</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. We may use analytics
              cookies to understand how you use our platform. You can control cookie preferences through
              your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Children&apos;s Privacy</h2>
            <p>
              Our services are not intended for individuals under 16 years of age. We do not knowingly
              collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:{" "}
              <a href="mailto:privacy@resumint.app" className="text-primary hover:underline">
                privacy@resumint.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
