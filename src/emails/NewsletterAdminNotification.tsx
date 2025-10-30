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

interface NewsletterAdminNotificationProps {
  email: string;
  name?: string;
  ipAddress?: string;
  timestamp: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaltx-pro-5hqd.vercel.app';

export default function NewsletterAdminNotification({
  email,
  name,
  ipAddress,
  timestamp,
}: NewsletterAdminNotificationProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>New Newsletter Subscription - {email}</Preview>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={headerSection}>
              <Heading style={logoText}>NYALTX</Heading>
              <Text style={headerSubtext}>Newsletter Subscription Alert</Text>
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>📧 New Newsletter Subscription</Heading>
              <Text style={mainText}>
                A new user has subscribed to the NYALTX newsletter.
              </Text>
              
              <Section style={infoBox}>
                <Section style={infoRow}>
                  <Text style={infoLabel}>Email:</Text>
                  <Text style={infoValue}>{email}</Text>
                </Section>
                
                <Section style={infoRow}>
                  <Text style={infoLabel}>Name:</Text>
                  <Text style={infoValue}>{name || 'Not provided'}</Text>
                </Section>
                
                <Section style={infoRow}>
                  <Text style={infoLabel}>IP Address:</Text>
                  <Text style={infoValue}>{ipAddress || 'Unknown'}</Text>
                </Section>
                
                <Section style={infoRow}>
                  <Text style={infoLabel}>Timestamp:</Text>
                  <Text style={infoValue}>{timestamp}</Text>
                </Section>
              </Section>
              
              <Section style={actionSection}>
                <Link href={`${baseUrl}/admin`} style={button}>
                  View Admin Dashboard
                </Link>
              </Section>
              
              <Text style={noteText}>
                The subscriber has been sent a welcome email and their information has been logged.
              </Text>
            </Section>
            <Hr style={hr} />
            <Section style={lowerSection}>
              <Text style={cautionText}>
                This is an automated notification from the NYALTX newsletter subscription system.
              </Text>
            </Section>
          </Section>
          <Text style={footerText}>
            © {new Date().getFullYear()} NYALTX. All rights reserved. |{' '}
            <Link href={`${baseUrl}/admin`} target="_blank" style={link}>
              Admin Dashboard
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

NewsletterAdminNotification.PreviewProps = {
  email: 'john.doe@example.com',
  name: 'John Doe',
  ipAddress: '192.168.1.1',
  timestamp: new Date().toISOString(),
} satisfies NewsletterAdminNotificationProps;

const main = {
  backgroundColor: '#f5f5f5',
  color: '#212121',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  padding: '20px',
  margin: '0 auto',
  backgroundColor: '#f5f5f5',
  maxWidth: '600px',
};

const h1 = {
  color: '#1e293b',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '15px',
  marginTop: '0',
};

const link = {
  color: '#0ea5e9',
  textDecoration: 'underline',
};

const text = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const headerSection = {
  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  padding: '30px',
  textAlign: 'center' as const,
  borderRadius: '10px 10px 0 0',
};

const logoText = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
  letterSpacing: '2px',
};

const headerSubtext = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0',
  opacity: 0.9,
};

const coverSection = { 
  backgroundColor: '#fff',
  borderRadius: '10px',
  overflow: 'hidden',
};

const upperSection = { 
  padding: '30px 35px',
};

const lowerSection = { 
  padding: '25px 35px',
  backgroundColor: '#f8fafc',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '0',
};

const footerText = {
  ...text,
  fontSize: '12px',
  textAlign: 'center' as const,
  color: '#64748b',
  marginTop: '20px',
};

const mainText = { 
  ...text, 
  marginBottom: '24px',
};

const noteText = {
  ...text,
  fontSize: '13px',
  color: '#64748b',
  marginTop: '24px',
  fontStyle: 'italic',
};

const cautionText = { 
  ...text, 
  margin: '0',
  fontSize: '13px',
  color: '#64748b',
};

const infoBox = {
  backgroundColor: '#f8fafc',
  padding: '24px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  marginBottom: '24px',
};

const infoRow = {
  marginBottom: '16px',
};

const infoLabel = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#64748b',
  margin: '0 0 4px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const infoValue = {
  fontSize: '15px',
  color: '#1e293b',
  margin: '0',
  fontWeight: '500',
};

const actionSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  display: 'inline-block',
  padding: '12px 28px',
  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  fontSize: '14px',
};
