import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

export interface DeletePackageRequest {
  id: number;
}

export interface DeletePackageResponse {
  success: boolean;
}

export const deletePackage = api<DeletePackageRequest, DeletePackageResponse>(
  { method: "DELETE", path: "/packages/:id", expose: true, auth: true },
  async (req): Promise<DeletePackageResponse> => {
    const auth = getAuthData()!;

    // Verify package exists and belongs to user
    const pkg = await db.queryRow<{ freelancer_id: string }>`
      SELECT freelancer_id FROM service_packages WHERE id = ${req.id}
    `;

    if (!pkg) {
      throw APIError.notFound("Package not found");
    }

    if (pkg.freelancer_id !== auth.userID) {
      throw APIError.permissionDenied("You can only delete your own packages");
    }

    // Delete package (cascades to package_services)
    await db.exec`
      DELETE FROM service_packages WHERE id = ${req.id}
    `;

    return { success: true };
  }
);

