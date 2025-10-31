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

interface TokenRegistrationAdminProps {
  tokenName: string;
  tokenSymbol: string;
  blockchain: string;
  contractAddress: string;
  submittedByAddress?: string;
  registrationId: string;
  createdAt: string;
  website?: string;
  twitter?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaltx.pro';

export default function TokenRegistrationAdmin({
  tokenName,
  tokenSymbol,
  blockchain,
  contractAddress,
  submittedByAddress,
  registrationId,
  createdAt,
  website,
  twitter,
}: TokenRegistrationAdminProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>New Token Registration: {tokenName} ({tokenSymbol})</Preview>
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
              <Heading style={logoText}>🔔 NYALTX Admin</Heading>
              <Text style={headerSubtext}>New Token Registration</Text>
            </Section>
            <Section style={upperSection}>
              <Section style={alertBox}>
                <Text style={alertText}>
                  <strong>⚠️ Action Required:</strong> A new token registration requires admin review and approval.
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
                    <Text style={infoLabel}>Submitted By:</Text>
                    <Text style={infoValueSmall}>{submittedByAddress || 'Unknown'}</Text>
                  </Section>
                  <Section style={infoRow}>
                    <Text style={infoLabel}>Registration ID:</Text>
                    <Text style={infoValue}>{registrationId}</Text>
                  </Section>
                  <Section style={infoRow}>
                    <Text style={infoLabel}>Submitted:</Text>
                    <Text style={infoValue}>{new Date(createdAt).toLocaleString()}</Text>
                  </Section>
                  {website && (
                    <Section style={infoRow}>
                      <Text style={infoLabel}>Website:</Text>
                      <Text style={infoValue}>
                        <Link href={website} style={link}>{website}</Link>
                      </Text>
                    </Section>
                  )}
                  {twitter && (
                    <Section style={infoRow}>
                      <Text style={infoLabel}>Twitter:</Text>
                      <Text style={infoValue}>
                        <Link href={twitter} style={link}>{twitter}</Link>
                      </Text>
                    </Section>
                  )}
                </Section>
              </Section>

              <Section style={actionsSection}>
                <Text style={actionsTitle}>Quick Actions</Text>
                <Text style={actionsText}>Review this token registration and take appropriate action:</Text>
                <Section style={buttonContainer}>
                  <Link href={`${baseUrl}/adminpanel/tokens?id=${registrationId}`} style={buttonReview}>
                    Review Details
                  </Link>
                  <Link href={`${baseUrl}/adminpanel/tokens?id=${registrationId}&action=approve`} style={buttonApprove}>
                    Quick Approve
                  </Link>
                  <Link href={`${baseUrl}/adminpanel/tokens?id=${registrationId}&action=reject`} style={buttonReject}>
                    Reject
                  </Link>
                </Section>
              </Section>

              <Section style={checklistSection}>
                <Text style={checklistTitle}>Verification Checklist:</Text>
                <Text style={checklistItem}>☐ Verify contract address exists on the specified blockchain</Text>
                <Text style={checklistItem}>☐ Check token name and symbol match the contract</Text>
                <Text style={checklistItem}>☐ Review website and social media links for legitimacy</Text>
                <Text style={checklistItem}>☐ Ensure token is not a duplicate or scam</Text>
                <Text style={checklistItem}>☐ Confirm compliance with platform guidelines</Text>
              </Section>
            </Section>
            <Hr style={hr} />
            <Section style={lowerSection}>
              <Text style={footerText}>
                This is an automated notification from the NYALTX token registration system.
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

TokenRegistrationAdmin.PreviewProps = {
  tokenName: 'Sample Token',
  tokenSymbol: 'SMPL',
  blockchain: 'Ethereum',
  contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
  submittedByAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
  registrationId: 'REG-001',
  createdAt: new Date().toISOString(),
  website: 'https://example.com',
  twitter: 'https://twitter.com/example',
} satisfies TokenRegistrationAdminProps;

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
  borderBottom: '2px solid #c82333',
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

const alertBox = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeaa7',
  padding: '15px',
  margin: '0 0 24px 0',
};

const alertText = {
  color: '#856404',
  fontSize: '14px',
  margin: '0',
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

const actionsSection = {
  backgroundColor: '#e7f3ff',
  borderLeft: '4px solid #007bff',
  padding: '20px',
  margin: '24px 0',
};

const actionsTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#0c5460',
  margin: '0 0 12px 0',
};

const actionsText = {
  fontSize: '14px',
  color: '#475569',
  margin: '0 0 20px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '20px 0 0 0',
};

const buttonReview = {
  display: 'inline-block',
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '14px',
  margin: '5px',
};

const buttonApprove = {
  display: 'inline-block',
  padding: '10px 20px',
  backgroundColor: '#28a745',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '14px',
  margin: '5px',
};

const buttonReject = {
  display: 'inline-block',
  padding: '10px 20px',
  backgroundColor: '#dc3545',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '14px',
  margin: '5px',
};

const checklistSection = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  margin: '24px 0 0 0',
};

const checklistTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#495057',
  margin: '0 0 12px 0',
};

const checklistItem = {
  fontSize: '14px',
  color: '#6c757d',
  margin: '8px 0',
  paddingLeft: '8px',
};

const hr = {
  borderColor: '#e9ecef',
  margin: '0',
};

const footerText = {
  fontSize: '13px',
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
  color: '#007bff',
  textDecoration: 'underline',
};
