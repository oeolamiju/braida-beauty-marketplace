import { Bucket } from "encore.dev/storage/objects";

export const reviewPhotos = new Bucket("review-photos", {
  versioned: false,
  public: true,
});
