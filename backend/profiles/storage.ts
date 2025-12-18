import { Bucket } from "encore.dev/storage/objects";

export const portfolioImages = new Bucket("portfolio-images", {
  public: true,
});

export const profilePhotos = new Bucket("profile-photos", {
  public: true,
});

export const serviceImages = new Bucket("service-images", {
  public: true,
});
