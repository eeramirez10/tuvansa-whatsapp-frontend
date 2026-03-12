import type { UserView, UserApi } from "./types";

const toBranchOffice = (branch: {
  id: string;
  name: string;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
}) => ({
  id: branch.id,
  name: branch.name,
  address: branch.address ?? "",
  createdAt: branch.createdAt ?? "",
  updatedAt: branch.updatedAt ?? ""
});

export const userApiToView = (user: UserApi): UserView => {
  const mappedBranches = Array.isArray(user.branches)
    ? user.branches.map(toBranchOffice)
    : [];

  const primaryBranch = user.branch ? toBranchOffice(user.branch) : null;
  const branchOffices = [
    ...(primaryBranch ? [primaryBranch] : []),
    ...mappedBranches
  ].filter((branch, index, branches) => branches.findIndex((item) => item.id === branch.id) === index);

  return {
    id: user.id,
    name: user.name,
    lastname: user.lastname,
    username: user.username,
    email: user.email,
    phone: user.phone ?? "",
    role: user.role,
    isActive: user.isActive,
    allowWhatsappAssistant: Boolean(user.allowWhatsappAssistant),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    branchOffice: branchOffices[0] ?? null,
    branchOffices
  }
};
