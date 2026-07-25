import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'features.json');

export async function GET() {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const newFeatures = await request.json();
    
    // Ensure the data directory exists
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(dataFilePath, JSON.stringify(newFeatures, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
