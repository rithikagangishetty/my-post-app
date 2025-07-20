import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const localPosts = await prisma.post.findMany();
        if (localPosts.length > 0) return res.status(200).json(localPosts);

        // If no local data, fetch from mock API and sync to DB
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const posts: { id: number; title: string; body: string }[] = await response.json();
        await prisma.post.createMany({
            data: posts.map(({ id, title, body }) => ({ id, title, body })),
            skipDuplicates: true,
        });
        return res.status(200).json(posts);
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
}
