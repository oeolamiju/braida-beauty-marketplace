import { Bucket } from "encore.dev/storage/objects";

export const verificationDocuments = new Bucket("verification-documents", {
  public: false,
  versioned: true,
});
