import "server-only";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Employee, EmployeeInput } from "./hr-types";

const dataPath = path.join(process.cwd(), "data", "hr-employees.json");

export async function listEmployees(): Promise<Employee[]> {
  const contents = await readFile(dataPath, "utf8");
  return JSON.parse(contents) as Employee[];
}

async function saveEmployees(employees: Employee[]) {
  const temporaryPath = `${dataPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(employees, null, 2)}\n`, "utf8");
  await rename(temporaryPath, dataPath);
}

export async function createEmployee(input: EmployeeInput): Promise<Employee> {
  const employees = await listEmployees();
  if (employees.some((item) => item.employeeCode.toLowerCase() === input.employeeCode.toLowerCase())) throw new Error("Mã nhân viên đã tồn tại");
  if (employees.some((item) => item.email.toLowerCase() === input.email.toLowerCase())) throw new Error("Email đã tồn tại");
  const employee: Employee = { ...input, id: crypto.randomUUID(), updatedAt: new Date().toISOString() };
  await saveEmployees([employee, ...employees]);
  return employee;
}

export async function updateEmployee(id: string, input: EmployeeInput): Promise<Employee> {
  const employees = await listEmployees();
  const index = employees.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("Không tìm thấy nhân viên");
  if (employees.some((item) => item.id !== id && item.employeeCode.toLowerCase() === input.employeeCode.toLowerCase())) throw new Error("Mã nhân viên đã tồn tại");
  if (employees.some((item) => item.id !== id && item.email.toLowerCase() === input.email.toLowerCase())) throw new Error("Email đã tồn tại");
  const employee: Employee = { ...input, id, updatedAt: new Date().toISOString() };
  employees[index] = employee;
  await saveEmployees(employees);
  return employee;
}
