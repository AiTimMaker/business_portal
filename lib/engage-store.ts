import "server-only";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { EngageAuthor, EngageData, EngagePost, EngagePostType } from "./engage-types";

const dataPath = path.join(process.cwd(), "data", "engage.json");
export async function getEngageData(): Promise<EngageData> { return JSON.parse(await readFile(dataPath, "utf8")) as EngageData; }
async function save(data: EngageData) { const temporaryPath = `${dataPath}.tmp`; await writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, "utf8"); await rename(temporaryPath, dataPath); }
export async function createEngagePost(input: { author: EngageAuthor; communityId: string; type: EngagePostType; content: string }) { const data = await getEngageData(); if (!data.communities.some((item) => item.id === input.communityId)) throw new Error("Không tìm thấy cộng đồng"); const post: EngagePost = { id: crypto.randomUUID(), ...input, createdAt: new Date().toISOString(), likedBy: [], comments: [] }; data.posts.unshift(post); await save(data); return post; }
export async function toggleEngageLike(postId: string, email: string) { const data = await getEngageData(); const post = data.posts.find((item) => item.id === postId); if (!post) throw new Error("Không tìm thấy bài viết"); post.likedBy = post.likedBy.includes(email) ? post.likedBy.filter((item) => item !== email) : [...post.likedBy, email]; await save(data); return post; }
export async function addEngageComment(postId: string, author: EngageAuthor, content: string) { const data = await getEngageData(); const post = data.posts.find((item) => item.id === postId); if (!post) throw new Error("Không tìm thấy bài viết"); post.comments.push({ id: crypto.randomUUID(), author, content, createdAt: new Date().toISOString() }); await save(data); return post; }
