import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { portfolioImages } from "./storage";

export interface UploadPortfolioImageResponse {
  uploadUrl: string;
  imageId: string;
}

export const uploadPortfolioImage = api(
  { method: "POST", path: "/profiles/portfolio/upload-url", expose: true, auth: true },
  async (): Promise<UploadPortfolioImageResponse> => {
    const auth = getAuthData()!;

    const imageId = `${auth.userID}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    
    const { url } = await portfolioImages.signedUploadUrl(imageId, {
      ttl: 3600,
    });

    return {
      uploadUrl: url,
      imageId,
    };
  }
);
