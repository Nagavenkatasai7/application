/**
 * Privacy Policy Page
 *
 * DPDP Act 2023 compliant privacy policy for Resume Tailor.
 * Covers data collection, usage, third-party services, and user rights.
 */

import { FadeInView, StaggerContainer, StaggerItem } from "@/components/animations";

export const metadata = {
  title: "Privacy Policy | Resume Tailor",
  description: "Learn how Resume Tailor collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <FadeInView>
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: December 1, 2024
        </p>
      </FadeInView>

      <StaggerContainer className="space-y-8">
        {/* Introduction */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Resume Tailor (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use our AI-powered resume optimization platform.
            </p>
            <p>
              This policy is compliant with India&apos;s Digital Personal Data Protection Act, 2023
              (DPDP Act) and applicable international data protection standards.
            </p>
          </section>
        </StaggerItem>

        {/* Information We Collect */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Email address and name when you register</li>
              <li><strong>Resume Content:</strong> Professional information you enter including work experience,
                education, skills, and achievements</li>
              <li><strong>Uploaded Documents:</strong> PDF resumes you upload for parsing and analysis</li>
              <li><strong>Communication:</strong> Messages you send to our support team</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage Data:</strong> Pages visited, features used, and time spent on the platform</li>
              <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
              <li><strong>Log Data:</strong> IP address, access times, and referring URLs</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">2.3 Payment Information</h3>
            <p>
              Payment processing is handled by Razorpay. We do not store your credit card numbers,
              CVV, or banking details. Razorpay may share transaction IDs and payment status with us.
            </p>
          </section>
        </StaggerItem>

        {/* How We Use Your Information */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p>We use your information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Provide Services:</strong> Create, store, and manage your resumes</li>
              <li><strong>AI Processing:</strong> Analyze and optimize your resume using Claude AI by Anthropic</li>
              <li><strong>Authentication:</strong> Verify your identity and manage your account</li>
              <li><strong>Communication:</strong> Send magic link emails, notifications, and support responses</li>
              <li><strong>Improvement:</strong> Analyze usage patterns to improve our services</li>
              <li><strong>Legal Compliance:</strong> Comply with applicable laws and regulations</li>
            </ul>
          </section>
        </StaggerItem>

        {/* Third-Party Services */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
            <p>We share your data with the following third-party service providers:</p>

            <div className="bg-muted/50 rounded-lg p-4 mt-4 space-y-4">
              <div>
                <h4 className="font-semibold">Anthropic (Claude AI)</h4>
                <p className="text-sm text-muted-foreground">
                  Your resume content is processed by Claude AI to provide optimization suggestions.
                  Anthropic&apos;s data handling is governed by their privacy policy.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Razorpay</h4>
                <p className="text-sm text-muted-foreground">
                  Payment processing. Razorpay handles all financial transactions securely.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Resend</h4>
                <p className="text-sm text-muted-foreground">
                  Email delivery service for magic link authentication and notifications.
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Vercel</h4>
                <p className="text-sm text-muted-foreground">
                  Cloud hosting and infrastructure provider.
                </p>
              </div>
            </div>
          </section>
        </StaggerItem>

        {/* Data Retention */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Data:</strong> Retained as long as your account is active</li>
              <li><strong>Resume Content:</strong> Stored until you delete it or close your account</li>
              <li><strong>Usage Logs:</strong> Retained for 12 months for analytics and security</li>
              <li><strong>Payment Records:</strong> Retained for 7 years as required by tax laws</li>
            </ul>
            <p className="mt-4">
              Upon account deletion, your personal data will be permanently removed within 30 days,
              except where retention is required by law.
            </p>
          </section>
        </StaggerItem>

        {/* Cookies */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
            <p>We use the following types of cookies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
              <li><strong>Preference Cookies:</strong> Remember your settings (theme, language)</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use our service</li>
            </ul>
            <p className="mt-4">
              You can control cookies through your browser settings. Disabling essential cookies
              may affect the functionality of our service.
            </p>
          </section>
        </StaggerItem>

        {/* Children's Privacy */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">7. Children&apos;s Privacy</h2>
            <p>
              Our service is intended for users 18 years of age and older. If you are under 18,
              you must have parental or guardian consent to use our service. We do not knowingly
              collect personal information from children under 18 without such consent.
            </p>
            <p className="mt-4">
              If you believe a child has provided us with personal information without proper
              consent, please contact us immediately.
            </p>
          </section>
        </StaggerItem>

        {/* Data Security */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">8. Data Security</h2>
            <p>We implement industry-standard security measures including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>HTTPS encryption for all data transmission</li>
              <li>Encrypted database storage</li>
              <li>Secure authentication using magic links (no passwords stored)</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and monitoring</li>
            </ul>
            <p className="mt-4">
              While we strive to protect your information, no method of transmission over the
              Internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>
        </StaggerItem>

        {/* Your Rights - DPDP Act */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">9. Your Rights (DPDP Act)</h2>
            <p>Under India&apos;s DPDP Act 2023, you have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Right to Grievance Redressal:</strong> File complaints about data handling</li>
              <li><strong>Right to Nominate:</strong> Nominate someone to exercise rights on your behalf</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact our Grievance Officer at the details below.
            </p>
          </section>
        </StaggerItem>

        {/* Data Breach */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">10. Data Breach Notification</h2>
            <p>
              In the event of a personal data breach that is likely to cause significant harm,
              we will notify affected users and the Data Protection Board of India within 72 hours
              of becoming aware of the breach, as required by the DPDP Act.
            </p>
          </section>
        </StaggerItem>

        {/* Contact Information */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p>For privacy-related inquiries or to exercise your data rights:</p>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p><strong>Grievance Officer:</strong></p>
              <p>Email: privacy@resumetailor.app</p>
              <p>Response Time: Within 72 hours</p>
            </div>
          </section>
        </StaggerItem>

        {/* Policy Updates */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              material changes by email or by posting a notice on our website. Your continued
              use of the service after such modifications constitutes acceptance of the updated policy.
            </p>
          </section>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
