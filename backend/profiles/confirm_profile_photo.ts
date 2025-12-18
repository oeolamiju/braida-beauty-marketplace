import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { profilePhotos } from "./storage";

export interface ConfirmProfilePhotoRequest {
  photoId: string;
}

export interface ConfirmProfilePhotoResponse {
  url: string;
}

export const confirmProfilePhoto = api(
  { method: "POST", path: "/profiles/photo/confirm", expose: true, auth: true },
  async (req: ConfirmProfilePhotoRequest): Promise<ConfirmProfilePhotoResponse> => {
    const auth = getAuthData()!;

    const attrs = await profilePhotos.attrs(req.photoId);
    
    if (!attrs) {
      throw APIError.notFound("Photo not found");
    }

    const url = await profilePhotos.publicUrl(req.photoId);

    return { url };
  }
);
