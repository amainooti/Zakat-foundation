import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BlogEditor from "@/components/admin/BlogEditor";
import type { BlogPost } from "@/lib/types/app";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) notFound();

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Edit Post</h1>
        <p className="admin-page-subtitle">{post.title}</p>
      </div>
      <BlogEditor post={post as BlogPost} />
    </div>
  );
}