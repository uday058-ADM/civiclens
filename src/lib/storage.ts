import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Converts a base64 Data URL string to a Uint8Array / ArrayBuffer and detects content type
 */
function parseBase64(dataUrl: string): { data: Uint8Array; contentType: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  const contentType = match ? match[1] : 'image/jpeg';
  const base64String = match ? match[2] : dataUrl;

  if (typeof window !== 'undefined') {
    const binaryString = window.atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return { data: bytes, contentType };
  } else {
    const buffer = Buffer.from(base64String, 'base64');
    return { data: new Uint8Array(buffer), contentType };
  }
}

/**
 * Upload citizen hazard capture to Supabase Storage bucket 'hazard-images'
 * Path pattern: reports/${Date.now()}_${random}.jpg
 */
export async function uploadHazardImage(fileOrBase64: string | File): Promise<string> {
  // If Supabase is unconfigured, return original string or data URL gracefully
  if (!isSupabaseConfigured) {
    if (typeof fileOrBase64 === 'string') {
      return fileOrBase64;
    }
    // If it's a File, create an Object URL in browser
    if (typeof window !== 'undefined' && fileOrBase64 instanceof File) {
      return URL.createObjectURL(fileOrBase64);
    }
    return 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
  }

  try {
    const filename = `reports/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

    let fileBody: File | Uint8Array;
    let contentType = 'image/jpeg';

    if (typeof fileOrBase64 === 'string') {
      const parsed = parseBase64(fileOrBase64);
      fileBody = parsed.data;
      contentType = parsed.contentType;
    } else {
      fileBody = fileOrBase64;
      contentType = fileOrBase64.type || 'image/jpeg';
    }

    const { error: uploadError } = await supabase.storage
      .from('hazard-images')
      .upload(filename, fileBody, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase Storage upload warning:', uploadError.message);
      return typeof fileOrBase64 === 'string' ? fileOrBase64 : URL.createObjectURL(fileOrBase64);
    }

    const { data: publicUrlData } = supabase.storage
      .from('hazard-images')
      .getPublicUrl(filename);

    return publicUrlData.publicUrl;
  } catch (err: any) {
    console.warn('Supabase storage service caught error, using local fallback:', err?.message || err);
    return typeof fileOrBase64 === 'string' ? fileOrBase64 : URL.createObjectURL(fileOrBase64);
  }
}
