import { Icons } from "./icons";
import type { DocumentItem } from "@/lib/demo-data";

export function FileIcon({ type, large = false }: { type: DocumentItem["type"]; large?: boolean }) {
  const Icon = type === "xlsx" ? Icons.FileSpreadsheet : type === "pptx" ? Icons.FileChartColumn : Icons.FileText;
  return <span className={`file-icon ${type} ${large ? "large" : ""}`}><Icon size={large ? 26 : 20} /><small>{type.toUpperCase()}</small></span>;
}
