export type AssetStatus = "Sẵn sàng" | "Đang sử dụng" | "Bảo trì" | "Mất/Hỏng" | "Đã thanh lý";
export type AssetCondition = "Mới" | "Tốt" | "Khá" | "Cần sửa chữa" | "Hỏng";
export type AssetCategory = "Thiết bị CNTT" | "Robot & linh kiện" | "Công cụ dụng cụ" | "Thiết bị đào tạo" | "Nội thất";
export type AssignmentEvent = {
  id: string;
  type: "Bàn giao" | "Thu hồi" | "Chuyển giao";
  documentNumber?: string;
  employeeId?: string;
  employeeName?: string;
  fromEmployeeId?: string;
  fromEmployeeName?: string;
  toEmployeeId?: string;
  toEmployeeName?: string;
  date: string;
  condition?: AssetCondition;
  accessories?: string;
  note?: string;
};

export type Asset = {
  id: string;
  assetCode: string;
  name: string;
  category: AssetCategory;
  serialNumber?: string;
  status: AssetStatus;
  condition: AssetCondition;
  location: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  assignedDate?: string;
  purchaseDate: string;
  purchasePrice: number;
  supplier: string;
  warrantyUntil?: string;
  nextMaintenance?: string;
  notes?: string;
  assignmentHistory: AssignmentEvent[];
  updatedAt: string;
};

export type AssetInput = Omit<Asset, "id" | "assignmentHistory" | "updatedAt" | "assignedEmployeeId" | "assignedEmployeeName" | "assignedDate">;

export type InventoryStatus = "Đang kiểm kê" | "Đã hoàn tất";
export type InventoryResult = "Chưa kiểm" | "Khớp" | "Sai vị trí" | "Sai người sử dụng" | "Hư hỏng" | "Không tìm thấy";

export type InventoryItem = {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  assetCategory?: AssetCategory;
  serialNumber?: string;
  expectedLocation: string;
  expectedEmployeeId?: string;
  expectedEmployeeName?: string;
  expectedCondition: AssetCondition;
  actualLocation?: string;
  actualEmployeeId?: string;
  actualEmployeeName?: string;
  actualCondition?: AssetCondition;
  result: InventoryResult;
  note?: string;
  checkedAt?: string;
  checkedBy?: string;
};

export type InventorySession = {
  id: string;
  code: string;
  minutesNumber?: string;
  title: string;
  inventoryDate: string;
  location: string;
  status: InventoryStatus;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  items: InventoryItem[];
};
