import { Bucket } from "encore.dev/storage/objects";

export const reportAttachments = new Bucket("report-attachments", {
  public: true,
  versioned: false,
});
