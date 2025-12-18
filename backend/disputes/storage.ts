import { Bucket } from "encore.dev/storage/objects";

export const disputeAttachmentsBucket = new Bucket("dispute-attachments", {
  versioned: false,
});
