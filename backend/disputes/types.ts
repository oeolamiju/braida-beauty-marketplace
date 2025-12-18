export type DisputeCategory = "no-show" | "quality" | "safety" | "other";
export type DisputeStatus = "new" | "in_review" | "resolved";
export type ResolutionType = "full_refund" | "partial_refund" | "release_to_freelancer" | "no_action";

export interface Dispute {
  id: string;
  booking_id: string;
  raised_by: string;
  category: DisputeCategory;
  description: string;
  status: DisputeStatus;
  resolution_type?: ResolutionType;
  resolution_amount?: number;
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DisputeAttachment {
  id: string;
  dispute_id: string;
  file_key: string;
  file_name: string;
  file_size: number;
  content_type: string;
  uploaded_at: Date;
}

export interface DisputeNote {
  id: string;
  dispute_id: string;
  admin_id: string;
  note: string;
  created_at: Date;
}

export interface DisputeAuditLog {
  id: string;
  dispute_id: string;
  action: string;
  performed_by: string;
  details: Record<string, any>;
  created_at: Date;
}

export interface DisputeWithDetails extends Dispute {
  attachments: DisputeAttachment[];
  notes: DisputeNote[];
  raised_by_name: string;
  raised_by_email: string;
  resolved_by_name?: string;
}

export interface DisputeBookingTimeline {
  booking_id: string;
  client_name: string;
  freelancer_name: string;
  service_name: string;
  scheduled_start: Date;
  scheduled_end: Date;
  booking_status: string;
  payment_status?: string;
  total_amount: number;
  dispute: DisputeWithDetails;
}
