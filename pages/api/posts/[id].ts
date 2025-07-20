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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkApiKey(req, res)) return;

  const postId = Number(req.query.id);
  if (isNaN(postId)) return res.status(400).json({ message: 'Invalid post id' });

  if (req.method === 'PATCH' || req.method === 'PUT') {
    const { title, body } = req.body;
    try {
      const updated = await prisma.post.update({
        where: { id: postId },
        data: { title, body },
      });
      return res.status(200).json(updated);
    } catch (err) {
      return res.status(404).json({ message: 'Post not found' });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
