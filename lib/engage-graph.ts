import "server-only";
import type { EngageCommunity } from "./engage-types";

export async function getVivaCommunities(accessToken?: string): Promise<EngageCommunity[]> {
  if (!accessToken) return [];
  const response = await fetch("https://graph.microsoft.com/v1.0/employeeExperience/communities?$select=id,displayName,description,privacy&$orderby=displayName", { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
  if (!response.ok) { console.error("Viva Engage communities failed", response.status, await response.text()); return []; }
  const data = await response.json() as { value?: Array<{ id: string; displayName?: string; description?: string }> };
  const colors = ["#167d68", "#386fb3", "#8a5ab5", "#d07b32", "#b24f66"];
  return (data.value ?? []).map((item, index) => ({ id: item.id, name: item.displayName ?? "Cộng đồng Viva Engage", description: item.description ?? "Cộng đồng nội bộ", members: 0, color: colors[index % colors.length], official: true }));
}
