export type EmployeeStatus = "Đang làm việc" | "Thử việc" | "Nghỉ phép" | "Đã nghỉ việc";
export type ContractType = "Không xác định thời hạn" | "Xác định thời hạn" | "Thử việc" | "Cộng tác viên";

export type Employee = {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  jobTitle: string;
  manager: string;
  location: string;
  joinDate: string;
  birthDate?: string;
  status: EmployeeStatus;
  contractType: ContractType;
  contractEndDate?: string;
  updatedAt: string;
};

export type EmployeeInput = Omit<Employee, "id" | "updatedAt">;
