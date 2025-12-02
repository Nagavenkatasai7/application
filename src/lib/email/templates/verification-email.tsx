/**
 * Email Verification Template
 *
 * Sent to users who register with email/password to verify their email address.
 */

import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Link,
} from "@react-email/components";

interface VerificationEmailProps {
  verificationUrl: string;
}

export function VerificationEmail({ verificationUrl }: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={heading}>Verify your email address</Text>

            <Text style={paragraph}>
              Thanks for signing up! Please click the button below to verify
              your email address and activate your account.
            </Text>

            <Button style={button} href={verificationUrl}>
              Verify Email Address
            </Button>

            <Text style={paragraph}>
              This link will expire in 24 hours.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              If you didn&apos;t create an account, you can safely ignore this
              email.
            </Text>

            <Text style={footer}>
              If the button doesn&apos;t work, copy and paste this link into
              your browser:
            </Text>

            <Link href={verificationUrl} style={link}>
              {verificationUrl}
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const section = {
  padding: "0 48px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#1a1a1a",
  marginBottom: "24px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#525f7f",
  marginBottom: "16px",
};

const button = {
  backgroundColor: "#18181b",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  marginBottom: "24px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "22px",
  marginBottom: "8px",
};

const link = {
  color: "#0070f3",
  fontSize: "14px",
  wordBreak: "break-all" as const,
};

export default VerificationEmail;
