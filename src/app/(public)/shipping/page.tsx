import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Resumint",
  description: "Shipping and Delivery Policy for Resumint - AI-powered resume optimization platform",
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold">Shipping & Delivery Policy</h1>
        <p className="mb-4 text-muted-foreground">Last updated: December 1, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Digital Service</h2>
            <p>
              Resumint is a Software as a Service (SaaS) platform that provides AI-powered resume
              optimization services. As a fully digital service, there are no physical products
              shipped or delivered.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Service Delivery</h2>
            <p>Our services are delivered digitally in the following ways:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Instant Access:</strong> Upon successful registration or subscription,
                you will have immediate access to our platform and features.
              </li>
              <li>
                <strong>Resume Downloads:</strong> Optimized resumes can be downloaded instantly
                as PDF files directly from your browser.
              </li>
              <li>
                <strong>AI Analysis:</strong> Resume analysis and optimization results are generated
                in real-time and displayed within the platform.
              </li>
              <li>
                <strong>Email Communications:</strong> Magic link authentication emails and
                notifications are delivered electronically to your registered email address.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Access Requirements</h2>
            <p>To access our services, you need:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A device with internet connectivity (computer, tablet, or smartphone)</li>
              <li>A modern web browser (Chrome, Firefox, Safari, or Edge)</li>
              <li>A valid email address for account authentication</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Service Availability</h2>
            <p>
              Our platform is available 24/7 with the exception of scheduled maintenance periods.
              We strive to maintain 99.9% uptime. Any planned maintenance will be communicated
              in advance through our platform or via email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. No Physical Shipping</h2>
            <p>
              Since Resumint is a digital service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>No physical products are shipped</li>
              <li>No shipping charges apply</li>
              <li>No delivery address is required</li>
              <li>No shipping timeframes or tracking numbers are applicable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Download Delivery</h2>
            <p>
              When you generate a resume PDF or export your data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Files are generated instantly on our servers</li>
              <li>Downloads are initiated directly through your browser</li>
              <li>No additional delivery time is required</li>
              <li>You can download your files multiple times</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Technical Issues</h2>
            <p>
              If you experience any issues accessing our services or downloading files:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Clear your browser cache and try again</li>
              <li>Try using a different browser</li>
              <li>Check your internet connection</li>
              <li>Contact our support team at support@resumint.app</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contact Us</h2>
            <p>
              If you have questions about service delivery or access, please contact us at:{" "}
              <a href="mailto:support@resumint.app" className="text-primary hover:underline">
                support@resumint.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
