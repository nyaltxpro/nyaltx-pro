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

interface TokenApprovalProps {
  tokenName: string;
  tokenSymbol: string;
  blockchain: string;
  contractAddress: string;
  approved: boolean;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaltx.com';

export default function TokenApproval({
  tokenName,
  tokenSymbol,
  blockchain,
  contractAddress,
  approved,
}: TokenApprovalProps) {
  const statusText = approved ? 'Approved' : 'Rejected';
  const statusIcon = approved ? '✅' : '❌';
  const statusColor = approved ? '#28a745' : '#dc3545';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Token {statusText}: {tokenName} ({tokenSymbol})</Preview>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={{
              ...headerSection,
              backgroundColor: statusColor,
              borderBottom: `2px solid ${approved ? '#218838' : '#c82333'}`,
            }}>
              <Heading style={logoText}>{statusIcon} NYALTX</Heading>
              <Text style={headerSubtext}>Token Registration {statusText}</Text>
            </Section>
            <Section style={upperSection}>
              <Section style={{
                ...statusBanner,
                backgroundColor: approved ? '#d4edda' : '#f8d7da',
                border: `1px solid ${approved ? '#c3e6cb' : '#f5c6cb'}`,
              }}>
                <Text style={{
                  ...statusBannerText,
                  color: approved ? '#155724' : '#721c24',
                }}>
                  {statusIcon} Your token registration has been {statusText.toLowerCase()}!
                </Text>
              </Section>

              <Section style={tokenInfoSection}>
                <Text style={sectionTitle}>Token Details</Text>
                <Section style={infoGrid}>
                  <Section style={infoRow}>
                    <Text style={infoLabel}>Token Name:</Text>
                    <Text style={infoValue}>{tokenName}</Text>
                  </Section>
                  <Section style={infoRow}>
                    <Text style={infoLabel}>Symbol:</Text>
                    <Text style={infoValue}>{tokenSymbol}</Text>
                  </Section>
                  <Section style={infoRow}>
                    <Text style={infoLabel}>Blockchain:</Text>
                    <Text style={infoValue}>{blockchain}</Text>
                  </Section>
                  <Section style={infoRow}>
                    <Text style={infoLabel}>Contract Address:</Text>
                    <Text style={infoValueSmall}>{contractAddress}</Text>
                  </Section>
                  <Section style={infoRow}>
                    <Text style={infoLabel}>Status:</Text>
                    <Text style={{
                      ...statusBadge,
                      color: statusColor,
                      fontWeight: '600',
                    }}>{statusText}</Text>
                  </Section>
                </Section>
              </Section>

              <Section style={{
                ...nextStepsSection,
                backgroundColor: approved ? '#e7f3ff' : '#fff3cd',
                borderLeft: `4px solid ${approved ? '#007bff' : '#ffc107'}`,
              }}>
                <Text style={nextStepsTitle}>
                  {approved ? "What's Next?" : "Next Steps"}
                </Text>
                {approved ? (
                  <>
                    <Text style={listItem}>✓ Your token is now live on the NYALTX platform</Text>
                    <Text style={listItem}>✓ Users can discover it in search results</Text>
                    <Text style={listItem}>✓ Analytics and charts are being generated</Text>
                    <Text style={listItem}>✓ Your token may be eligible for boost multipliers in Race to Liberty</Text>
                  </>
                ) : (
                  <>
                    <Text style={listItem}>• Your token registration did not meet our current criteria</Text>
                    <Text style={listItem}>• You can submit a new registration with updated information</Text>
                    <Text style={listItem}>• Contact support if you believe this was an error</Text>
                    <Text style={listItem}>• Review our token listing guidelines for requirements</Text>
                  </>
                )}
              </Section>

              <Section style={buttonContainer}>
                <Link href={`${baseUrl}/dashboard/tokens`} style={{
                  ...button,
                  backgroundColor: statusColor,
                }}>
                  {approved ? 'View Your Token' : 'Submit New Registration'}
                </Link>
              </Section>
            </Section>
            <Hr style={hr} />
            <Section style={lowerSection}>
              <Text style={footerText}>
                Need help? Contact us at{' '}
                <Link href="mailto:support@nyaltx.com" style={link}>
                  support@nyaltx.com
                </Link>
              </Text>
              <Text style={copyrightText}>
                © {new Date().getFullYear()} NYALTX. All rights reserved.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

TokenApproval.PreviewProps = {
  tokenName: 'Sample Token',
  tokenSymbol: 'SMPL',
  blockchain: 'Ethereum',
  contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
  approved: true,
} satisfies TokenApprovalProps;

const main = {
  backgroundColor: '#f8f9fa',
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const container = {
  padding: '20px',
  margin: '0 auto',
  backgroundColor: '#f8f9fa',
  maxWidth: '600px',
};

const coverSection = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const headerSection = {
  padding: '30px',
  textAlign: 'center' as const,
};

const logoText = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
  letterSpacing: '1px',
};

const headerSubtext = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0',
  opacity: 0.95,
};

const upperSection = {
  padding: '30px 35px',
};

const lowerSection = {
  padding: '25px 35px',
  backgroundColor: '#f8fafc',
  textAlign: 'center' as const,
};

const statusBanner = {
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center' as const,
  margin: '0 0 24px 0',
};

const statusBannerText = {
  fontSize: '18px',
  fontWeight: '600',
  margin: '0',
};

const tokenInfoSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const sectionTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#2c3e50',
  margin: '0 0 16px 0',
};

const infoGrid = {
  margin: '0',
};

const infoRow = {
  marginBottom: '12px',
  paddingBottom: '12px',
  borderBottom: '1px solid #e9ecef',
};

const infoLabel = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#495057',
  margin: '0 0 4px 0',
};

const infoValue = {
  fontSize: '14px',
  color: '#6c757d',
  margin: '0',
  wordBreak: 'break-word' as const,
};

const infoValueSmall = {
  fontSize: '12px',
  color: '#6c757d',
  margin: '0',
  wordBreak: 'break-all' as const,
};

const statusBadge = {
  fontSize: '14px',
  margin: '0',
};

const nextStepsSection = {
  padding: '20px',
  margin: '24px 0',
};

const nextStepsTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#0c5460',
  margin: '0 0 16px 0',
};

const listItem = {
  fontSize: '14px',
  color: '#475569',
  margin: '12px 0',
  lineHeight: '1.6',
  paddingLeft: '8px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  display: 'inline-block',
  padding: '12px 24px',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '15px',
};

const hr = {
  borderColor: '#e9ecef',
  margin: '0',
};

const footerText = {
  fontSize: '14px',
  color: '#6c757d',
  margin: '0 0 10px 0',
  textAlign: 'center' as const,
};

const copyrightText = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '0',
  textAlign: 'center' as const,
};

const link = {
  color: '#00b8d8',
  textDecoration: 'underline',
};
