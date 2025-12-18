import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { APIError } from "encore.dev/api";
import { reviewPhotos } from "./storage";

interface UploadPhotoRequest {
  reviewId: number;
}

interface UploadPhotoResponse {
  uploadUrl: string;
  photoKey: string;
}

export const uploadPhoto = api(
  { method: "POST", path: "/reviews/:reviewId/photo/upload-url", expose: true, auth: true },
  async (req: UploadPhotoRequest): Promise<UploadPhotoResponse> => {
    const auth = getAuthData()!;

    const review = await db.queryRow<{
      id: number;
      client_id: string;
    }>`
      SELECT id, client_id
      FROM reviews
      WHERE id = ${req.reviewId}
    `;

    if (!review) {
      throw APIError.notFound("Review not found");
    }

    if (review.client_id !== auth.userID) {
      throw APIError.permissionDenied("You can only upload photos to your own reviews");
    }

    const photoKey = `review-${req.reviewId}-${Date.now()}.jpg`;

    const { url } = await reviewPhotos.signedUploadUrl(photoKey, {
      ttl: 3600,
    });

    return {
      uploadUrl: url,
      photoKey,
    };
  }
);

interface ConfirmPhotoRequest {
  reviewId: number;
  photoKey: string;
}

interface ConfirmPhotoResponse {
  url: string;
}

export const confirmPhoto = api(
  { method: "POST", path: "/reviews/:reviewId/photo/confirm", expose: true, auth: true },
  async (req: ConfirmPhotoRequest): Promise<ConfirmPhotoResponse> => {
    const auth = getAuthData()!;

    const review = await db.queryRow<{
      id: number;
      client_id: string;
      photo_url: string | null;
    }>`
      SELECT id, client_id, photo_url
      FROM reviews
      WHERE id = ${req.reviewId}
    `;

    if (!review) {
      throw APIError.notFound("Review not found");
    }

    if (review.client_id !== auth.userID) {
      throw APIError.permissionDenied("You can only modify your own reviews");
    }

    if (review.photo_url) {
      const oldKey = review.photo_url.split("/").pop();
      if (oldKey) {
        await reviewPhotos.remove(oldKey).catch(() => {});
      }
    }

    const url = reviewPhotos.publicUrl(req.photoKey);

    await db.exec`
      UPDATE reviews
      SET photo_url = ${url}, updated_at = NOW()
      WHERE id = ${req.reviewId}
    `;

    return { url };
  }
);
