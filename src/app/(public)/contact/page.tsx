/**
 * Contact Us Page
 *
 * Contact information with Grievance Officer details
 * as required by India's DPDP Act 2023.
 */

import { FadeInView, StaggerContainer, StaggerItem } from "@/components/animations";
import { Mail, Clock, MapPin, Shield } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Contact Us | Resume Tailor",
  description: "Get in touch with Resume Tailor support team.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <FadeInView>
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground mb-8">
          We&apos;re here to help. Reach out to us with any questions or concerns.
        </p>
      </FadeInView>

      <StaggerContainer className="space-y-8">
        {/* Contact Cards */}
        <StaggerItem>
          <div className="grid gap-6 md:grid-cols-2">
            {/* General Support */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">General Support</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    For questions about using Resume Tailor, feature requests, or technical issues.
                  </p>
                  <a
                    href="mailto:support@resumetailor.app"
                    className="text-primary font-medium hover:underline"
                  >
                    support@resumetailor.app
                  </a>
                </div>
              </div>
            </div>

            {/* Billing Support */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Billing & Refunds</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    For payment issues, subscription changes, or refund requests.
                  </p>
                  <a
                    href="mailto:billing@resumetailor.app"
                    className="text-primary font-medium hover:underline"
                  >
                    billing@resumetailor.app
                  </a>
                </div>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Response Time */}
        <StaggerItem>
          <section className="bg-muted/30 border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Response Times</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="font-medium">General Inquiries</p>
                <p className="text-muted-foreground text-sm">Within 24-48 hours</p>
              </div>
              <div>
                <p className="font-medium">Technical Issues</p>
                <p className="text-muted-foreground text-sm">Within 12-24 hours</p>
              </div>
              <div>
                <p className="font-medium">Billing Concerns</p>
                <p className="text-muted-foreground text-sm">Within 24 hours</p>
              </div>
            </div>
          </section>
        </StaggerItem>

        {/* Business Hours */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">Business Hours</h2>
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Monday - Friday</p>
                  <p className="text-muted-foreground">10:00 AM - 7:00 PM IST</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Emails received outside business hours will be addressed on the next business day.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </StaggerItem>

        {/* Grievance Officer - DPDP Act Requirement */}
        <StaggerItem>
          <section className="border-2 border-primary/50 bg-primary/5 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-3">
                  Grievance Officer (DPDP Act 2023)
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  In accordance with India&apos;s Digital Personal Data Protection Act, 2023,
                  we have appointed a Grievance Officer to address your data protection concerns.
                </p>
                <div className="space-y-2">
                  <p><strong>Name:</strong> Data Protection Officer</p>
                  <p><strong>Email:</strong>{" "}
                    <a
                      href="mailto:privacy@resumetailor.app"
                      className="text-primary hover:underline"
                    >
                      privacy@resumetailor.app
                    </a>
                  </p>
                  <p><strong>Response Time:</strong> Within 72 hours</p>
                </div>
                <div className="mt-4 p-4 bg-background rounded-lg text-sm">
                  <p className="font-medium mb-2">You can contact the Grievance Officer for:</p>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Requesting access to your personal data</li>
                    <li>Requesting correction of inaccurate data</li>
                    <li>Requesting erasure of your personal data</li>
                    <li>Filing complaints about data handling</li>
                    <li>Withdrawing consent for data processing</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </StaggerItem>

        {/* Mailing Address */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">Mailing Address</h2>
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Resume Tailor</p>
                  <p className="text-muted-foreground">
                    Hyderabad, Telangana<br />
                    India
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    For legal correspondence only. Response time: 7-10 business days.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </StaggerItem>

        {/* Before Contacting */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">Before You Contact Us</h2>
            <p>You might find your answer faster by checking:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <Link href="/#faq" className="text-primary hover:underline">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="text-primary hover:underline">
                  Cancellation & Refunds Policy
                </Link>
              </li>
            </ul>
          </section>
        </StaggerItem>

        {/* Feedback */}
        <StaggerItem>
          <section className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-3">We Value Your Feedback</h2>
            <p className="text-muted-foreground">
              Have suggestions for improving Resume Tailor? We&apos;d love to hear from you!
              Send your feature requests and feedback to{" "}
              <a
                href="mailto:feedback@resumetailor.app"
                className="text-primary font-medium hover:underline"
              >
                feedback@resumetailor.app
              </a>
            </p>
          </section>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
