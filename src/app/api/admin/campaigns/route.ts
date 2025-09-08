import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'src', 'app', 'data', 'admin-campaigns.json');

type Campaign = {
  id: string;
  projectName: string;
  tierId: 'paddle' | 'motor' | 'helicopter';
  startDate: string; // ISO date
  endDate: string;   // ISO date
  notes?: string;
  createdAt: string; // ISO
};

async function readAll(): Promise<Campaign[]> {
  try {
    const content = await fs.readFile(FILE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function writeAll(data: Campaign[]) {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const c = await cookies();
  const isAuthed = c.get('admin_auth')?.value === '1';
  if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await readAll();
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const c = await cookies();
  const isAuthed = c.get('admin_auth')?.value === '1';
  if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectName, tierId, startDate, notes } = await req.json();
  if (!projectName || !tierId || !startDate) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Determine endDate based on tier
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return NextResponse.json({ error: 'Invalid startDate' }, { status: 400 });
  const end = new Date(start);
  if (tierId === 'paddle') {
    end.setDate(end.getDate() + 7);
  } else if (tierId === 'motor') {
    end.setMonth(end.getMonth() + 1);
  } else if (tierId === 'helicopter') {
    end.setMonth(end.getMonth() + 3);
  }

  const all = await readAll();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const createdAt = new Date().toISOString();
  const record: Campaign = { id, projectName, tierId, startDate: start.toISOString(), endDate: end.toISOString(), notes, createdAt };
  all.unshift(record);
  await writeAll(all);
  return NextResponse.json({ data: all, record });
}
