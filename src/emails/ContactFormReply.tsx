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

interface ContactFormReplyProps {
  name: string;
  subject: string;
  message: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaltx-pro-5hqd.vercel.app';

export default function ContactFormReply({
  name,
  subject,
  message,
}: ContactFormReplyProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Thank you for contacting NYALTX - We'll respond soon!</Preview>
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
              <Text style={headerSubtext}>Thank You for Reaching Out</Text>
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>We've Received Your Message!</Heading>
              <Text style={greetingText}>
                Hi {name},
              </Text>
              <Text style={mainText}>
                Thank you for contacting NYALTX. We have received your message regarding{' '}
                <strong>"{subject}"</strong> and will get back to you as soon as possible.
              </Text>

              <Section style={infoBox}>
                <Text style={infoBoxTitle}>📋 Your Message Summary</Text>
                <Section style={messagePreview}>
                  <Text style={messagePreviewText}>{message}</Text>
                </Section>
              </Section>

              <Text style={responseText}>
                Our team typically responds within 24-48 hours during business days.
                If your inquiry is urgent, please mention it in your follow-up message.
              </Text>

              <Hr style={divider} />

              <Section style={linksSection}>
                <Text style={linksTitle}>While you wait, explore NYALTX:</Text>
                <Section style={linksList}>
                  <Text style={linkItem}>
                    📊{' '}
                    <Link href={`${baseUrl}/dashboard`} target="_blank" style={link}>
                      Trading Dashboard
                    </Link>
                  </Text>
                  <Text style={linkItem}>
                    🚀{' '}
                    <Link href={`${baseUrl}/pricing/race-to-liberty`} target="_blank" style={link}>
                      Race to Liberty
                    </Link>
                  </Text>
                  <Text style={linkItem}>
                    📰{' '}
                    <Link href={`${baseUrl}/news`} target="_blank" style={link}>
                      Latest News
                    </Link>
                  </Text>
                  <Text style={linkItem}>
                    ❓{' '}
                    <Link href={`${baseUrl}/faq`} target="_blank" style={link}>
                      FAQ
                    </Link>
                  </Text>
                </Section>
              </Section>

              <Text style={cautionText}>
                If you have any questions, please don't hesitate to contact our support team.
              </Text>
            </Section>
            <Hr style={hr} />
            <Section style={lowerSection}>
              <Text style={signatureText}>
                Best regards,<br />
                <strong>The NYALTX Team</strong>
              </Text>
              <Text style={contactInfo}>
                📧 Email: info@nyaltx.pro<br />
                🌐 Website:{' '}
                <Link href={baseUrl} target="_blank" style={link}>
                  nyaltx.pro
                </Link>
              </Text>
            </Section>
          </Section>
          <Text style={footerText}>
            © {new Date().getFullYear()} NYALTX. All rights reserved. |{' '}
            <Link href={`${baseUrl}/privacy-policy`} target="_blank" style={link}>
              Privacy Policy
            </Link>
            {' | '}
            <Link href={`${baseUrl}/contact`} target="_blank" style={link}>
              Contact Us
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

ContactFormReply.PreviewProps = {
  name: 'John Doe',
  subject: 'Partnership Inquiry',
  message: 'I would like to discuss a potential partnership opportunity with NYALTX.',
} satisfies ContactFormReplyProps;

const main = {
  backgroundColor: '#f5f5f5',
  color: '#212121',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  padding: '20px',
  margin: '0 auto',
  backgroundColor: '#eee',
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
  background: '#252f3d',
  padding: '30px',
  textAlign: 'center' as const,
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

const divider = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
};

const footerText = {
  ...text,
  fontSize: '12px',
  textAlign: 'center' as const,
  color: '#64748b',
  marginTop: '20px',
};

const greetingText = {
  ...text,
  fontSize: '15px',
  marginBottom: '8px',
};

const mainText = {
  ...text,
  marginBottom: '24px',
};

const responseText = {
  ...text,
  fontSize: '13px',
  color: '#64748b',
  marginTop: '20px',
};

const cautionText = {
  ...text,
  margin: '24px 0 0 0',
  fontSize: '13px',
  color: '#64748b',
};

const signatureText = {
  ...text,
  margin: '0 0 16px 0',
  lineHeight: '1.8',
};

const contactInfo = {
  ...text,
  fontSize: '13px',
  color: '#64748b',
  margin: '0',
  lineHeight: '1.8',
};

const infoBox = {
  backgroundColor: '#f8fafc',
  padding: '20px',
  border: '1px solid #e2e8f0',
  marginBottom: '24px',
};

const infoBoxTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 12px 0',
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

const linksSection = {
  marginTop: '24px',
};

const linksTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 12px 0',
};

const linksList = {
  margin: '0',
  padding: '0',
};

const linkItem = {
  fontSize: '14px',
  color: '#475569',
  margin: '8px 0',
  lineHeight: '1.6',
};
