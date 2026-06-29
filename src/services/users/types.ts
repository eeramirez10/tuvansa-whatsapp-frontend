import type { User } from "../../interfaces/user.interface";

export interface UserApiResponse {
  users: UserApi[];
}

export interface UserApi {
  id: string;
  name: string;
  lastname: string;
  username: string;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  allowWhatsappAssistant?: boolean;
  createdAt: string;
  updatedAt: string;
  branch?: {
    id: string;
    name: string;
    address?: string | null;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  branches?: Array<{
    id: string;
    name: string;
    address?: string | null;
    createdAt?: string;
    updatedAt?: string;
  }>;
}

export interface NotificationUserSummary {
  id: string;
  name: string;
  lastname: string;
  role: string;
  branchId?: string | null;
  phone?: string | null;
  email: string;
}

export interface NotificationSetting {
  id: string;
  userId: string;
  event: string;
  channel: string;
  template: string;
  scope: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  user?: NotificationUserSummary;
}

export interface NotificationSettingsResponse {
  settings: NotificationSetting[];
}

export interface UpsertNotificationSettingPayload {
  userId: string;
  event: string;
  channel: string;
  template: string;
  scope: string;
  enabled: boolean;
}

export interface UpsertNotificationSettingResponse {
  setting: NotificationSetting;
}

export interface NotificationTestPayload {
  userId: string;
  event: string;
  channel: string;
  template: string;
}

export interface NotificationTestsPayload {
  enabledOnly?: boolean;
  channel?: string;
}

export interface NotificationTestResult {
  userId: string;
  userName: string;
  template: string;
  event: string;
  channel: string;
  phone?: string;
  status: "SENT" | "FAILED" | "SKIPPED";
  message: string;
  providerMessageSid?: string;
  sentAt: string;
}

export interface NotificationTestResponse {
  result: NotificationTestResult;
}

export interface NotificationTestsResponse {
  results: NotificationTestResult[];
  summary: {
    total: number;
    sent: number;
    failed: number;
    skipped: number;
  };
}

export interface WorkflowReminderConfigResponse {
  enabled: boolean;
}

export interface UpdateWorkflowReminderConfigPayload {
  enabled: boolean;
}

export interface BranchSummary {
  id: string;
  name: string;
  address?: string | null;
  managerId?: string | null;
  manager?: {
    id: string;
    name: string;
    lastname: string;
    username: string;
  } | null;
}

export interface CreateBranchPayload {
  name: string;
  address: string;
}

export interface CreateBranchResponse {
  id: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBranchPayload {
  name: string;
  address: string;
}

export interface UpdateBranchResponse {
  id: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignBranchManagerResponse {
  id: string;
  name: string;
  lastname: string;
  username: string;
  branchName: string;
}

export interface CreateUserPayload {
  name: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  branchId?: string;
  branchIds: string[];
  isActive: boolean;
  allowWhatsappAssistant: boolean;
}

export interface CreateUserResponse {
  token: string;
  user: Record<string, unknown>;
}

export interface UpdateUserPayload {
  name: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  branchId?: string;
  branchIds: string[];
  isActive: boolean;
  allowWhatsappAssistant: boolean;
  password?: string;
}

export interface UpdateUserResponse {
  user: UserApi;
}

export type UserView = User;
