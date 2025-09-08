import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'src', 'app', 'data', 'admin-profiles.json');

type Profile = {
  id: string;
  projectName: string;
  contactEmail?: string;
  website?: string;
  paidTier?: 'paddle' | 'motor' | 'helicopter' | null;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

async function readAll(): Promise<Profile[]> {
  try {
    const content = await fs.readFile(FILE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function writeAll(data: Profile[]) {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const c = await cookies();
  if (c.get('admin_auth')?.value !== '1') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await readAll();
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const c = await cookies();
  if (c.get('admin_auth')?.value !== '1') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectName, contactEmail, website, paidTier, status, notes } = await req.json();
  if (!projectName) return NextResponse.json({ error: 'projectName required' }, { status: 400 });

  const nowIso = new Date().toISOString();
  const all = await readAll();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const record: Profile = {
    id,
    projectName,
    contactEmail,
    website,
    paidTier: paidTier ?? null,
    status: status || 'active',
    notes,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  all.unshift(record);
  await writeAll(all);
  return NextResponse.json({ data: all, record });
}

export async function PUT(req: NextRequest) {
  const c = await cookies();
  if (c.get('admin_auth')?.value !== '1') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, ...patch } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const all = await readAll();
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const nowIso = new Date().toISOString();
  all[idx] = { ...all[idx], ...patch, updatedAt: nowIso } as Profile;
  await writeAll(all);
  return NextResponse.json({ data: all, record: all[idx] });
}

export async function DELETE(req: NextRequest) {
  const c = await cookies();
  if (c.get('admin_auth')?.value !== '1') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const all = await readAll();
  const next = all.filter(p => p.id !== id);
  await writeAll(next);
  return NextResponse.json({ data: next });
}
