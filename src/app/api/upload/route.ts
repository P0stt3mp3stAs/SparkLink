// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const user_id = formData.get('user_id') as string;

    if (!file || !user_id) {
      return NextResponse.json({ error: 'Missing file or user_id' }, { status: 400 });
    }

    // Auto-detect file type
    const mimeType = file.type;
    const [mainType, subType] = mimeType.split('/');

    // Decide folder based on file type
    let folder = 'files';
    if (mainType === 'video') folder = 'videos';
    else if (mainType === 'audio') folder = 'audios';
    else if (mainType === 'image') folder = 'images';

    // Limit size (100MB for all)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 100MB)' }, { status: 400 });
    }

    // Generate path
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || subType;
    const fileName = `${user_id}_${timestamp}.${ext}`;
    const filePath = `${folder}/${fileName}`;

    // Convert File → Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET!)
      .upload(filePath, uint8Array, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Public URL
    const { data: urlData } = supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET!)
      .getPublicUrl(uploadData.path);

    return NextResponse.json({ url: urlData.publicUrl }); // 👈 clean response
  } catch (err) {
    console.error('❌ Upload API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
