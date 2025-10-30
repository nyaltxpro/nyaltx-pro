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

interface NewsletterWelcomeProps {
  name?: string;
  email: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nyaltx-pro-5hqd.vercel.app';

export default function NewsletterWelcome({
  name,
  email,
}: NewsletterWelcomeProps) {
  const displayName = name || 'Crypto Enthusiast';
  
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Welcome to NYALTX - Your Crypto Journey Starts Now!</Preview>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={headerSection}>
              <Heading style={logoText}>NYALTX</Heading>
              <Text style={headerSubtext}>Your Gateway to the Crypto World</Text>
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>Welcome to NYALTX! 🚀</Heading>
              <Text style={greetingText}>
                Hi {displayName},
              </Text>
              <Text style={mainText}>
                Welcome to the <strong>NYALTX Venture Access Network</strong>! You're now part of an 
                exclusive community of crypto traders, investors, and innovators.
              </Text>
              
              <Section style={benefitsSection}>
                <Text style={benefitsTitle}>What you can expect:</Text>
                <Section style={benefitsList}>
                  <Text style={benefitItem}>📈 Daily crypto market insights and analysis</Text>
                  <Text style={benefitItem}>🤝 Networking events and community meetups</Text>
                  <Text style={benefitItem}>🔥 Early access to new features and tools</Text>
                  <Text style={benefitItem}>💎 Premium trading signals and strategies</Text>
                </Section>
              </Section>
              
              <Text style={ctaText}>
                Ready to explore? Check out our platform and start your crypto journey:
              </Text>
              
              <Section style={buttonContainer}>
                <Link href={`${baseUrl}/dashboard`} style={button}>
                  Explore Dashboard
                </Link>
              </Section>
              
              <Hr style={divider} />
              
              <Section style={socialSection}>
                <Text style={socialTitle}>Follow us for real-time updates:</Text>
                <Section style={socialLinks}>
                  <Link href="https://x.com/nyaltx" style={socialLink}>
                    🐦 Twitter
                  </Link>
                  {' | '}
                  <Link href="https://t.me/nyaltx" style={socialLink}>
                    📱 Telegram
                  </Link>
                  {' | '}
                  <Link href="https://www.youtube.com/c/Nyaltx" style={socialLink}>
                    📺 YouTube
                  </Link>
                </Section>
              </Section>
              
              <Text style={signatureText}>
                Best regards,<br />
                <strong>The NYALTX Team</strong>
              </Text>
            </Section>
            <Hr style={hr} />
            <Section style={lowerSection}>
              <Text style={footerText}>
                © {new Date().getFullYear()} NYALTX. All rights reserved.
              </Text>
              <Text style={unsubscribeText}>
                If you no longer wish to receive these emails, you can{' '}
                <Link href={`${baseUrl}/unsubscribe`} style={link}>
                  unsubscribe here
                </Link>
                .
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

NewsletterWelcome.PreviewProps = {
  name: 'John Doe',
  email: 'john.doe@example.com',
} satisfies NewsletterWelcomeProps;

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
  fontSize: '28px',
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
  padding: '40px 30px',
  textAlign: 'center' as const,
  borderRadius: '10px 10px 0 0',
};

const logoText = {
  color: '#ffffff',
  fontSize: '36px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
  letterSpacing: '3px',
};

const headerSubtext = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0',
  opacity: 0.95,
};

const coverSection = { 
  backgroundColor: '#fff',
  borderRadius: '10px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const upperSection = { 
  padding: '40px 35px',
};

const lowerSection = { 
  padding: '30px 35px',
  backgroundColor: '#f8fafc',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '0',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '30px 0',
};

const greetingText = {
  ...text,
  fontSize: '16px',
  marginBottom: '8px',
};

const mainText = { 
  ...text, 
  marginBottom: '24px',
  fontSize: '15px',
};

const ctaText = {
  ...text,
  fontSize: '15px',
  marginTop: '24px',
  marginBottom: '16px',
};

const signatureText = {
  ...text,
  margin: '32px 0 0 0',
  lineHeight: '1.8',
};

const footerText = {
  ...text,
  fontSize: '12px',
  color: '#64748b',
  margin: '0 0 8px 0',
};

const unsubscribeText = {
  ...text,
  fontSize: '12px',
  color: '#94a3b8',
  margin: '0',
};

const benefitsSection = {
  backgroundColor: '#f8fafc',
  padding: '24px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  marginBottom: '24px',
};

const benefitsTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#1e293b',
  margin: '0 0 16px 0',
};

const benefitsList = {
  margin: '0',
  padding: '0',
};

const benefitItem = {
  fontSize: '15px',
  color: '#475569',
  margin: '10px 0',
  lineHeight: '1.6',
  paddingLeft: '8px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  display: 'inline-block',
  padding: '14px 32px',
  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  fontSize: '15px',
};

const socialSection = {
  marginTop: '32px',
  textAlign: 'center' as const,
};

const socialTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#475569',
  margin: '0 0 12px 0',
};

const socialLinks = {
  fontSize: '14px',
  color: '#475569',
};

const socialLink = {
  color: '#0ea5e9',
  textDecoration: 'none',
  fontWeight: '500',
};
