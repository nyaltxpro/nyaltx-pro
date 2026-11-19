import { simpleParser } from 'mailparser';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/adminAuth';
import { withAdminMailbox, MailboxConfigurationError } from '@/lib/adminMailbox';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  if (!(await getAdminFromRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uid: uidParam } = await params;
  if (!/^\d+$/.test(uidParam)) {
    return NextResponse.json({ error: 'A valid message ID is required.' }, { status: 400 });
  }
  const uid = Number(uidParam);
  if (!Number.isSafeInteger(uid) || uid < 1) {
    return NextResponse.json({ error: 'A valid message ID is required.' }, { status: 400 });
  }

  try {
    const message = await withAdminMailbox(async client => {
      const lock = await client.getMailboxLock('INBOX');
      try {
        const fetched = await client.fetchOne(
          String(uid),
          { envelope: true, flags: true, internalDate: true, source: true },
          { uid: true }
        );
        if (!fetched) return null;
        if (!fetched.source) throw new Error('Message source is unavailable.');

        const parsed = await simpleParser(fetched.source);
        const formatAddresses = (addresses: typeof parsed.from | typeof parsed.to) =>
          (Array.isArray(addresses) ? addresses : addresses ? [addresses] : []).flatMap(address =>
            address.value.map(item => ({
              name: item.name || '',
              email: item.address || '',
            }))
          );
        await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true });

        return {
          uid: fetched.uid,
          from: formatAddresses(parsed.from),
          to: formatAddresses(parsed.to),
          cc: formatAddresses(parsed.cc),
          subject: parsed.subject || '(no subject)',
          date: (parsed.date || fetched.internalDate || new Date()).toISOString(),
          body: parsed.text || '',
          messageId: parsed.messageId || '',
        };
      } finally {
        lock.release();
      }
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
    }
    return NextResponse.json({ message });
  } catch (error) {
    console.error('Failed to read admin inbox message:', error);
    const status = error instanceof MailboxConfigurationError ? 503 : 502;
    return NextResponse.json(
      {
        error: status === 503
          ? error.message
          : 'Unable to read this message. Check IMAP_HOST, IMAP_PORT, and mailbox credentials.',
      },
      { status }
    );
  }
}
