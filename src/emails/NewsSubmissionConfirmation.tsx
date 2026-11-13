import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

interface NewsSubmissionConfirmationProps {
  headline: string;
  category?: string;
  planName: string;
  amount: number | string;
  paymentMethod: string;
  paymentId?: string;
  txHash?: string;
  author?: string;
  submittedAt?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.nyaltx.pro';

export default function NewsSubmissionConfirmation({
  headline,
  category = 'General',
  planName = 'Standard Plan',
  amount = 0,
  paymentMethod = 'Online Payment',
  paymentId,
  txHash,
  author = 'Author',
  submittedAt,
}: NewsSubmissionConfirmationProps) {
  const displayAmount = typeof amount === 'number' ? `$${amount.toFixed(2)} USD` : `$${amount} USD`;
  const displayDate = submittedAt ? new Date(submittedAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }) : new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const txReference = paymentId || txHash || 'Verified on chain/provider';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>News Submission &amp; Payment Received: {headline}</Preview>
        <Container style={container}>
          <Section style={coverSection}>
            {/* Header */}
            <Section style={headerSection}>
              <img
                src={`${baseUrl}/logo.png`}
                alt="NYALTX Logo"
                width="90"
                height="90"
                style={{ margin: '0 auto 10px', display: 'block' }}
              />
              <Heading style={logoText}>🚀 NYALTX NEWS HUB</Heading>
              <Text style={headerSubtext}>Payment Confirmed &amp; Submission Received</Text>
            </Section>

            {/* Upper Body */}
            <Section style={upperSection}>
              {/* Payment Success Banner */}
              <Section style={successBanner}>
                <Text style={successBannerText}>
                  ✓ Payment Successfully Completed
                </Text>
                <Text style={successBannerSubtext}>
                  Your news article has been submitted and is currently pending admin review.
                </Text>
              </Section>

              <Heading style={h1}>Article &amp; Order Confirmation</Heading>
              <Text style={mainText}>
                Thank you for submitting your story to NYALTX News Hub. We have confirmed your payment and received your article details below:
              </Text>

              {/* Submission Details Card */}
              <Section style={infoCard}>
                <Text style={sectionTitle}>Submission Details</Text>
                <Section style={infoRow}>
                  <Text style={infoLabel}>Headline:</Text>
                  <Text style={infoValueBold}>{headline}</Text>
                </Section>
                <Section style={infoRow}>
                  <Text style={infoLabel}>Category:</Text>
                  <Text style={infoValue}>{category}</Text>
                </Section>
                <Section style={infoRow}>
                  <Text style={infoLabel}>Selected Plan:</Text>
                  <Text style={planBadge}>{planName}</Text>
                </Section>
                <Section style={infoRow}>
                  <Text style={infoLabel}>Amount Paid:</Text>
                  <Text style={amountText}>{displayAmount}</Text>
                </Section>
                <Section style={infoRow}>
                  <Text style={infoLabel}>Payment Method:</Text>
                  <Text style={infoValue}>{paymentMethod.toUpperCase()}</Text>
                </Section>
                <Section style={infoRow}>
                  <Text style={infoLabel}>Transaction Ref:</Text>
                  <Text style={infoValueSmall}>{txReference}</Text>
                </Section>
                <Section style={infoRow}>
                  <Text style={infoLabel}>Submitted At:</Text>
                  <Text style={infoValue}>{displayDate}</Text>
                </Section>
                <Section style={infoRow}>
                  <Text style={infoLabel}>Current Status:</Text>
                  <Text style={statusBadgePending}>⏳ Pending Admin Review</Text>
                </Section>
              </Section>

              {/* What Happens Next */}
              <Section style={nextStepsSection}>
                <Text style={nextStepsTitle}>What Happens Next?</Text>
                <Text style={listItem}>
                  <strong>1. Editorial Review:</strong> Our administrative team will review your story for quality, formatting, and community guidelines within 24 hours.
                </Text>
                <Text style={listItem}>
                  <strong>2. Live Publishing:</strong> Once approved, your article will be published live immediately to NYALTX News Hub and our official RSS syndication feed.
                </Text>
                <Text style={listItem}>
                  <strong>3. Live Link Notification:</strong> You will receive a follow-up email the moment your story is approved and published, containing the direct link to your article.
                </Text>
              </Section>

              <Section style={buttonContainer}>
                <Link href={`${baseUrl}/dashboard/news`} style={button}>
                  Visit NYALTX News Hub
                </Link>
              </Section>
            </Section>

            <Hr style={hr} />

            {/* Footer */}
            <Section style={lowerSection}>
              <Text style={footerText}>
                Questions about your submission? Reach us directly at{' '}
                <Link href="mailto:support@nyaltx.pro" style={link}>
                  support@nyaltx.pro
                </Link>
              </Text>
              <Text style={copyrightText}>
                © {new Date().getFullYear()} NYALTX. All rights reserved. Where Wall Street meets Web3.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

NewsSubmissionConfirmation.PreviewProps = {
  headline: 'NYAX Token Unveils New Staking Architecture for Tokenized Securities',
  category: 'NYAX',
  planName: 'Featured Slider ($99)',
  amount: 99,
  paymentMethod: 'PayPal',
  paymentId: 'PAYPAL-9823481239',
  txHash: '',
  author: 'Community Member',
  submittedAt: new Date().toISOString(),
} satisfies NewsSubmissionConfirmationProps;

const main = {
  backgroundColor: '#0a0f1d',
  color: '#e2e8f0',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const container = {
  padding: '24px 12px',
  margin: '0 auto',
  maxWidth: '600px',
};

const coverSection = {
  backgroundColor: '#111827',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid #1f2937',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
};

const headerSection = {
  backgroundColor: '#0f172a',
  padding: '32px 20px',
  textAlign: 'center' as const,
  borderBottom: '2px solid #00c3ff',
};

const logoText = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: '800',
  letterSpacing: '1px',
  margin: '6px 0 2px',
};

const headerSubtext = {
  color: '#94a3b8',
  fontSize: '13px',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1.5px',
};

const upperSection = {
  padding: '32px 28px',
};

const successBanner = {
  backgroundColor: '#064e3b',
  border: '1px solid #059669',
  borderRadius: '10px',
  padding: '16px 20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const successBannerText = {
  color: '#34d399',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 4px',
};

const successBannerSubtext = {
  color: '#a7f3d0',
  fontSize: '13px',
  margin: '0',
};

const h1 = {
  color: '#f8fafc',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const mainText = {
  color: '#cbd5e1',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 24px',
};

const infoCard = {
  backgroundColor: '#1e293b',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
  border: '1px solid #334155',
};

const sectionTitle = {
  color: '#00c3ff',
  fontSize: '14px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 16px',
  paddingBottom: '8px',
  borderBottom: '1px solid #334155',
};

const infoRow = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '7px 0',
  borderBottom: '1px solid #283548',
};

const infoLabel = {
  color: '#94a3b8',
  fontSize: '13px',
  margin: '0',
  width: '35%',
};

const infoValue = {
  color: '#f1f5f9',
  fontSize: '13px',
  margin: '0',
  width: '65%',
  textAlign: 'right' as const,
};

const infoValueBold = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0',
  width: '65%',
  textAlign: 'right' as const,
};

const infoValueSmall = {
  color: '#cbd5e1',
  fontSize: '11px',
  fontFamily: 'monospace',
  margin: '0',
  width: '65%',
  textAlign: 'right' as const,
  wordBreak: 'break-all' as const,
};

const planBadge = {
  display: 'inline-block',
  backgroundColor: '#4338ca',
  color: '#e0e7ff',
  fontSize: '12px',
  fontWeight: '700',
  padding: '3px 10px',
  borderRadius: '6px',
  margin: '0',
};

const amountText = {
  color: '#10b981',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0',
  width: '65%',
  textAlign: 'right' as const,
};

const statusBadgePending = {
  display: 'inline-block',
  backgroundColor: '#78350f',
  color: '#fef3c7',
  fontSize: '12px',
  fontWeight: '700',
  padding: '3px 10px',
  borderRadius: '6px',
  margin: '0',
};

const nextStepsSection = {
  backgroundColor: '#0f172a',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '28px',
  border: '1px solid #1e293b',
};

const nextStepsTitle = {
  color: '#f8fafc',
  fontSize: '15px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const listItem = {
  color: '#cbd5e1',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 10px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '28px 0 12px',
};

const button = {
  backgroundColor: '#00c3ff',
  color: '#0a0f1d',
  fontSize: '14px',
  fontWeight: '700',
  padding: '12px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 4px 14px rgba(0, 195, 255, 0.4)',
};

const hr = {
  borderColor: '#1f2937',
  margin: '0',
};

const lowerSection = {
  backgroundColor: '#0b1120',
  padding: '24px 28px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#64748b',
  fontSize: '12px',
  margin: '0 0 8px',
};

const copyrightText = {
  color: '#475569',
  fontSize: '11px',
  margin: '0',
};

const link = {
  color: '#00c3ff',
  textDecoration: 'none',
};
