
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

// API key protection middleware
function checkApiKey(req: NextApiRequest, res: NextApiResponse): boolean {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (apiKey !== process.env.API_KEY) {
    res.status(401).json({ message: 'Invalid or missing API key' });
    return false;
  }
  return true;
}

async function getPosts(req: NextApiRequest, res: NextApiResponse) {
    // Pagination: support ?skip=0&take=20
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 100;

    // Always return posts sorted by id ASC, paginated
    const localPosts = await prisma.post.findMany({
        orderBy: { id: 'asc' },
        skip,
        take
    });
    const total = await prisma.post.count();
    if (localPosts.length > 0) {
        return res.status(200).json({ posts: localPosts, total });
    }

    // If no local data, fetch from mock API and sync to DB
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const posts: { id: number; title: string; body: string }[] = await response.json();
    await prisma.post.createMany({
        data: posts.map(({ id, title, body }) => ({ id, title, body })),
        skipDuplicates: true,
    });
    // After seeding, return paginated posts
    const seededPosts = await prisma.post.findMany({ orderBy: { id: 'asc' }, skip, take });
    const seededTotal = await prisma.post.count();
    return res.status(200).json({ posts: seededPosts, total: seededTotal });
}

async function addPost(req: NextApiRequest, res: NextApiResponse) {
    const { title, body } = req.body;
    if (!title || !body) {
        return res.status(400).json({ message: 'Title and body are required' });
    }
    // Find the max id to increment for new post
    const maxPost = await prisma.post.findFirst({ orderBy: { id: 'desc' } });
    const newId = maxPost ? maxPost.id + 1 : 1;
    const created = await prisma.post.create({
        data: { id: newId, title, body }
    });
    return res.status(201).json(created);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!checkApiKey(req, res)) return;

    if (req.method === "GET") {
        return getPosts(req, res);
    }
    if (req.method === "POST") {
        return addPost(req, res);
    }
    // All other methods (PATCH, DELETE, GET by id) should be handled in /api/posts/[id].ts
    return res.status(405).json({ message: 'Method Not Allowed' });
}
