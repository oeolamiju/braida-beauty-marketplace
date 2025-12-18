import { Bucket } from "encore.dev/storage/objects";

export const styleImages = new Bucket("style-images", {
  public: true,
});
