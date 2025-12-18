export interface FreelancerProfile {
  userId: string;
  displayName: string;
  bio: string | null;
  profilePhotoUrl: string | null;
  locationArea: string;
  postcode: string;
  travelRadiusMiles: number;
  categories: string[];
  verificationStatus: string;
}
