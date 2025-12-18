import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { profilePhotos } from "./storage";

export interface UploadProfilePhotoResponse {
  uploadUrl: string;
  photoId: string;
}

export const uploadProfilePhoto = api(
  { method: "POST", path: "/profiles/photo/upload-url", expose: true, auth: true },
  async (): Promise<UploadProfilePhotoResponse> => {
    const auth = getAuthData()!;

    const photoId = `${auth.userID}/profile-${Date.now()}.jpg`;
    
    const { url } = await profilePhotos.signedUploadUrl(photoId, {
      ttl: 3600,
    });

    return {
      uploadUrl: url,
      photoId,
    };
  }
);
