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

interface NewsApprovalNotificationProps {
  headline: string;
  category?: string;
  planName?: string;
  slug: string;
  articleUrl?: string;
  publishedAt?: string;
  author?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.nyaltx.pro';

export default function NewsApprovalNotification({
  headline,
  category = 'News',
  planName,
  slug,
  articleUrl,
  publishedAt,
  author = 'Author',
}: NewsApprovalNotificationProps) {
  const liveUrl = articleUrl || `${baseUrl}/news/${slug}`;
  const displayDate = publishedAt ? new Date(publishedAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }) : new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>🎉 Your Article is Live on NYALTX: {headline}</Preview>
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
              <Heading style={logoText}>✅ NYALTX NEWS HUB</Heading>
              <Text style={headerSubtext}>Article Approved &amp; Published Live</Text>
            </Section>

            {/* Upper Section */}
            <Section style={upperSection}>
              {/* Live Banner */}
              <Section style={successBanner}>
                <Text style={successBannerHeading}>
                  🎉 Congratulations! Your Article is Live
                </Text>
                <Text style={successBannerSubtext}>
                  Your news submission has been reviewed, approved, and published across the NYALTX platform and official RSS syndication network.
                </Text>
              </Section>

              <Heading style={h1}>Publication Summary</Heading>
              <Text style={mainText}>
                Your article is now publicly accessible to our community, traders, investors, and syndicated platform partners.
              </Text>

              {/* Publication Details */}
              <Section style={infoCard}>
                <Text style={sectionTitle}>Published Article Details</Text>
                <Section style={infoRow}>
                  <Text style={infoLabel}>Article Title:</Text>
                  <Text style={infoValueBold}>{headline}</Text>
                </Section>
                <Section style={infoRow}>
                  <Text style={infoLabel}>Category:</Text>
                  <Text style={infoValue}>{category}</Text>
                </Section>
                {planName && (
                  <Section style={infoRow}>
                    <Text style={infoLabel}>Active Plan:</Text>
                    <Text style={planBadge}>{planName}</Text>
                  </Section>
                )}
                <Section style={infoRow}>
                  <Text style={infoLabel}>Published Date:</Text>
                  <Text style={infoValue}>{displayDate}</Text>
                </Section>
                <Section style={infoRow}>
                  <Text style={infoLabel}>Distribution:</Text>
                  <Text style={infoValue}>NYALTX News Hub, Dashboard &amp; Official RSS</Text>
                </Section>
                <Section style={infoRow}>
                  <Text style={infoLabel}>Article URL:</Text>
                  <Text style={urlText}>
                    <Link href={liveUrl} style={urlLink}>
                      {liveUrl}
                    </Link>
                  </Text>
                </Section>
              </Section>

              {/* Call to Action Button */}
              <Section style={buttonContainer}>
                <Link href={liveUrl} style={primaryButton}>
                  View Your Published Article →
                </Link>
              </Section>

              {/* Distribution & Next Steps */}
              <Section style={tipsSection}>
                <Text style={tipsTitle}>Maximize Your Reach</Text>
                <Text style={listItem}>
                  📢 <strong>Share on Social Media:</strong> Share your direct article link on X (Twitter), LinkedIn, and Telegram to drive traffic.
                </Text>
                <Text style={listItem}>
                  📡 <strong>RSS Syndication:</strong> Your story is now automatically included in our official RSS feed at <Link href={`${baseUrl}/rss.xml`} style={inlineLink}>{baseUrl}/rss.xml</Link> for partner aggregation.
                </Text>
                <Text style={listItem}>
                  📊 <strong>Track Engagement:</strong> Monitor article views and traction directly on the NYALTX dashboard.
                </Text>
              </Section>
            </Section>

            <Hr style={hr} />

            {/* Footer */}
            <Section style={lowerSection}>
              <Text style={footerText}>
                Need to update or amend your published story? Contact our editorial desk at{' '}
                <Link href="mailto:support@nyaltx.pro" style={inlineLink}>
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

NewsApprovalNotification.PreviewProps = {
  headline: 'NYAX Token Unveils New Staking Architecture for Tokenized Securities',
  category: 'NYAX',
  planName: 'Featured Slider ($99)',
  slug: 'nyax-token-unveils-new-staking-architecture',
  articleUrl: 'https://www.nyaltx.pro/news/nyax-token-unveils-new-staking-architecture',
  publishedAt: new Date().toISOString(),
  author: 'NYAX Community',
} satisfies NewsApprovalNotificationProps;

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
  backgroundColor: '#064e3b',
  padding: '32px 20px',
  textAlign: 'center' as const,
  borderBottom: '2px solid #10b981',
};

const logoText = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: '800',
  letterSpacing: '1px',
  margin: '6px 0 2px',
};

const headerSubtext = {
  color: '#a7f3d0',
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
  padding: '18px 20px',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const successBannerHeading = {
  color: '#34d399',
  fontSize: '17px',
  fontWeight: '700',
  margin: '0 0 6px',
};

const successBannerSubtext = {
  color: '#d1fae5',
  fontSize: '13px',
  lineHeight: '20px',
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
  marginBottom: '28px',
  border: '1px solid #334155',
};

const sectionTitle = {
  color: '#10b981',
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
  padding: '8px 0',
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

const urlText = {
  width: '65%',
  textAlign: 'right' as const,
  margin: '0',
  wordBreak: 'break-all' as const,
};

const urlLink = {
  color: '#00c3ff',
  fontSize: '12px',
  textDecoration: 'underline',
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

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '10px 0 32px',
};

const primaryButton = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '700',
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
};

const tipsSection = {
  backgroundColor: '#0f172a',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
  border: '1px solid #1e293b',
};

const tipsTitle = {
  color: '#f8fafc',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const listItem = {
  color: '#cbd5e1',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 10px',
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

const inlineLink = {
  color: '#00c3ff',
  textDecoration: 'none',
};
