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

// Handler functions for clarity
async function getPost(postId: number, res: NextApiResponse) {
  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching post' });
  }
}

async function updatePost(postId: number, body: any, res: NextApiResponse) {
  const { title, body: postBody } = body;
  try {
    const updated = await prisma.post.update({
      where: { id: postId },
      data: { title, body: postBody },
    });
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(404).json({ message: 'Post not found' });
  }
}

async function deletePost(postId: number, res: NextApiResponse) {
  try {
    await prisma.post.delete({ where: { id: postId } });
    return res.status(204).end();
  } catch (err) {
    return res.status(404).json({ message: 'Post not found' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkApiKey(req, res)) return;

  const postId = Number(req.query.id);
  if (isNaN(postId)) return res.status(400).json({ message: 'Invalid post id' });

  if (req.method === 'GET') {
    return getPost(postId, res);
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    return updatePost(postId, req.body, res);
  }

  if (req.method === 'DELETE') {
    return deletePost(postId, res);
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
