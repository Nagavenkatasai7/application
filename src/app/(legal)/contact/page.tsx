import { Metadata } from "next";
import { Mail, MessageSquare, Clock, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Resumint",
  description: "Get in touch with Resumint - AI-powered resume optimization platform",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-4 text-4xl font-bold">Contact Us</h1>
        <p className="mb-12 text-lg text-muted-foreground">
          Have questions or need help? We&apos;re here to assist you with your resume optimization journey.
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact Methods */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>

            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
              <Mail className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  For general inquiries and support
                </p>
                <a
                  href="mailto:support@resumint.app"
                  className="text-primary hover:underline"
                >
                  support@resumint.app
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
              <MessageSquare className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Business Inquiries</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  For partnerships and business matters
                </p>
                <a
                  href="mailto:business@resumint.app"
                  className="text-primary hover:underline"
                >
                  business@resumint.app
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
              <Clock className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Response Time</h3>
                <p className="text-sm text-muted-foreground">
                  We typically respond within 24-48 hours during business days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
              <MapPin className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Location</h3>
                <p className="text-sm text-muted-foreground">
                  India
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-medium mb-2">How do I reset my password?</h3>
                <p className="text-sm text-muted-foreground">
                  We use magic link authentication - simply enter your email on the login page
                  and we&apos;ll send you a secure sign-in link.
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-medium mb-2">How do I delete my account?</h3>
                <p className="text-sm text-muted-foreground">
                  Contact us at support@resumint.app with your request, and we&apos;ll process
                  your account deletion within 48 hours.
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-medium mb-2">Is my resume data secure?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! We use industry-standard encryption and never share your data
                  with third parties. See our Privacy Policy for details.
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-medium mb-2">Can I request a refund?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, we offer refunds within 7 days of purchase for eligible requests.
                  Please see our Refund Policy for full details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Contact Info */}
        <div className="mt-12 p-6 rounded-lg border bg-card">
          <h2 className="text-xl font-semibold mb-4">Other Ways to Reach Us</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Privacy Concerns</h3>
              <a href="mailto:privacy@resumint.app" className="text-primary hover:underline">
                privacy@resumint.app
              </a>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Legal Matters</h3>
              <a href="mailto:legal@resumint.app" className="text-primary hover:underline">
                legal@resumint.app
              </a>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Press & Media</h3>
              <a href="mailto:press@resumint.app" className="text-primary hover:underline">
                press@resumint.app
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
