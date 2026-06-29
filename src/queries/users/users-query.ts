import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignBranchManager,
  createBranch,
  deleteNotificationSetting,
  createUser,
  getBranchOptions,
  getNotificationSettings,
  getWorkflowReminderConfig,
  getUsers,
  sendNotificationTest,
  sendNotificationTests,
  updateBranch,
  updateWorkflowReminderConfig,
  updateUser,
  upsertNotificationSetting
} from "../../services/users/api";
import type {
  CreateBranchPayload,
  CreateUserPayload,
  NotificationTestPayload,
  NotificationTestsPayload,
  UpdateWorkflowReminderConfigPayload,
  UpdateBranchPayload,
  UpdateUserPayload,
  UpsertNotificationSettingPayload
} from "../../services/users/types";

export const usersKeys = {
  all: ["users"] as const,
  list: () => [...usersKeys.all, "list"] as const,
  notificationSettings: (userId?: string) =>
    [...usersKeys.all, "notification-settings", { userId: userId ?? "" }] as const,
  branches: () => [...usersKeys.all, "branches"] as const,
  workflowReminderConfig: () => [...usersKeys.all, "workflow-reminder-config"] as const
};

export const useUsers = () => {
  return useQuery({
    queryKey: usersKeys.list(),
    queryFn: getUsers
  });
};

export const useNotificationSettings = (userId?: string, enabled = true) => {
  return useQuery({
    queryKey: usersKeys.notificationSettings(userId),
    queryFn: () => getNotificationSettings(userId),
    enabled
  });
};

export const useBranchOptions = () => {
  return useQuery({
    queryKey: usersKeys.branches(),
    queryFn: getBranchOptions
  });
};

export const useWorkflowReminderConfig = (enabled = true) => {
  return useQuery({
    queryKey: usersKeys.workflowReminderConfig(),
    queryFn: getWorkflowReminderConfig,
    enabled
  });
};

export const useUpsertNotificationSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertNotificationSettingPayload) => upsertNotificationSetting(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.notificationSettings() });
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
    }
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
    }
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserPayload }) =>
      updateUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
      queryClient.invalidateQueries({ queryKey: usersKeys.notificationSettings() });
    }
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBranchPayload) => createBranch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.branches() });
    }
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, payload }: { branchId: string; payload: UpdateBranchPayload }) =>
      updateBranch(branchId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.branches() });
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
    }
  });
};

export const useAssignBranchManager = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, managerId }: { branchId: string; managerId: string }) =>
      assignBranchManager(branchId, managerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.branches() });
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
    }
  });
};

export const useSendNotificationTest = () => {
  return useMutation({
    mutationFn: (payload: NotificationTestPayload) => sendNotificationTest(payload)
  });
};

export const useSendNotificationTests = () => {
  return useMutation({
    mutationFn: (payload?: NotificationTestsPayload) => sendNotificationTests(payload)
  });
};

export const useUpdateWorkflowReminderConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateWorkflowReminderConfigPayload) => updateWorkflowReminderConfig(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.workflowReminderConfig() });
    }
  });
};


export const useDeleteNotificationSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settingId: string) => deleteNotificationSetting(settingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.notificationSettings() });
      queryClient.invalidateQueries({ queryKey: usersKeys.list() });
    }
  });
};
