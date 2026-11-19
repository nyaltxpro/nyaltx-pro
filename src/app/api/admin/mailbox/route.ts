import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/adminAuth';
import { withAdminMailbox, MailboxConfigurationError } from '@/lib/adminMailbox';

export const runtime = 'nodejs';

const PAGE_SIZE = 50;

export async function GET(_request: NextRequest) {
  if (!(await getAdminFromRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const messages = await withAdminMailbox(async client => {
      const lock = await client.getMailboxLock('INBOX');
      try {
        const mailbox = client.mailbox;
        if (!mailbox) throw new Error('The INBOX mailbox could not be opened.');
        const total = mailbox.exists;
        if (total === 0) return { messages: [], total: 0 };

        const start = Math.max(1, total - PAGE_SIZE + 1);
        const fetched = await client.fetchAll(`${start}:*`, {
          envelope: true,
          flags: true,
          internalDate: true,
          size: true,
        });

        return {
          total,
          messages: fetched
            .map(message => ({
              uid: message.uid,
              from: (message.envelope?.from || []).map(address => ({
                name: address.name || '',
                email: address.address || '',
              })),
              to: (message.envelope?.to || []).map(address => address.address || ''),
              subject: message.envelope?.subject || '(no subject)',
              date: (message.internalDate || message.envelope?.date || new Date()).toISOString(),
              unread: !(message.flags?.has('\\Seen') ?? false),
              size: message.size || 0,
            }))
            .sort((a, b) => b.uid - a.uid),
        };
      } finally {
        lock.release();
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch admin inbox:', error);
    const status = error instanceof MailboxConfigurationError ? 503 : 502;
    return NextResponse.json(
      {
        error: status === 503
          ? error.message
          : 'Unable to connect to the configured mailbox. Check IMAP_HOST, IMAP_PORT, and mailbox credentials.',
      },
      { status }
    );
  }
}
