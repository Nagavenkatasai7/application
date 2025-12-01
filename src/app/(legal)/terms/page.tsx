import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Resumint",
  description: "Terms and Conditions for Resumint - AI-powered resume optimization platform",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold">Terms & Conditions</h1>
        <p className="mb-4 text-muted-foreground">Last updated: December 1, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Resumint (&quot;the Service&quot;) at resumint.app, you accept and agree to be bound
              by these Terms and Conditions. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
            <p>
              Resumint is an AI-powered resume optimization platform that helps job seekers create tailored,
              ATS-compliant resumes. Our services include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Resume parsing and analysis</li>
              <li>AI-powered resume tailoring for specific job descriptions</li>
              <li>Impact quantification and achievement enhancement</li>
              <li>Soft skills assessment</li>
              <li>Company research and context alignment</li>
              <li>Resume PDF generation and export</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
            <p>
              To use our Service, you must create an account using a valid email address. You are responsible
              for maintaining the confidentiality of your account and for all activities under your account.
              You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Content</h2>
            <p>
              You retain ownership of all content you upload to Resumint, including your resumes and personal
              information. By using our Service, you grant us a limited license to process your content
              for the purpose of providing our services. We do not claim ownership of your content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Upload false or misleading information in your resumes</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Resell or redistribute our Service without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. AI-Generated Content</h2>
            <p>
              Our Service uses artificial intelligence to analyze and optimize resumes. While we strive
              for accuracy, AI-generated suggestions are provided as recommendations only. You are
              responsible for reviewing and verifying all content before using it in job applications.
              We do not guarantee employment outcomes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Subscription and Payments</h2>
            <p>
              Some features of our Service may require a paid subscription. Payment terms, pricing,
              and subscription details are displayed at the time of purchase. All payments are processed
              securely through our payment provider (Razorpay).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Intellectual Property</h2>
            <p>
              The Resumint platform, including its design, features, and technology, is owned by us
              and protected by intellectual property laws. You may not copy, modify, or reverse engineer
              any part of our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Resumint shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including loss of profits,
              data, or employment opportunities, arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
              either express or implied. We do not guarantee that the Service will be uninterrupted,
              error-free, or that it will meet your specific requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account at any time for violation
              of these Terms. You may also terminate your account at any time by contacting us.
              Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">12. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify users of significant changes
              by posting a notice on our website or sending an email. Your continued use of the
              Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India.
              Any disputes arising from these Terms shall be subject to the exclusive jurisdiction
              of the courts in India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">14. Contact Us</h2>
            <p>
              If you have questions about these Terms & Conditions, please contact us at:{" "}
              <a href="mailto:legal@resumint.app" className="text-primary hover:underline">
                legal@resumint.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
