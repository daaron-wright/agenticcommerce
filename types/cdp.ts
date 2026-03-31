/**
 * CDP Core Types
 */

export interface Customer {
  id: string;
  identities: CustomerIdentity[];
  consent: ConsentRecord[];
  profile: CustomerProfile;
}

export interface CustomerIdentity {
  type: "email" | "phone" | "cookie" | "device" | "crm_id";
  value: string;
  verified: boolean;
  lastSeen: string;
}

export interface ConsentRecord {
  purpose: string;
  granted: boolean;
  timestamp: string;
  expiresAt?: string;
  source: string;
}

export interface CustomerProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  preferences?: Record<string, any>;
  segments?: string[];
  lastContact?: string;
}

export interface CaseRecord {
  id: string;
  customerId: string;
  type: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  resolution?: string;
}

export interface NextBestAction {
  id: string;
  customerId: string;
  action: string;
  channel: "email" | "sms" | "push" | "web" | "call";
  priority: number;
  reasoning: string;
  expires: string;
  metadata?: Record<string, any>;
}
