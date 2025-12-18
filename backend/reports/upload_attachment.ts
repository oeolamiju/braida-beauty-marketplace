import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { reportAttachments } from "./storage";
import { validateFileUpload, PRESETS } from "../shared/file_validation";

export interface UploadAttachmentRequest {
  fileName: string;
  contentType: string;
  fileData: string;
}

export interface UploadAttachmentResponse {
  url: string;
}

export const uploadAttachment = api(
  { method: "POST", path: "/reports/upload-attachment", expose: true, auth: true },
  async (req: UploadAttachmentRequest): Promise<UploadAttachmentResponse> => {
    const auth = getAuthData()!;

    const buffer = validateFileUpload(req.fileData, req.contentType, PRESETS.DOCUMENT_5MB);

    const fileName = `${auth.userID}/${Date.now()}-${req.fileName}`;

    await reportAttachments.upload(fileName, buffer, {
      contentType: req.contentType,
    });

    const url = reportAttachments.publicUrl(fileName);
    return { url };
  }
);
