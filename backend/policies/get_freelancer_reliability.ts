import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import { getFreelancerCancellationStats } from "./policy_service";
import type { FreelancerCancellationStats } from "./types";

export interface GetFreelancerReliabilityRequest {
  freelancerId?: string;
}

export interface GetFreelancerReliabilityResponse {
  stats: FreelancerCancellationStats;
}

export const getFreelancerReliability = api<GetFreelancerReliabilityRequest, GetFreelancerReliabilityResponse>(
  { auth: true, expose: true, method: "GET", path: "/policies/reliability/freelancer" },
  async (req) => {
    const auth = getAuthData()! as AuthData;
    
    const freelancerId = req.freelancerId || auth.userID;
    
    if (freelancerId !== auth.userID && auth.role !== 'ADMIN') {
      throw APIError.permissionDenied("you can only view your own reliability stats");
    }

    const stats = await getFreelancerCancellationStats(freelancerId);
    
    return { stats };
  }
);
