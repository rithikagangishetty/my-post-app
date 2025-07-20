
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

type Post = { id: number; title: string; body: string };


const Home = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [visibleCount, setVisibleCount] = useState(20); // Number of posts to show initially
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState("");
    const [newBody, setNewBody] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    // Fetch posts from API
    const fetchPosts = () => {
        setLoading(true);
        fetch("/api/posts", {
            headers: {
                'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
            }
        })
            .then(res => res.json())
            .then(data => {
                setPosts(data);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchPosts();
        // Listen for route changes to re-fetch posts when returning to this page
        const handleRouteChange = (url: string) => {
            if (url === "/") fetchPosts();
        };
        router.events.on("routeChangeComplete", handleRouteChange);
        return () => {
            router.events.off("routeChangeComplete", handleRouteChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
                },
                body: JSON.stringify({ title: optimisticPost.title, body: optimisticPost.body })
            });
            if (!res.ok) throw new Error("Failed to add post");
            const saved = await res.json();
            setPosts(curr => {
                const idx = curr.findIndex(p => p.id === tempId);
                if (idx === -1) return curr;
                // Replace at the same index to preserve order
                const updated = [...curr];
                updated[idx] = saved;
                return updated;
            });
        } catch (err) {
            setError("Failed to add post");
            setPosts(curr => curr.filter(p => p.id !== tempId));
        }
    };

    // Update a post in place by id
    const updatePostInList = (updatedPost: Post) => {
        setPosts(curr => {
            const idx = curr.findIndex(p => p.id === updatedPost.id);
            if (idx === -1) return curr;
            const updated = [...curr];
            updated[idx] = updatedPost;
            return updated;
        });
    };

    // Optimistic delete
    const handleDelete = async (id: number) => {
        const prev = posts;
        setPosts(posts.filter(p => p.id !== id));
        try {
            const res = await fetch(`/api/posts/${id}`, {
                method: "DELETE",
                headers: {
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });
            if (!res.ok) throw new Error();
        } catch {
            setError("Failed to delete post");
            setPosts(prev);
        }
    };

    return (
        <>
            <Head>
                <title>Posts | My Post App</title>
            </Head>
            <div className="min-h-screen flex flex-col items-center justify-start bg-background py-10 px-4">
                <div className="w-full max-w-4xl bg-white rounded-2xl shadow-card p-10">
                    <h1 className="text-4xl font-bold mb-8 text-primary">Posts</h1>
                    {/* Add Post Container */}
                    <div className="mb-10 p-6 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                        <h2 className="text-2xl font-semibold mb-4 text-primary">Add Post</h2>
                        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
                            <input
                                className="border border-gray-300 p-4 rounded-2xl flex-1 focus:outline-none focus:ring-4 focus:ring-primary/30 transition placeholder-gray-400 hover:border-primary"
                                placeholder="Title"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                            />
                            <input
                                className="border border-gray-300 p-4 rounded-2xl flex-1 focus:outline-none focus:ring-4 focus:ring-primary/30 transition placeholder-gray-400 hover:border-primary"
                                placeholder="Body"
                                value={newBody}
                                onChange={e => setNewBody(e.target.value)}
                            />
                            <button type="submit" className="bg-primary hover:bg-primary-dark focus:bg-primary-dark text-white px-8 py-4 rounded-2xl font-semibold shadow-sm transition focus:outline-none focus:ring-4 focus:ring-primary/30">Add</button>
                        </form>
                        {error && <div className="text-red-600 mt-4 text-center">{error}</div>}
                    </div>
                    {/* Posts List Container */}
                    <h2 className="text-2xl font-semibold mb-4 text-primary">Post List</h2>
                    {loading ? <p className="text-center text-gray-500">Loading...</p> : (
                        <>
                        <table className="min-w-full border rounded-2xl overflow-hidden">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-8 py-4 text-left font-semibold">Title</th>
                                    <th className="px-8 py-4 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(posts) && posts.slice(0, visibleCount).map(post => (
                                    <tr key={post.id} className="border-t">
                                        <td className="px-8 py-4 text-lg">{post.title}</td>
                                        <td className="px-8 py-4 flex gap-4">
                                            <Link href={`/post/${post.id}`} className="text-primary underline font-medium hover:text-primary-dark focus:text-primary-dark transition focus:outline-none">View</Link>
                                            <button
                                                className="text-red-600 underline font-medium hover:text-red-800 focus:text-red-800 transition focus:outline-none"
                                                onClick={() => handleDelete(post.id)}
                                            >Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {visibleCount < posts.length && (
                            <div className="flex justify-center mt-6">
                                <button
                                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold shadow-sm transition focus:outline-none focus:ring-4 focus:ring-primary/30"
                                    onClick={() => setVisibleCount(c => c + 20)}
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Home;
