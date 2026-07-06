import { envs } from "../../config/envs";
import { deleteFetcher, fetcher, postFetcher, putFetcher } from "../../utils/fetcher";
import {
  type AssignBranchManagerResponse,
  type BranchSummary,
  type CreateBranchPayload,
  type CreateBranchResponse,
  type CreateUserPayload,
  type CreateUserResponse,
  type DeleteNotificationSettingResponse,
  type DeleteUserResponse,
  type NotificationSettingsResponse,
  type NotificationTestPayload,
  type NotificationTestResponse,
  type NotificationTestsPayload,
  type NotificationTestsResponse,
  type UpdateWorkflowReminderConfigPayload,
  type UpdateBranchPayload,
  type UpdateBranchResponse,
  type UpdateUserPayload,
  type UpdateUserResponse,
  type WorkflowReminderConfigResponse,
  type UpsertNotificationSettingPayload,
  type UpsertNotificationSettingResponse,
  type UserApiResponse
} from "./types";
import { userApiToView } from "./users.mapper";

export const getUsers = async (options?: { manageableOnly?: boolean }) => {
  const params = options?.manageableOnly ? '?manageableOnly=true' : '';
  const response = await fetcher<UserApiResponse>(`${envs.URL}/users${params}`);
  return response.users.map(userApiToView);
};

export const getNotificationSettings = async (userId?: string) => {
  const params = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const response = await fetcher<NotificationSettingsResponse>(
    `${envs.URL}/users/notification-settings${params}`
  );
  return response.settings;
};

export const upsertNotificationSetting = async (payload: UpsertNotificationSettingPayload) => {
  const data = await putFetcher<UpsertNotificationSettingResponse>(
    `${envs.URL}/users/notification-settings`,
    payload
  );
  return data.setting;
};

export const deleteNotificationSetting = async (settingId: string) => {
  return await deleteFetcher<DeleteNotificationSettingResponse>(
    `${envs.URL}/users/notification-settings/${settingId}`
  );
};

export const getBranchOptions = async () => {
  return await fetcher<BranchSummary[]>(`${envs.URL}/branchs`);
};

export const createUser = async (payload: CreateUserPayload) => {
  return await postFetcher<CreateUserResponse>(`${envs.URL}/auth/register`, payload);
};

export const updateUser = async (userId: string, payload: UpdateUserPayload) => {
  const response = await putFetcher<UpdateUserResponse>(`${envs.URL}/users/${userId}`, payload);
  return userApiToView(response.user);
};

export const deleteUser = async (userId: string) => {
  return await deleteFetcher<DeleteUserResponse>(`${envs.URL}/users/${userId}`);
};

export const createBranch = async (payload: CreateBranchPayload) => {
  return await postFetcher<CreateBranchResponse>(`${envs.URL}/branchs`, payload);
};

export const updateBranch = async (branchId: string, payload: UpdateBranchPayload) => {
  return await putFetcher<UpdateBranchResponse>(`${envs.URL}/branchs/${branchId}`, payload);
};

export const assignBranchManager = async (branchId: string, managerId: string) => {
  return await putFetcher<AssignBranchManagerResponse>(
    `${envs.URL}/branchs/${branchId}/assign-manager/${managerId}`,
    {}
  );
};

export const sendNotificationTest = async (payload: NotificationTestPayload) => {
  const response = await postFetcher<NotificationTestResponse>(
    `${envs.URL}/users/notification-settings/test`,
    payload
  );
  return response.result;
};

export const sendNotificationTests = async (payload: NotificationTestsPayload = { enabledOnly: true, channel: "WHATSAPP" }) => {
  return await postFetcher<NotificationTestsResponse>(
    `${envs.URL}/users/notification-settings/test-all`,
    payload
  );
};

export const getWorkflowReminderConfig = async () => {
  return await fetcher<WorkflowReminderConfigResponse>(
    `${envs.URL}/users/workflow-reminder-config`
  );
};

export const updateWorkflowReminderConfig = async (payload: UpdateWorkflowReminderConfigPayload) => {
  return await putFetcher<WorkflowReminderConfigResponse>(
    `${envs.URL}/users/workflow-reminder-config`,
    payload
  );
};
