
# My Post App

> **A modern, full-stack Next.js application that seamlessly blends C++/WASM performance, robust PostgreSQL data management, and a beautiful, responsive UI for an exceptional developer and user experience.**

This project showcases advanced integration of C++ logic via WebAssembly (WASM), secure and scalable backend APIs, and a highly interactive frontend with optimistic UI updates.

---

## Features

## Features
- View, add, and delete posts (with optimistic UI)
- Analyze post content using C++/WASM (word count)
- Data persistence with PostgreSQL
- Clean, responsive UI with Tailwind CSS

## Technical Challenges & Solutions

- **C++/WASM Integration:** Leveraged Emscripten to compile C++ code to WebAssembly, enabling high-performance, in-browser text analysis. This required careful handling of WASM module loading and JavaScript interop.
- **Optimistic UI Updates:** Implemented instant UI feedback for post actions, with rollback and error handling for failed server responses, ensuring a smooth user experience.
- **Secure API Design:** All API endpoints are protected with API key authentication, preventing unauthorized access and ensuring data integrity.
- **Type Safety & Code Quality:** Used TypeScript throughout the stack and Prisma for type-safe database access, reducing runtime errors and improving maintainability.

---

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