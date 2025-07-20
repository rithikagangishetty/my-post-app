
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

type Post = { id: number; title: string; body: string };


const Home = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [skip, setSkip] = useState(0); // Offset for pagination
    const [take] = useState(20); // Page size
    const [total, setTotal] = useState<number>(0); // Total posts in DB
    const [loading, setLoading] = useState(true);
    const [newTitle, setNewTitle] = useState("");
    const [newBody, setNewBody] = useState("");
    const [error, setError] = useState("");
    const [showAddPost, setShowAddPost] = useState(false);
    const router = useRouter();

    // Fetch posts from API with pagination
    const fetchPosts = (newSkip = 0, append = false) => {
        setLoading(true);
        fetch(`/api/posts?skip=${newSkip}&take=${take}`, {
            headers: {
                'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
            }
        })
            .then(res => res.json())
            .then(data => {
                const postsArr = Array.isArray(data.posts) ? data.posts : [];
                const totalCount = typeof data.total === 'number' ? data.total : 0;
                if (append) {
                    setPosts(curr => [...curr, ...postsArr]);
                } else {
                    setPosts(postsArr);
                }
                setTotal(totalCount);
                setLoading(false);
            })
            .catch(() => {
                setPosts([]);
                setTotal(0);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchPosts(0, false);
        setSkip(0);
        // Listen for route changes to re-fetch posts when returning to this page
        const handleRouteChange = (url: string) => {
            if (url === "/") {
                fetchPosts(0, false);
                setSkip(0);
            }
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
            setShowAddPost(false); // Close the Add Post container on success
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
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-4xl font-bold text-primary">Posts</h1>
                        <button
                            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold shadow-sm transition focus:outline-none focus:ring-4 focus:ring-primary/30"
                            onClick={() => setShowAddPost(v => !v)}
                        >
                            <span className="text-2xl leading-none">+</span> Add Post
                        </button>
                    </div>
                    {/* Add Post Container */}
                    {showAddPost && (
                        <div className="mb-10 p-6 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
                            <h2 className="text-2xl font-semibold mb-4 text-primary">Add Post</h2>
                            <form onSubmit={handleAdd} className="flex flex-col gap-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="block mb-2 font-medium text-gray-700">Title</label>
                                        <input
                                            className="border border-gray-300 p-4 rounded-2xl w-full focus:outline-none focus:ring-4 focus:ring-primary/30 transition placeholder-gray-400 hover:border-primary"
                                            placeholder="Title"
                                            value={newTitle}
                                            onChange={e => setNewTitle(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block mb-2 font-medium text-gray-700">Body</label>
                                    <textarea
                                        className="border border-gray-300 p-4 rounded-2xl w-full min-h-[100px] resize-y focus:outline-none focus:ring-4 focus:ring-primary/30 transition placeholder-gray-400 hover:border-primary"
                                        placeholder="Body"
                                        value={newBody}
                                        onChange={e => setNewBody(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="bg-primary hover:bg-primary-dark focus:bg-primary-dark text-white px-8 py-4 rounded-2xl font-semibold shadow-sm transition focus:outline-none focus:ring-4 focus:ring-primary/30">Add</button>
                                </div>
                            </form>
                            {error && <div className="text-red-600 mt-4 text-center">{error}</div>}
                        </div>
                    )}
                    {/* Posts List Container */}
                    <h2 className="text-2xl font-semibold mb-4 text-primary">Post List</h2>
                    {loading && posts.length === 0 ? <p className="text-center text-gray-500">Loading...</p> : (
                        <>
                        <table className="min-w-full border rounded-2xl overflow-hidden">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-8 py-4 text-left font-semibold">Title</th>
                                    <th className="px-8 py-4 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(posts) && posts.map(post => (
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
                        {posts.length < total && (
                            <div className="flex justify-center mt-6">
                                <button
                                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold shadow-sm transition focus:outline-none focus:ring-4 focus:ring-primary/30"
                                    onClick={() => {
                                        const newSkip = skip + take;
                                        fetchPosts(newSkip, true);
                                        setSkip(newSkip);
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? 'Loading...' : 'Load More'}
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
