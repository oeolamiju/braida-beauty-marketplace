export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaDescription?: string;
  category: string;
  isPublished: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  lastEditedBy?: string;
}

export interface ContentVersion {
  id: string;
  pageId: string;
  version: number;
  title: string;
  content: string;
  editedBy?: string;
  createdAt: Date;
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SafetyResource {
  id: string;
  title: string;
  description: string;
  resourceType: string;
  url?: string;
  phoneNumber?: string;
  isEmergency: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
