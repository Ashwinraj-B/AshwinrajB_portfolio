import { supabase } from "@/integrations/supabase/client";

// Bucket names — must match the buckets created in
// supabase/migrations/20260808150000_certificates_and_media.sql
export const CERTIFICATES_BUCKET = "certificates";
export const MEDIA_BUCKET = "portfolio-media";

export const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const DOCUMENT_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

/**
 * Build a public URL for a stored object. Safe to call with an empty path
 * (returns ""), so callers can do `path ? getPublicUrl(...) : null` or just
 * check the returned string.
 */
export function getPublicUrl(bucket: string, path: string): string {
    if (!path) return "";
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}

export function validateFile(
    file: File,
    { maxSizeMB, allowedTypes }: { maxSizeMB: number; allowedTypes: string[] },
): void {
    if (!allowedTypes.includes(file.type)) {
        throw new Error(
            `Unsupported file type "${file.type || "unknown"}". Allowed: ${allowedTypes.join(", ")}`,
        );
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`File is too large (max ${maxSizeMB}MB).`);
    }
}

/** Uploads a file to `${bucket}/${folder}/<random>.<ext>` and returns the stored path. */
export async function uploadFile(bucket: string, folder: string, file: File): Promise<string> {
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true,
        cacheControl: "3600",
    });
    if (error) throw error;
    return path;
}

/** Best-effort delete — failures are swallowed since a missing file isn't worth surfacing. */
export async function removeFile(bucket: string, path: string): Promise<void> {
    if (!path) return;
    try {
        await supabase.storage.from(bucket).remove([path]);
    } catch {
        // Non-fatal: orphaned storage objects don't break the site.
    }
}