import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
    const jsonDirectory = path.join(process.cwd(), 'public');
    const fileContents = await fs.readFile(path.join(jsonDirectory, 'financial.json'), 'utf8');
    return Response.json({ data: JSON.parse(fileContents) })
}