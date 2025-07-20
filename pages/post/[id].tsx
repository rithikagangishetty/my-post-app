import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";

const PostDetail = () => {
  const router = useRouter();
  const { id } = router.query;

  const [post, setPost] = useState<{ id: number; title: string; body: string } | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(true);
  const [editedTitle, setEditedTitle] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
        const data = await res.json();
        setPost(data);
        setEditedTitle(data.title);
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
    <>
      <Head>
        <title>{post.title ? `${post.title} | My Post App` : `Post #${post.id} | My Post App`}</title>
      </Head>
      <div className="p-6 max-w-2xl mx-auto">
        <Link href="/" className="inline-block mb-4 text-primary underline font-medium hover:text-primary-dark focus:text-primary-dark transition focus:outline-none">← Back to Posts</Link>
        <h1 className="text-2xl font-bold mb-4">Post #{post.id}</h1>

        <label className="block font-semibold mb-1">Title:</label>

        <input
          type="text"
          value={editedTitle}
          onChange={e => {
            setEditedTitle(e.target.value);
            setIsDirty(e.target.value !== post.title);
          }}
          className="w-full border p-2 rounded mb-2"
        />
        {isDirty && (
          <button
            className="mb-4 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              setError("");
              try {
                const res = await fetch(`/api/posts/${post.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
                  },
                  body: JSON.stringify({ title: editedTitle })
                });
                if (!res.ok) throw new Error('Failed to update');
                const updated = await res.json();
                setPost(updated);
                setIsDirty(false);
              } catch (err) {
                setError('Failed to update post');
              } finally {
                setSaving(false);
              }
            }}
          >{saving ? 'Saving...' : 'Save'}</button>
        )}
        {error && <div className="text-red-600 mb-2">{error}</div>}

        <label className="block font-semibold mb-1">Body:</label>
        <p className="bg-gray-100 p-3 rounded mb-4 text-gray-700 whitespace-pre-line">{post.body}</p>

        <div className="text-sm text-green-700 font-medium">
          {analysis}
        </div>
      </div>
    </>
  );
};

export default PostDetail;
