
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

// API key protection middleware
function checkApiKey(req: NextApiRequest, res: NextApiResponse): boolean {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  console.log('Received API key:', apiKey);
  console.log('Expected API key:', process.env.API_KEY);
  if (apiKey !== process.env.API_KEY) {
    res.status(401).json({ message: 'Invalid or missing API key' });
    return false;
  }
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!checkApiKey(req, res)) return;

    if (req.method === "GET") {
        // Always return posts sorted by id ASC
        const localPosts = await prisma.post.findMany({ orderBy: { id: 'asc' } });
        if (localPosts.length > 0) return res.status(200).json(localPosts);

        // If no local data, fetch from mock API and sync to DB
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const posts: { id: number; title: string; body: string }[] = await response.json();
        await prisma.post.createMany({
            data: posts.map(({ id, title, body }) => ({ id, title, body })),
            skipDuplicates: true,
        });
        // After seeding, return sorted posts
        const seededPosts = await prisma.post.findMany({ orderBy: { id: 'asc' } });
        return res.status(200).json(seededPosts);
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
}
