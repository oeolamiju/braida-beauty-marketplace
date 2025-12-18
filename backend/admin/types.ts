export interface AdminActionLog {
  id: string;
  adminId: string;
  adminEmail?: string;
  actionType: string;
  targetType: string;
  targetId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

export interface ListAdminLogsRequest {
  adminId?: string;
  targetType?: string;
  targetId?: string;
  actionType?: string;
  limit?: number;
  offset?: number;
}

export interface ListAdminLogsResponse {
  logs: AdminActionLog[];
  total: number;
}

export interface UserListItem {
  id: string;
  email: string;
  fullName: string;
  role: string;
  suspended: boolean;
  suspensionReason?: string;
  suspendedAt?: Date;
  createdAt: Date;
  lastLoginAt?: Date;
  verificationStatus?: string;
  totalBookingsAsClient: number;
  totalBookingsAsFreelancer: number;
  totalReports: number;
  totalDisputes: number;
}

export interface ListUsersRequest {
  role?: string;
  suspended?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListUsersResponse {
  users: UserListItem[];
  total: number;
}

export interface UserDetailResponse {
  user: UserListItem;
  recentReports: any[];
  recentDisputes: any[];
  recentBookings: any[];
}

export interface SuspendUserRequest {
  userId: string;
  reason: string;
}

export interface UnsuspendUserRequest {
  userId: string;
}

export interface ServiceListItem {
  id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  title: string;
  category: string;
  active: boolean;
  deactivationReason?: string;
  deactivatedAt?: Date;
  basePrice: number;
  totalBookings: number;
  averageRating?: number;
  createdAt: Date;
}

export interface ListServicesRequest {
  category?: string;
  active?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListServicesResponse {
  services: ServiceListItem[];
  total: number;
}

export interface DeactivateServiceRequest {
  serviceId: string;
  reason: string;
}

export interface ReactivateServiceRequest {
  serviceId: string;
}

export interface BookingListItem {
  id: string;
  serviceId: string;
  serviceTitle: string;
  freelancerId: string;
  freelancerName: string;
  clientId: string;
  clientName: string;
  status: string;
  scheduledFor: Date;
  totalPrice: number;
  paymentStatus?: string;
  createdAt: Date;
}

export interface ListBookingsAdminRequest {
  status?: string;
  freelancerId?: string;
  clientId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListBookingsAdminResponse {
  bookings: BookingListItem[];
  total: number;
}

export interface BookingDetailAdminResponse {
  booking: BookingListItem & {
    address: string;
    notes?: string;
    cancelledAt?: Date;
    cancellationReason?: string;
    confirmedAt?: Date;
    completedAt?: Date;
  };
  payment?: {
    id: string;
    amount: number;
    status: string;
    escrowReleaseAt?: Date;
    refundedAmount?: number;
  };
  disputes: any[];
  reviews: any[];
}
