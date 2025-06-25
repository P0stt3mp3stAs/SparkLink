// app/api/upload-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '@/lib/s3';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get('fileName');
  const fileType = searchParams.get('fileType');

  if (!fileName || !fileType) {
    return NextResponse.json({ error: 'Missing fileName or fileType' }, { status: 400 });
  }

  const command = new PutObjectCommand({
    Bucket: 'sparklink-profile-pics',
    Key: `profile-images/${Date.now()}-${fileName}`,
    ContentType: fileType,
    ACL: 'public-read', // ✅ This allows the header from the client
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 });

  return NextResponse.json({ url });
}