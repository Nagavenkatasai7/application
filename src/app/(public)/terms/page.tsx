/**
 * Terms of Service Page
 *
 * Includes critical AI-generated content disclaimer and
 * comprehensive terms for Resume Tailor platform.
 */

import { FadeInView, StaggerContainer, StaggerItem } from "@/components/animations";
import { AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Resume Tailor",
  description: "Terms and conditions for using the Resume Tailor platform.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <FadeInView>
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: December 1, 2024
        </p>
      </FadeInView>

      <StaggerContainer className="space-y-8">
        {/* AI Disclaimer - Most Critical Section */}
        <StaggerItem>
          <section className="border-2 border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-4">
                  IMPORTANT: AI-GENERATED CONTENT DISCLAIMER
                </h2>
                <div className="space-y-3 text-amber-900 dark:text-amber-100">
                  <p>
                    This service uses artificial intelligence (Claude by Anthropic) to generate
                    resume suggestions and recommendations. By using this service, you acknowledge
                    and agree that:
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>
                      <strong>AI-generated content may contain errors, inaccuracies, or
                      inappropriate suggestions.</strong>
                    </li>
                    <li>
                      <strong>You are solely responsible for reviewing, editing, and verifying
                      all AI-generated content before use.</strong>
                    </li>
                    <li>
                      AI suggestions do not constitute professional career, legal, or HR advice.
                    </li>
                    <li>
                      We do not guarantee that AI-generated resumes will result in job interviews
                      or employment.
                    </li>
                    <li>
                      You are responsible for the accuracy and truthfulness of your final resume.
                    </li>
                    <li>
                      The AI may produce content that requires significant modification to be
                      suitable for your use.
                    </li>
                  </ol>
                  <p className="font-semibold mt-4">
                    By using this service, you accept full responsibility for any content you
                    include in your resume, regardless of whether it was suggested by our AI.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </StaggerItem>

        {/* Agreement to Terms */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using Resume Tailor (&quot;Service&quot;), you agree to be bound by
              these Terms of Service (&quot;Terms&quot;). If you disagree with any part of these
              terms, you may not access the Service.
            </p>
            <p>
              These Terms apply to all users, visitors, and others who access or use the Service.
              We may modify these Terms at any time. Continued use after modifications constitutes
              acceptance of the new terms.
            </p>
          </section>
        </StaggerItem>

        {/* Description of Services */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Services</h2>
            <p>Resume Tailor provides an AI-powered resume optimization platform that includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Resume creation and editing tools</li>
              <li>AI-powered resume analysis and suggestions</li>
              <li>Job description matching and optimization</li>
              <li>PDF resume parsing and formatting</li>
              <li>Soft skills assessment</li>
              <li>Company research integration</li>
            </ul>
          </section>
        </StaggerItem>

        {/* User Accounts */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">3.1 Registration</h3>
            <p>
              You must provide a valid email address to create an account. You are responsible
              for maintaining the security of your account and for all activities that occur
              under your account.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">3.2 Account Security</h3>
            <p>
              We use passwordless magic link authentication. You must not share your magic
              links with others. Notify us immediately if you suspect unauthorized access
              to your account.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">3.3 Age Requirement</h3>
            <p>
              You must be at least 18 years old to use this Service. Users under 18 must
              have parental or guardian consent.
            </p>
          </section>
        </StaggerItem>

        {/* Acceptable Use */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use Policy</h2>
            <p>You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Include false, misleading, or fraudulent information in your resumes</li>
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use automated tools to scrape or extract data</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Upload malicious files or code</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>
        </StaggerItem>

        {/* Intellectual Property */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">5.1 Your Content</h3>
            <p>
              You retain ownership of all content you create or upload (your resume data,
              work experience, education, etc.). You grant us a limited license to process
              this content to provide our services.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">5.2 Our Content</h3>
            <p>
              The Service, including its design, features, templates, and AI algorithms,
              is owned by Resume Tailor and protected by copyright and other intellectual
              property laws. You may not copy, modify, or reverse engineer our Service.
            </p>
          </section>
        </StaggerItem>

        {/* Payment Terms */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">6. Payment Terms</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Currency:</strong> All prices are in Indian Rupees (INR) unless otherwise stated</li>
              <li><strong>Payment Processor:</strong> Payments are processed securely by Razorpay</li>
              <li><strong>Billing Cycle:</strong> Subscriptions are billed according to the plan selected</li>
              <li><strong>Price Changes:</strong> We may change prices with 30 days notice</li>
              <li><strong>Taxes:</strong> Prices are exclusive of applicable taxes (GST)</li>
            </ul>
            <p className="mt-4">
              See our{" "}
              <a href="/refunds" className="text-primary hover:underline">
                Cancellation & Refunds Policy
              </a>{" "}
              for information about cancellations and refunds.
            </p>
          </section>
        </StaggerItem>

        {/* Limitation of Liability */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="font-semibold mb-3">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  We are NOT responsible for any job outcomes, interview results, or employment
                  decisions based on resumes created using our Service.
                </li>
                <li>
                  We are NOT responsible for the accuracy of AI-generated suggestions or content.
                </li>
                <li>
                  Our maximum liability for any claims is limited to the amount you paid us in
                  the 12 months preceding the claim.
                </li>
                <li>
                  We are not liable for any indirect, incidental, special, consequential, or
                  punitive damages.
                </li>
              </ul>
            </div>
          </section>
        </StaggerItem>

        {/* Indemnification */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">8. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Resume Tailor, its officers, directors,
              employees, and agents from any claims, damages, or expenses arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your use of the Service</li>
              <li>Content you create or upload</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>False or misleading information in your resumes</li>
            </ul>
          </section>
        </StaggerItem>

        {/* Disclaimer of Warranties */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
              WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Service will meet your specific requirements</li>
              <li>The Service will be uninterrupted, timely, or error-free</li>
              <li>AI-generated content will be accurate, complete, or suitable</li>
              <li>Results from using the Service will be accurate or reliable</li>
            </ul>
          </section>
        </StaggerItem>

        {/* Governing Law */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of
              India. Any disputes arising from these Terms or your use of the Service shall
              be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana, India.
            </p>
          </section>
        </StaggerItem>

        {/* Dispute Resolution */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">11. Dispute Resolution</h2>
            <p>
              Before filing a claim, you agree to attempt to resolve any dispute informally
              by contacting us. If the dispute cannot be resolved within 30 days, either
              party may pursue formal legal remedies.
            </p>
          </section>
        </StaggerItem>

        {/* Termination */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately,
              without prior notice, for any reason including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Breach of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Non-payment of fees</li>
              <li>Extended inactivity</li>
            </ul>
            <p className="mt-4">
              Upon termination, your right to use the Service will immediately cease. We may
              delete your data according to our{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>.
            </p>
          </section>
        </StaggerItem>

        {/* Severability */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">13. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, that
              provision will be limited or eliminated to the minimum extent necessary, and
              the remaining provisions will remain in full force and effect.
            </p>
          </section>
        </StaggerItem>

        {/* Entire Agreement */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">14. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy and Cancellation & Refunds Policy,
              constitute the entire agreement between you and Resume Tailor regarding the use
              of the Service.
            </p>
          </section>
        </StaggerItem>

        {/* Contact */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">15. Contact Us</h2>
            <p>For questions about these Terms:</p>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p><strong>Email:</strong> legal@resumetailor.app</p>
              <p><strong>Response Time:</strong> Within 5 business days</p>
            </div>
          </section>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
