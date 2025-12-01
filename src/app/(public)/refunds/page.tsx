/**
 * Cancellation & Refunds Policy Page
 *
 * Digital product refund policy compliant with Razorpay requirements
 * and Indian Consumer Protection Act.
 */

import { FadeInView, StaggerContainer, StaggerItem } from "@/components/animations";
import Link from "next/link";

export const metadata = {
  title: "Cancellation & Refunds | Resume Tailor",
  description: "Our cancellation and refund policy for Resume Tailor subscriptions.",
};

export default function RefundsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <FadeInView>
        <h1 className="text-4xl font-bold mb-4">Cancellation & Refunds Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: December 1, 2024
        </p>
      </FadeInView>

      <StaggerContainer className="space-y-8">
        {/* Digital Product Nature */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">1. Nature of Service</h2>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-blue-900 dark:text-blue-100 mb-0">
                <strong>Important:</strong> Resume Tailor is a digital software service. All features
                and AI-powered tools are delivered instantly upon subscription activation. There is
                no physical shipping involved.
              </p>
            </div>
          </section>
        </StaggerItem>

        {/* Subscription Cancellation */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">2. Subscription Cancellation</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">2.1 How to Cancel</h3>
            <p>You can cancel your subscription at any time:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Go to Settings &gt; Billing in your dashboard</li>
              <li>Click &quot;Cancel Subscription&quot;</li>
              <li>Or email us at support@resumetailor.app</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">2.2 What Happens After Cancellation</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your subscription remains active until the end of the current billing period</li>
              <li>You retain access to all features until the period ends</li>
              <li>Your resumes and data are preserved for 30 days after expiration</li>
              <li>After 30 days, your data may be deleted per our Privacy Policy</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">2.3 Re-activation</h3>
            <p>
              You can reactivate your subscription at any time. If you reactivate within 30 days
              of cancellation, your previous data will be restored.
            </p>
          </section>
        </StaggerItem>

        {/* Refund Policy */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">3. Refund Policy</h2>

            <h3 className="text-xl font-medium mt-6 mb-3">3.1 Eligibility for Refund</h3>
            <p>We offer refunds in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Technical Issues:</strong> If you experience persistent technical problems
                that prevent you from using the service, and our support team is unable to resolve
                them within 5 business days
              </li>
              <li>
                <strong>Duplicate Charges:</strong> If you were charged multiple times for the same
                subscription period
              </li>
              <li>
                <strong>Within 48 Hours:</strong> If you request a refund within 48 hours of your
                first subscription payment and have not used AI features extensively (less than 5
                AI requests)
              </li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">3.2 Non-Refundable Items</h3>
            <p>The following are NOT eligible for refunds:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>AI credits that have been consumed</li>
              <li>Downloaded PDF resumes</li>
              <li>Subscription fees after 48 hours of purchase (unless technical issues apply)</li>
              <li>Subscriptions cancelled mid-cycle (you retain access until period ends)</li>
              <li>Dissatisfaction with AI-generated suggestions (see our{" "}
                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
                for AI content disclaimer)
              </li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">3.3 Partial Refunds</h3>
            <p>
              We do not offer partial or prorated refunds for unused portions of a subscription
              period. If you cancel mid-cycle, you continue to have access until the period ends.
            </p>
          </section>
        </StaggerItem>

        {/* How to Request Refund */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">4. How to Request a Refund</h2>
            <p>To request a refund:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Email <strong>support@resumetailor.app</strong> with subject line &quot;Refund Request&quot;</li>
              <li>Include your registered email address</li>
              <li>Provide the transaction ID or payment receipt</li>
              <li>Explain the reason for your refund request</li>
              <li>Include any relevant screenshots if applicable</li>
            </ol>
            <p className="mt-4">
              We will review your request within 3 business days and respond with our decision.
            </p>
          </section>
        </StaggerItem>

        {/* Refund Processing */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">5. Refund Processing</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Processing Time:</strong> Approved refunds are processed within 5-7 business days</li>
              <li><strong>Refund Method:</strong> Refunds are issued to the original payment method</li>
              <li><strong>Bank Processing:</strong> Depending on your bank, it may take an additional 5-10 business days for the refund to appear in your account</li>
              <li><strong>Currency:</strong> Refunds are issued in the same currency as the original transaction</li>
            </ul>
          </section>
        </StaggerItem>

        {/* Free Trial */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">6. Free Trial</h2>
            <p>
              If we offer a free trial period, you will not be charged during the trial. If you
              do not cancel before the trial ends, your payment method will be charged for the
              subscription. No refunds are provided for charges incurred after a trial period ends.
            </p>
          </section>
        </StaggerItem>

        {/* Razorpay Disputes */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">7. Payment Disputes</h2>
            <p>
              If you believe there was an unauthorized transaction, please contact us immediately
              at support@resumetailor.app. We work with Razorpay to investigate and resolve
              payment disputes.
            </p>
            <p className="mt-4">
              Please contact us before initiating a chargeback with your bank, as chargebacks
              may result in immediate account suspension while the dispute is being resolved.
            </p>
          </section>
        </StaggerItem>

        {/* Shipping Policy (Required by Razorpay) */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">8. Delivery / Shipping Policy</h2>
            <div className="bg-muted/50 rounded-lg p-4">
              <p>
                Resume Tailor is a <strong>100% digital service</strong>. There are no physical
                products shipped. All features and services are delivered electronically and are
                accessible immediately upon successful payment.
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li><strong>Delivery Method:</strong> Digital access via web browser</li>
                <li><strong>Delivery Time:</strong> Instant upon payment confirmation</li>
                <li><strong>Access:</strong> 24/7 availability from any device with internet</li>
              </ul>
            </div>
          </section>
        </StaggerItem>

        {/* Changes to Policy */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Cancellation & Refunds Policy from time to time. The updated
              version will be indicated by an updated &quot;Last updated&quot; date. We encourage
              you to review this policy periodically.
            </p>
          </section>
        </StaggerItem>

        {/* Contact */}
        <StaggerItem>
          <section className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
            <p>For refund requests or questions about this policy:</p>
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <p><strong>Email:</strong> support@resumetailor.app</p>
              <p><strong>Subject:</strong> Refund Request</p>
              <p><strong>Response Time:</strong> Within 3 business days</p>
            </div>
          </section>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
}
