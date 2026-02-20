import BlogEditor from "@/components/admin/BlogEditor";

export default function NewBlogPostPage() {
  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">New Post</h1>
        <p className="admin-page-subtitle">Write a new blog post</p>
      </div>
      <BlogEditor />
    </div>
  );
}