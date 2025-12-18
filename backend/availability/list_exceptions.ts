import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { requireVerifiedFreelancer } from "../auth/middleware";
import db from "../db";
import type { AvailabilityException } from "./types";

export interface ListExceptionsRequest {
  startDate?: string;
  endDate?: string;
}

export interface ListExceptionsResponse {
  exceptions: AvailabilityException[];
}

export const listExceptions = api<ListExceptionsRequest, ListExceptionsResponse>(
  { auth: true, expose: true, method: "GET", path: "/availability/exceptions" },
  async (req) => {
    requireVerifiedFreelancer();
    const auth = getAuthData()! as AuthData;

    let exceptionsIter;
    if (req.startDate && req.endDate) {
      exceptionsIter = db.query<{
        id: number;
        start_datetime: Date;
        end_datetime: Date;
        type: string;
      }>`
        SELECT id, start_datetime, end_datetime, type
        FROM availability_exceptions
        WHERE freelancer_id = ${auth.userID}
          AND start_datetime < ${req.endDate}
          AND end_datetime > ${req.startDate}
        ORDER BY start_datetime
      `;
    } else {
      exceptionsIter = db.query<{
        id: number;
        start_datetime: Date;
        end_datetime: Date;
        type: string;
      }>`
        SELECT id, start_datetime, end_datetime, type
        FROM availability_exceptions
        WHERE freelancer_id = ${auth.userID}
        ORDER BY start_datetime
      `;
    }

    const exceptions = [];
    for await (const e of exceptionsIter) {
      exceptions.push({
        id: e.id,
        startDatetime: e.start_datetime.toISOString(),
        endDatetime: e.end_datetime.toISOString(),
        type: e.type as 'blocked' | 'extra',
      });
    }

    return { exceptions };
  }
);
