import { NextRequest, NextResponse } from 'next/server';
import { checkContactRateLimit } from '@/lib/contactRateLimit';
import { getCollection } from '@/lib/mongodb';

const SERVICES: Record<string, { name: string; price: string }> = {
  'executive-podcast': { name: 'Executive Podcast Interview', price: '$3,500' },
  'full-media': { name: 'Full Media Package', price: '$8,500' },
  'live-roadshows': { name: 'Live Roadshows', price: 'From $20,000' },
  'national-tv': { name: 'National TV Campaign', price: '$80K-$150K+' },
  'custom-media-campaign': { name: 'Custom Media Campaign', price: 'Custom proposal' },
};

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const parsedBody = await request.json();
    if (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
      return NextResponse.json({ error: 'Please submit a valid inquiry.' }, { status: 400 });
    }
    body = parsedBody as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Please submit a valid inquiry.' }, { status: 400 });
  }

  try {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const companyName = typeof body.companyName === 'string' ? body.companyName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const city = typeof body.city === 'string' ? body.city.trim() : '';
    const state = typeof body.state === 'string' ? body.state.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const serviceId = typeof body.serviceId === 'string' ? body.serviceId : '';
    const service = Object.hasOwn(SERVICES, serviceId) ? SERVICES[serviceId] : null;

    if (!name || !companyName || !email || !city || !state || !serviceId) {
      return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 });
    }
    if (
      name.length > 120 ||
      companyName.length > 160 ||
      email.length > 254 ||
      city.length > 100 ||
      state.length > 100 ||
      message.length > 2000 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !service
    ) {
      return NextResponse.json(
        { error: 'Please check the information you entered.' },
        { status: 400 }
      );
    }

    const clientIp =
      request.headers.get('x-real-ip')?.trim() || request.headers.get('cf-connecting-ip')?.trim();
    if (!clientIp) {
      return NextResponse.json(
        { error: 'Unable to verify request origin. Please try again later.' },
        { status: 503 }
      );
    }

    const rateLimit = await checkContactRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      );
    }

    const result = await (
      await getCollection('pricing_inquiries')
    ).insertOne({
      name,
      companyName,
      email,
      city,
      state,
      message,
      serviceId,
      serviceName: service.name,
      price: service.price,
      status: 'new',
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Pricing inquiry submission failed:', error);
    return NextResponse.json(
      { error: 'Could not submit your inquiry. Please try again later.' },
      { status: 500 }
    );
  }
}
