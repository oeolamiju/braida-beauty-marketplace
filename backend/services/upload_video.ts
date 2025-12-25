import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { requireFreelancer } from "../auth/middleware";
import db from "../db";
import { APIError } from "encore.dev/api";
import { Bucket } from "encore.dev/storage/objects";
import { validateFileUpload, PRESETS } from "../shared/file_validation";

// Create bucket for service videos
export const serviceVideos = new Bucket("service-videos", {
  public: true,
});

export interface UploadVideoRequest {
  serviceId: number;
  videoData: string; // base64 encoded
  mimeType: string;
  title?: string;
  thumbnailData?: string; // base64 encoded thumbnail
}

export interface UploadVideoResponse {
  id: number;
  videoUrl: string;
  thumbnailUrl?: string;
}

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export const uploadVideo = api<UploadVideoRequest, UploadVideoResponse>(
  { method: "POST", path: "/services/:serviceId/videos", expose: true, auth: true },
  async (req): Promise<UploadVideoResponse> => {
    requireFreelancer();
    const auth = getAuthData()!;

    // Verify service ownership
    const service = await db.queryRow<{ stylist_id: string }>`
      SELECT stylist_id FROM services WHERE id = ${req.serviceId}
    `;

    if (!service) {
      throw APIError.notFound("Service not found");
    }

    if (service.stylist_id !== auth.userID) {
      throw APIError.permissionDenied("You can only upload videos to your own services");
    }

    // Check video count limit
    const videoCount = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM service_videos WHERE service_id = ${req.serviceId}
    `;

    if (videoCount && videoCount.count >= 3) {
      throw APIError.invalidArgument("Maximum 3 videos per service allowed");
    }

    // Validate video type
    if (!ALLOWED_VIDEO_TYPES.includes(req.mimeType)) {
      throw APIError.invalidArgument("Only MP4, WebM, and MOV video formats are allowed");
    }

    // Decode and validate video
    const videoBuffer = Buffer.from(req.videoData, "base64");
    
    if (videoBuffer.length > MAX_VIDEO_SIZE) {
      throw APIError.invalidArgument("Video file must be under 50MB");
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = req.mimeType === "video/mp4" ? "mp4" : req.mimeType === "video/webm" ? "webm" : "mov";
    const videoPath = `${auth.userID}/${req.serviceId}/${timestamp}.${extension}`;

    // Upload video
    await serviceVideos.upload(videoPath, videoBuffer, {
      contentType: req.mimeType,
    });

    const videoUrl = serviceVideos.publicUrl(videoPath);

    // Handle thumbnail if provided
    let thumbnailUrl: string | undefined;
    if (req.thumbnailData) {
      const thumbBuffer = validateFileUpload(req.thumbnailData, "image/jpeg", PRESETS.IMAGE_5MB);
      const thumbPath = `${auth.userID}/${req.serviceId}/${timestamp}_thumb.jpg`;
      
      await serviceVideos.upload(thumbPath, thumbBuffer, {
        contentType: "image/jpeg",
      });
      
      thumbnailUrl = serviceVideos.publicUrl(thumbPath);
    }

    // Store in database
    const result = await db.queryRow<{ id: number }>`
      INSERT INTO service_videos (service_id, video_url, thumbnail_url, title, duration_seconds)
      VALUES (${req.serviceId}, ${videoUrl}, ${thumbnailUrl || null}, ${req.title || null}, NULL)
      RETURNING id
    `;

    return {
      id: result!.id,
      videoUrl,
      thumbnailUrl,
    };
  }
);

export interface ListVideosRequest {
  serviceId: number;
}

export interface ServiceVideo {
  id: number;
  videoUrl: string;
  thumbnailUrl: string | null;
  title: string | null;
  durationSeconds: number | null;
  displayOrder: number;
}

export const listVideos = api<ListVideosRequest, { videos: ServiceVideo[] }>(
  { method: "GET", path: "/services/:serviceId/videos", expose: true },
  async (req): Promise<{ videos: ServiceVideo[] }> => {
    const videosGen = db.query<ServiceVideo>`
      SELECT 
        id,
        video_url as "videoUrl",
        thumbnail_url as "thumbnailUrl",
        title,
        duration_seconds as "durationSeconds",
        display_order as "displayOrder"
      FROM service_videos
      WHERE service_id = ${req.serviceId}
      ORDER BY display_order
    `;

    const videos: ServiceVideo[] = [];
    for await (const video of videosGen) {
      videos.push(video);
    }

    return { videos };
  }
);

export const deleteVideo = api(
  { method: "DELETE", path: "/services/:serviceId/videos/:videoId", expose: true, auth: true },
  async (req: { serviceId: number; videoId: number }): Promise<{ success: boolean }> => {
    requireFreelancer();
    const auth = getAuthData()!;

    // Verify service ownership
    const service = await db.queryRow<{ stylist_id: string }>`
      SELECT stylist_id FROM services WHERE id = ${req.serviceId}
    `;

    if (!service) {
      throw APIError.notFound("Service not found");
    }

    if (service.stylist_id !== auth.userID) {
      throw APIError.permissionDenied("You can only delete videos from your own services");
    }

    await db.exec`
      DELETE FROM service_videos
      WHERE id = ${req.videoId} AND service_id = ${req.serviceId}
    `;

    return { success: true };
  }
);

