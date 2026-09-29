"use client";

import { FormEvent } from "react";
import type { EngageAuthor, EngagePost, EngagePostType } from "@/lib/engage-types";
import { Icons } from "./icons";

function timeLabel(value: string) { const minutes = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60000)); if (minutes < 60) return `${minutes} phút`; if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ`; return `${Math.floor(minutes / 1440)} ngày`; }
function TypeIcon({ type }: { type: EngagePostType }) { if (type === "Thông báo") return <Icons.Megaphone size={13} />; if (type === "Câu hỏi") return <Icons.MessageCircle size={13} />; if (type === "Khen thưởng") return <Icons.Award size={13} />; return <Icons.FileText size={13} />; }

export function EngagePostCard({ post, currentUser, communityName, onLike, onComment }: { post: EngagePost; currentUser: EngageAuthor; communityName?: string; onLike: (post: EngagePost) => void; onComment: (event: FormEvent<HTMLFormElement>, post: EngagePost) => void }) {
  return <article id={post.id} className={`engage-post ${post.pinned ? "pinned" : ""}`}>
    {post.pinned && <div className="post-pinned"><Icons.Pin size={12} /> Bài viết được ghim</div>}
    <header><span className="engage-avatar">{post.author.initials}</span><div><strong>{post.author.name}</strong><small>{post.author.title} · {timeLabel(post.createdAt)} trước · <Icons.Globe2 size={11} /></small></div><button><Icons.MoreHorizontal size={18} /></button></header>
    <div className="post-meta"><span className={`post-type ${post.type.toLowerCase().replaceAll(" ", "-")}`}><TypeIcon type={post.type} /> {post.type}</span><span>{communityName}</span></div>
    <p className="post-content">{post.content}</p>
    {post.tags?.length ? <div className="post-tags">{post.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div> : null}
    <div className="post-counts"><span>{post.likedBy.length ? `💚 ${post.likedBy.length} lượt thích` : "Chưa có lượt thích"}</span><span>{post.comments.length} bình luận</span></div>
    <div className="post-actions"><button className={post.likedBy.includes(currentUser.email) ? "liked" : ""} onClick={() => onLike(post)}><Icons.Heart size={17} /> Thích</button><button onClick={() => document.getElementById(`comment-${post.id}`)?.focus()}><Icons.MessageCircle size={17} /> Bình luận</button><button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/engage#${post.id}`)}><Icons.Send size={17} /> Sao chép liên kết</button></div>
    {post.comments.length > 0 && <div className="post-comments">{post.comments.slice(-3).map((item) => <div key={item.id}><span className="engage-avatar small">{item.author.initials}</span><p><strong>{item.author.name}</strong><span>{item.content}</span><small>{timeLabel(item.createdAt)} trước</small></p></div>)}</div>}
    <form className="comment-box" onSubmit={(event) => onComment(event, post)}><span className="engage-avatar small self">{currentUser.initials}</span><input id={`comment-${post.id}`} name="comment" maxLength={2000} placeholder="Viết bình luận..." /><button aria-label="Gửi bình luận"><Icons.Send size={15} /></button></form>
  </article>;
}
