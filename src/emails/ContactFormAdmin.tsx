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

interface ContactFormAdminProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaltx-pro-5hqd.vercel.app';

export default function ContactFormAdmin({
  name,
  email,
  subject,
  message,
}: ContactFormAdminProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>New Contact Form Submission - {subject}</Preview>
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
              <Heading style={logoText}>NYALTX</Heading>
              <Text style={headerSubtext}>New Contact Form Submission</Text>
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>Contact Form Message</Heading>
              <Text style={mainText}>
                You have received a new message from the NYALTX contact form.
                Please review the details below and respond accordingly.
              </Text>

              <Section style={infoBox}>
                <Text style={infoBoxTitle}>📋 Submission Details</Text>
                <Section style={infoRow}>
                  <Text style={infoLabel}>From:</Text>
                  <Text style={infoValue}>{name}</Text>
                </Section>
                <Section style={infoRow}>
                  <Text style={infoLabel}>Email:</Text>
                  <Text style={infoValue}>{email}</Text>
                </Section>
                <Section style={infoRow}>
                  <Text style={infoLabel}>Subject:</Text>
                  <Text style={infoValue}>{subject}</Text>
                </Section>
                <Section style={infoRow}>
                  <Text style={infoLabel}>Submitted:</Text>
                  <Text style={infoValue}>{new Date().toLocaleString()}</Text>
                </Section>
              </Section>

              <Section style={infoBox}>
                <Text style={infoBoxTitle}>💬 Message</Text>
                <Section style={messagePreview}>
                  <Text style={messagePreviewText}>{message}</Text>
                </Section>
              </Section>
            </Section>
            <Hr style={hr} />
            <Section style={lowerSection}>
              <Text style={cautionText}>
                This is an automated notification from the NYALTX contact form.
                To respond to this inquiry, please reply directly to {email}.
              </Text>
            </Section>
          </Section>
          <Text style={footerText}>
            © {new Date().getFullYear()} NYALTX. All rights reserved. |{' '}
            <Link href={`${baseUrl}`} target="_blank" style={link}>
              nyaltx.com
            </Link>
            {' | '}
            <Link href={`${baseUrl}/admin`} target="_blank" style={link}>
              Admin Dashboard
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ContactFormAdmin.PreviewProps = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  subject: 'Partnership Inquiry',
  message: 'I would like to discuss a potential partnership opportunity with NYALTX.',
} satisfies ContactFormAdminProps;

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
  background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
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

const cautionText = {
  ...text,
  margin: '0',
  fontSize: '13px',
  color: '#64748b',
};

const infoBox = {
  backgroundColor: '#f8fafc',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  marginBottom: '24px',
};

const infoBoxTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 16px 0',
};

const infoRow = {
  marginBottom: '12px',
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

const messagePreview = {
  backgroundColor: '#ffffff',
  padding: '15px',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  borderLeft: '4px solid #0ea5e9',
};

const messagePreviewText = {
  fontSize: '13px',
  color: '#475569',
  lineHeight: '1.7',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
  wordWrap: 'break-word' as const,
};
