import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { requireVerifiedFreelancer } from "../auth/middleware";
import db from "../db";
import type { AvailabilityException } from "./types";

export interface AddExceptionRequest {
  startDatetime: string;
  endDatetime: string;
  type: 'blocked' | 'extra';
}

export interface AddExceptionResponse {
  exception: AvailabilityException;
}

export const addException = api<AddExceptionRequest, AddExceptionResponse>(
  { auth: true, expose: true, method: "POST", path: "/availability/exceptions" },
  async (req) => {
    requireVerifiedFreelancer();
    const auth = getAuthData()! as AuthData;

    const startDate = new Date(req.startDatetime);
    const endDate = new Date(req.endDatetime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw APIError.invalidArgument("invalid datetime format");
    }

    if (endDate <= startDate) {
      throw APIError.invalidArgument("endDatetime must be after startDatetime");
    }

    const result = await db.queryRow<{
      id: number;
      start_datetime: Date;
      end_datetime: Date;
      type: string;
    }>`
      INSERT INTO availability_exceptions (freelancer_id, start_datetime, end_datetime, type)
      VALUES (${auth.userID}, ${req.startDatetime}, ${req.endDatetime}, ${req.type})
      RETURNING id, start_datetime, end_datetime, type
    `;

    if (!result) {
      throw APIError.internal("failed to create exception");
    }

    return {
      exception: {
        id: result.id,
        startDatetime: result.start_datetime.toISOString(),
        endDatetime: result.end_datetime.toISOString(),
        type: result.type as 'blocked' | 'extra',
      },
    };
  }
);
