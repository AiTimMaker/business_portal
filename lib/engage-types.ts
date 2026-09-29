export type EngagePostType = "Bài viết" | "Thông báo" | "Câu hỏi" | "Khen thưởng";
export type EngageCommunity = { id: string; name: string; description: string; members: number; color: string; official?: boolean };
export type EngageAuthor = { name: string; email: string; title: string; initials: string };
export type EngageComment = { id: string; author: EngageAuthor; content: string; createdAt: string };
export type EngagePost = { id: string; author: EngageAuthor; communityId: string; type: EngagePostType; content: string; createdAt: string; pinned?: boolean; likedBy: string[]; comments: EngageComment[]; tags?: string[] };
export type EngageData = { communities: EngageCommunity[]; posts: EngagePost[] };
