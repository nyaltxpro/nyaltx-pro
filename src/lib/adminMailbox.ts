import { ImapFlow } from 'imapflow';

export class MailboxConfigurationError extends Error {
  constructor() {
    super('Mailbox configuration is missing. Configure IMAP_USER/IMAP_PASS or SMTP_USER/SMTP_PASS.');
    this.name = 'MailboxConfigurationError';
  }
}

export function createAdminMailboxClient() {
  const user = process.env.IMAP_USER || process.env.SMTP_USER;
  const pass = process.env.IMAP_PASS || process.env.SMTP_PASS;
  if (!user || !pass) throw new MailboxConfigurationError();

  const parsedPort = Number(process.env.IMAP_PORT || '993');
  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error('IMAP_PORT must be a valid TCP port.');
  }

  return new ImapFlow({
    host: process.env.IMAP_HOST || 'mail.privateemail.com',
    port: parsedPort,
    secure: process.env.IMAP_SECURE !== 'false',
    auth: { user, pass },
    logger: false,
  });
}

export async function withAdminMailbox<T>(
  operation: (client: ImapFlow) => Promise<T>
): Promise<T> {
  const client = createAdminMailboxClient();
  try {
    await client.connect();
    return await operation(client);
  } finally {
    if (client.usable) {
      try {
        await client.logout();
      } catch (error) {
        console.error('Failed to cleanly close the admin mailbox connection:', error);
      }
    }
  }
}
