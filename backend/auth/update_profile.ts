import { api, APIError } from "encore.dev/api";
import { db } from "../db/database";
import { authHandler, getCurrentUser } from "./auth";

interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: string;
    isVerified: boolean;
  };
}

export const updateProfile = api(
  {
    method: "PUT",
    path: "/auth/profile",
    expose: true,
    auth: true,
  },
  async (req: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const user = getCurrentUser();
    if (!user) {
      throw APIError.unauthenticated("You must be logged in to update your profile");
    }

    // Validate inputs
    if (req.firstName !== undefined && req.firstName.trim().length === 0) {
      throw APIError.invalidArgument("First name cannot be empty");
    }
    if (req.lastName !== undefined && req.lastName.trim().length === 0) {
      throw APIError.invalidArgument("Last name cannot be empty");
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.firstName !== undefined) {
      updates.push(`first_name = $${paramIndex}`);
      values.push(req.firstName.trim());
      paramIndex++;
    }
    if (req.lastName !== undefined) {
      updates.push(`last_name = $${paramIndex}`);
      values.push(req.lastName.trim());
      paramIndex++;
    }
    if (req.phone !== undefined) {
      updates.push(`phone = $${paramIndex}`);
      values.push(req.phone.trim() || null);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    // Add updated_at timestamp
    updates.push(`updated_at = NOW()`);

    // Add user ID for WHERE clause
    values.push(user.id);

    // Execute update
    const updatedUser = await db.queryRow<{
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone: string | null;
      role: string;
      is_verified: boolean;
    }>`
      UPDATE users
      SET ${db.dangerouslyInjectRaw(updates.join(", "))}
      WHERE id = $${paramIndex}
      RETURNING id, email, first_name, last_name, phone, role, is_verified
    `;

    if (!updatedUser) {
      throw APIError.notFound("User not found");
    }

    return {
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isVerified: updatedUser.is_verified,
      },
    };
  }
);

