/**
 * Password Reset Code Email Template
 *
 * Sent to users who request a password reset via security code.
 */

import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from "@react-email/components";

interface PasswordResetCodeEmailProps {
  code: string;
}

export function PasswordResetCodeEmail({ code }: PasswordResetCodeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={heading}>Your password reset code</Text>

            <Text style={paragraph}>
              We received a request to reset your password. Use the code below
              to reset your password.
            </Text>

            <Section style={codeContainer}>
              <Text style={codeText}>{code}</Text>
            </Section>

            <Text style={paragraph}>
              This code will expire in 10 minutes.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              If you didn&apos;t request a password reset, you can safely ignore
              this email. Your password will remain unchanged.
            </Text>

            <Text style={footer}>
              For security reasons, never share this code with anyone.
            </Text>
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

const codeContainer = {
  backgroundColor: "#f4f4f5",
  borderRadius: "8px",
  padding: "24px",
  textAlign: "center" as const,
  marginBottom: "24px",
};

const codeText = {
  fontSize: "36px",
  fontWeight: "bold",
  letterSpacing: "8px",
  color: "#18181b",
  margin: "0",
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

export default PasswordResetCodeEmail;
