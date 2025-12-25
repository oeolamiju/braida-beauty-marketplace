import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

interface DeleteSafetyResourceRequest {
  id: string;
}

interface DeleteSafetyResourceResponse {
  success: boolean;
}

export const deleteSafetyResource = api(
  { method: "DELETE", path: "/admin/content/safety-resources/:id", auth: true, expose: true },
  async ({ id }: DeleteSafetyResourceRequest): Promise<DeleteSafetyResourceResponse> => {
    const auth = getAuthData();
    if (!auth || auth.role?.toUpperCase() !== "ADMIN") {
      throw { code: "permission_denied", message: "Admin access required" };
    }

    await db.exec`DELETE FROM safety_resources WHERE id = ${id}`;

    return { success: true };
  }
);
