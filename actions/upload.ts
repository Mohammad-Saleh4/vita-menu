"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

const MENU_IMAGES_BUCKET = "menu-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user.id;
}

function extensionForType(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export async function uploadMenuItemPhoto(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: "You must be signed in." };
    }

    const restaurantId = String(formData.get("restaurantId") || "");
    if (!restaurantId) {
      return { success: false, error: "Restaurant not found." };
    }

    const restaurant = await prisma.restaurant.findFirst({
      where: { id: restaurantId, userId },
    });
    if (!restaurant) {
      return { success: false, error: "Restaurant not found or access denied." };
    }

    const file = formData.get("photo");
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: "Please choose a photo." };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "Photo is too large. Maximum size is 5 MB.",
      };
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return {
        success: false,
        error: "Please choose a JPG, PNG, or WebP photo.",
      };
    }

    const ext = extensionForType(file.type);
    const path = `${restaurantId}/${crypto.randomUUID()}.${ext}`;

    const supabase = await createClient();
    const { error: uploadError } = await supabase.storage
      .from(MENU_IMAGES_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      return {
        success: false,
        error: uploadError.message || "Failed to upload photo.",
      };
    }

    const { data } = supabase.storage
      .from(MENU_IMAGES_BUCKET)
      .getPublicUrl(path);

    return { success: true, data: { url: data.publicUrl } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload photo.",
    };
  }
}
