import { supabase } from "@/integrations/supabase/client";
import { PHOTO_BUCKET, libraryUrl } from "./menu";

const MAX_MB = 8;

/**
 * Saves a picked photo into the library and returns the stored path (what gets
 * written to the menu item) plus an address for showing it back straight away.
 */
export async function uploadPhoto(file: File): Promise<{ path: string; url: string }> {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't a photo");
  if (file.size > MAX_MB * 1024 * 1024) throw new Error(`Photos must be under ${MAX_MB}MB`);

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 4) || "jpg";
  const path = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);

  return { path, url: libraryUrl(path) };
}
