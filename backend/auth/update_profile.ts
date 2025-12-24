import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import type { AuthData } from "./auth";

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
    const auth = getAuthData()! as AuthData;

    // Validate inputs
    if (req.firstName !== undefined && req.firstName.trim().length === 0) {
      throw APIError.invalidArgument("First name cannot be empty");
    }
    if (req.lastName !== undefined && req.lastName.trim().length === 0) {
      throw APIError.invalidArgument("Last name cannot be empty");
    }

    if (req.firstName === undefined && req.lastName === undefined && req.phone === undefined) {
      throw APIError.invalidArgument("No fields to update");
    }

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
      SET 
        first_name = COALESCE(${req.firstName?.trim() || null}, first_name),
        last_name = COALESCE(${req.lastName?.trim() || null}, last_name),
        phone = CASE WHEN ${req.phone !== undefined} THEN ${req.phone?.trim() || null} ELSE phone END,
        updated_at = NOW()
      WHERE id = ${auth.userID}
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

