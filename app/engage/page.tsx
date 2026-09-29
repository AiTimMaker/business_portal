import { getServerSession } from "next-auth";
import { EngageFeed } from "@/components/engage-feed";
import { Topbar } from "@/components/topbar";
import { authOptions } from "@/lib/auth";
import { getVivaCommunities } from "@/lib/engage-graph";
import { getEngageData } from "@/lib/engage-store";
import { engageAuthor } from "@/lib/engage-user";

export const dynamic = "force-dynamic";
export default async function EngagePage() {
  const demo = process.env.DEMO_MODE === "true"; const session = demo ? null : await getServerSession(authOptions);
  const [data, communities] = await Promise.all([demo ? getEngageData() : Promise.resolve({ communities: [], posts: [] }), demo ? Promise.resolve([]) : getVivaCommunities(session?.accessToken)]);
  return <><Topbar eyebrow="Microsoft Viva" title="Cộng đồng Viet Robot" /><div className="content engage-content"><EngageFeed initialData={data} graphCommunities={communities} currentUser={engageAuthor(session)} embedUrl={demo ? undefined : process.env.VIVA_ENGAGE_EMBED_URL} demo={demo} /></div></>;
}
