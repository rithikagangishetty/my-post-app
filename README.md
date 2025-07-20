# My Post App

This is a full-stack Next.js application that demonstrates:
- Integration of C++ logic via WebAssembly (WASM)
- PostgreSQL database access using Prisma ORM
- Tailwind CSS for modern, responsive UI
- Mock API usage and optimistic UI updates

## Features
- View, add, and delete posts (with optimistic UI)
- Analyze post content using C++/WASM (word count)
- Data persistence with PostgreSQL
- Clean, responsive UI with Tailwind CSS

## Setup
1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment**
   - Copy `.env.example` to `.env` and set your `DATABASE_URL` (PostgreSQL)
4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```
5. **Start the development server**
   ```bash
   npm run dev
   ```

## WASM (C++ Integration)
- The app loads `analysis.js` and `analysis.wasm` from the `public/` folder to analyze post content (e.g., word count).
- See `cpp/analysis.cpp` for the C++ source.

## Deployment
- Deploy easily to Vercel, Netlify, or your own server.
- Ensure your production database is accessible and `DATABASE_URL` is set.

## Architecture
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes, Prisma, PostgreSQL
- **WASM**: C++ compiled to WebAssembly for fast in-browser analysis

## Optimistic UI
- Adding and deleting posts updates the UI instantly, before the server confirms the change.
- If the server fails, the UI rolls back and shows an error.

## Mock API
- On first run, posts are fetched from `jsonplaceholder.typicode.com` and stored in your database.

## Extending with ML/MLOps (Bonus)
- Integrate a simple ML model (e.g., sentiment analysis) using Python or JS and expose via API route.
- Add MLOps tools (e.g., DVC, MLflow) for tracking models and data.

## License
MIT