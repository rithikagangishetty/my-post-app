import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const PostDetail = () => {
  const router = useRouter();
  const { id } = router.query;

  const [post, setPost] = useState<{ id: number; title: string; body: string } | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
        const data = await res.json();
        setPost(data);
        setLoading(false);

        // Dynamically load analysis.js from public folder
        const script = document.createElement("script");
        script.src = "/analysis.js";
        script.async = true;
        script.onload = async () => {
          // @ts-ignore
          if (window.Module) {
            // @ts-ignore
            const instance = await window.Module();
            const wordCount = instance.ccall(
              "word_count",
              "number",
              ["string"],
              [data.body]
            );
            setAnalysis(`Word Count: ${wordCount}`);
          }
        };
        document.body.appendChild(script);
      } catch (err) {
        console.error("Failed to load post", err);
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!post) return <div className="p-6 text-red-600">Post not found.</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Post #{post.id}</h1>

      <label className="block font-semibold mb-1">Title:</label>
      <input
        type="text"
        value={post.title}
        onChange={(e) => setPost({ ...post, title: e.target.value })}
        className="w-full border p-2 rounded mb-4"
      />

      <label className="block font-semibold mb-1">Body:</label>
      <p className="bg-gray-100 p-3 rounded mb-4 text-gray-700 whitespace-pre-line">{post.body}</p>

      <div className="text-sm text-green-700 font-medium">
        {analysis}
      </div>
    </div>
  );
};

export default PostDetail;
