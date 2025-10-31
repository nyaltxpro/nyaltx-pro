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

interface TokenRegistrationUserProps {
  tokenName: string;
  tokenSymbol: string;
  blockchain: string;
  contractAddress: string;
  status: string;
  registrationId: string;
  createdAt: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaltx.pro';

export default function TokenRegistrationUser({
  tokenName,
  tokenSymbol,
  blockchain,
  contractAddress,
  status,
  registrationId,
  createdAt,
}: TokenRegistrationUserProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Token Registration Submitted: {tokenName} ({tokenSymbol})</Preview>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={headerSection}>
              <img
                src={`${baseUrl}/logo.png`}
                alt="NYALTX Logo"
                width="120"
                height="120"
                style={{ margin: '0 auto 10px', display: 'block' }}
              />
              <Heading style={logoText}>🚀 NYALTX</Heading>
              <Text style={headerSubtext}>Token Registration Confirmation</Text>
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>Thank You for Registering!</Heading>
              <Text style={mainText}>
                Your token registration has been received and is now under review by our team.
              </Text>

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
                    <Text style={statusBadge}>{status}</Text>
                  </Section>
                  <Section style={infoRow}>
                    <Text style={infoLabel}>Registration ID:</Text>
                    <Text style={infoValue}>{registrationId}</Text>
                  </Section>
                  <Section style={infoRow}>
                    <Text style={infoLabel}>Submitted:</Text>
                    <Text style={infoValue}>{new Date(createdAt).toLocaleString()}</Text>
                  </Section>
                </Section>
              </Section>

              <Section style={nextStepsSection}>
                <Text style={nextStepsTitle}>What's Next?</Text>
                <Text style={listItem}>✓ Our team will review your token registration within 24-48 hours</Text>
                <Text style={listItem}>✓ We'll verify the contract address and token details</Text>
                <Text style={listItem}>✓ You'll receive an email notification once the review is complete</Text>
                <Text style={listItem}>✓ Approved tokens will appear in search results and analytics</Text>
              </Section>

              <Section style={buttonContainer}>
                <Link href={`${baseUrl}/dashboard/tokens`} style={button}>
                  View Your Tokens
                </Link>
              </Section>
            </Section>
            <Hr style={hr} />
            <Section style={lowerSection}>
              <Text style={footerText}>
                Need help? Contact us at{' '}
                <Link href="mailto:support@nyaltx.pro" style={link}>
                  support@nyaltx.pro
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

TokenRegistrationUser.PreviewProps = {
  tokenName: 'Sample Token',
  tokenSymbol: 'SMPL',
  blockchain: 'Ethereum',
  contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
  status: 'pending',
  registrationId: 'REG-001',
  createdAt: new Date().toISOString(),
} satisfies TokenRegistrationUserProps;

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
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const headerSection = {
  backgroundColor: '#252f3d',
  padding: '30px',
  textAlign: 'center' as const,
  borderBottom: '2px solid #0097b8',
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

const h1 = {
  color: '#2c3e50',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
  marginTop: '0',
};

const mainText = {
  color: '#475569',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
};

const tokenInfoSection = {
  backgroundColor: '#f8f9fa',
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
  display: 'inline-block',
  padding: '4px 12px',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  backgroundColor: '#fff3cd',
  color: '#856404',
  margin: '0',
};

const nextStepsSection = {
  backgroundColor: '#e7f3ff',
  borderLeft: '4px solid #00b8d8',
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
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  display: 'inline-block',
  padding: '12px 24px',
  backgroundColor: '#252f3d',
  color: '#ffffff',
  textDecoration: 'none',
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
