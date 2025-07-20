
import { useEffect, useState } from "react";
import Link from "next/link";

type Post = { id: number; title: string; body: string };


const Home = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState("");
    const [newBody, setNewBody] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("/api/posts")
            .then(res => res.json())
            .then(data => {
                setPosts(data);
                setLoading(false);
            });
    }, []);

    // Optimistic add
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newBody.trim()) return;
        setError("");
        const tempId = Math.max(0, ...posts.map(p => p.id)) + 1;
        const optimisticPost: Post = { id: tempId, title: newTitle, body: newBody };
        setPosts([optimisticPost, ...posts]);
        setNewTitle("");
        setNewBody("");
        try {
            // Replace with your actual API endpoint for creating posts
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: optimisticPost.title, body: optimisticPost.body })
            });
            if (!res.ok) throw new Error("Failed to add post");
            const saved = await res.json();
            setPosts(curr => curr.map(p => p.id === tempId ? saved : p));
        } catch (err) {
            setError("Failed to add post");
            setPosts(curr => curr.filter(p => p.id !== tempId));
        }
    };

    // Optimistic delete
    const handleDelete = async (id: number) => {
        const prev = posts;
        setPosts(posts.filter(p => p.id !== id));
        try {
            const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
        } catch {
            setError("Failed to delete post");
            setPosts(prev);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Posts</h1>
            <form onSubmit={handleAdd} className="mb-4 flex flex-col md:flex-row gap-2">
                <input
                    className="border p-2 rounded flex-1"
                    placeholder="Title"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                />
                <input
                    className="border p-2 rounded flex-1"
                    placeholder="Body"
                    value={newBody}
                    onChange={e => setNewBody(e.target.value)}
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
            </form>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            {loading ? <p>Loading...</p> : (
                <table className="min-w-full mt-4 border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left">Title</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map(post => (
                            <tr key={post.id} className="border-t">
                                <td className="px-4 py-2">{post.title}</td>
                                <td className="px-4 py-2 flex gap-2">
                                    <Link href={`/post/${post.id}`} className="text-blue-600 underline">View</Link>
                                    <button
                                        className="text-red-600 underline"
                                        onClick={() => handleDelete(post.id)}
                                    >Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Home;
