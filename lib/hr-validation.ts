import type { ContractType, EmployeeInput, EmployeeStatus } from "./hr-types";

const statuses: EmployeeStatus[] = ["Đang làm việc", "Thử việc", "Nghỉ phép", "Đã nghỉ việc"];
const contracts: ContractType[] = ["Không xác định thời hạn", "Xác định thời hạn", "Thử việc", "Cộng tác viên"];

export function parseEmployeeInput(value: unknown): EmployeeInput | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const required = ["employeeCode", "fullName", "email", "phone", "department", "jobTitle", "manager", "location", "joinDate", "status", "contractType"];
  if (required.some((key) => typeof item[key] !== "string" || !String(item[key]).trim())) return null;
  if (!statuses.includes(item.status as EmployeeStatus) || !contracts.includes(item.contractType as ContractType)) return null;
  return {
    employeeCode: String(item.employeeCode).trim().slice(0, 20), fullName: String(item.fullName).trim().slice(0, 120),
    email: String(item.email).trim().toLowerCase().slice(0, 160), phone: String(item.phone).trim().slice(0, 30),
    department: String(item.department).trim().slice(0, 80), jobTitle: String(item.jobTitle).trim().slice(0, 100),
    manager: String(item.manager).trim().slice(0, 120), location: String(item.location).trim().slice(0, 100),
    joinDate: String(item.joinDate), birthDate: item.birthDate ? String(item.birthDate) : undefined,
    status: item.status as EmployeeStatus, contractType: item.contractType as ContractType,
    contractEndDate: item.contractEndDate ? String(item.contractEndDate) : undefined,
  };
}
