import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'content', 'team', 'team.json');

function normalizePath(p?: string) {
  if (!p || typeof p !== 'string') return p;
  if (p.startsWith('http') || p.startsWith('/')) return p;
  return `/${p}`;
}

function normalizeTeamContent(data: any) {
  if (!data || typeof data !== 'object') return data;
  if (data.hero) {
    data.hero.backgroundImage = normalizePath(data.hero.backgroundImage);
  }
  if (Array.isArray(data.members)) {
    data.members = data.members.map((m: any) => ({
      ...m,
      image: normalizePath(m?.image),
    }));
  }
  if (data.seo) {
    data.seo.ogImage = normalizePath(data.seo.ogImage);
  }
  return data;
}

export async function GET() {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      return NextResponse.json({ error: 'Team content not found' }, { status: 404 });
    }

    const content = fs.readFileSync(FILE_PATH, 'utf8');
    const raw = JSON.parse(content);
    const data = normalizeTeamContent(raw);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching team content:', error);
    return NextResponse.json({ error: 'Failed to fetch team content' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const normalized = normalizeTeamContent(body);
    fs.writeFileSync(FILE_PATH, JSON.stringify(normalized, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating team content:', error);
    return NextResponse.json({ error: 'Failed to update team content' }, { status: 500 });
  }
}
