import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Resumint",
  description: "Refund and Cancellation Policy for Resumint - AI-powered resume optimization platform",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold">Refund & Cancellation Policy</h1>
        <p className="mb-4 text-muted-foreground">Last updated: December 1, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Overview</h2>
            <p>
              At Resumint, we want you to be completely satisfied with our AI-powered resume optimization
              services. This policy outlines the terms for refunds and cancellations of our subscription
              plans and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Free Tier</h2>
            <p>
              Our free tier is provided at no cost and does not require any payment. As such, no refunds
              are applicable to the free tier. You can use the free tier indefinitely with the included
              features and limitations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Paid Subscriptions</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">Refund Eligibility</h3>
            <p>You may be eligible for a refund if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You request a refund within 7 days of your initial subscription purchase</li>
              <li>You have not extensively used the premium features</li>
              <li>There is a technical issue on our end that prevents you from using the service</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">Refund Exclusions</h3>
            <p>Refunds are generally not provided if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>More than 7 days have passed since your purchase</li>
              <li>You have already used the AI features extensively (e.g., generated multiple tailored resumes)</li>
              <li>You simply changed your mind after using the services</li>
              <li>Your account was terminated due to violation of our Terms of Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Cancellation Policy</h2>
            <h3 className="text-xl font-medium mt-6 mb-3">How to Cancel</h3>
            <p>
              You can cancel your subscription at any time through your account settings or by contacting
              our support team. Cancellation will take effect at the end of your current billing period.
            </p>

            <h3 className="text-xl font-medium mt-6 mb-3">Effects of Cancellation</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>You will retain access to premium features until the end of your billing period</li>
              <li>Your resumes and data will remain accessible on the free tier</li>
              <li>No further charges will be made after cancellation</li>
              <li>You can resubscribe at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Refund Process</h2>
            <p>To request a refund:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Contact our support team at support@resumint.app</li>
              <li>Provide your account email and reason for the refund request</li>
              <li>Our team will review your request within 3-5 business days</li>
              <li>If approved, refunds will be processed to the original payment method</li>
              <li>Refunds typically take 5-10 business days to appear in your account</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Promotional Offers</h2>
            <p>
              Special promotional offers, discounts, or trial periods may have different refund terms.
              Please review the specific terms provided with any promotional offer before purchasing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Service Interruptions</h2>
            <p>
              If our service experiences significant downtime or technical issues that prevent you
              from using the platform, we may offer:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Extension of your subscription period</li>
              <li>Pro-rated refund for the affected period</li>
              <li>Service credits for future use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Chargebacks</h2>
            <p>
              We encourage you to contact us directly before initiating a chargeback with your bank
              or payment provider. We are committed to resolving any issues fairly and promptly.
              Unauthorized chargebacks may result in account suspension.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to This Policy</h2>
            <p>
              We reserve the right to modify this refund policy at any time. Changes will be effective
              immediately upon posting. Your continued use of our services after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Us</h2>
            <p>
              For refund requests or questions about this policy, please contact us at:{" "}
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
