# MicroCourse LMS Frontend (Next.js)

## 🚀 How to Run Locally

1. Install dependencies:
   ```
   npm install
   ```

2. Set environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE=http://localhost:5000/api
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_PRESET=your_unsigned_preset
   ```

3. Start the dev server:
   ```
   npm run dev
   ```

## 🌐 Deploying to Vercel
- Push this folder to GitHub.
- Connect to [Vercel](https://vercel.com).
- Add the same env vars in the Vercel dashboard.

## 🧠 Backend Setup (Render/Railway)
- Deploy backend zip from `/microcourse-server-launch-ready.zip`
- Use MongoDB Atlas and set these env vars on Render:
   - `PORT=5000`
   - `MONGO_URI=<your-atlas-uri>`
   - `JWT_SECRET=<your-secret>`

## 🎥 Video Uploads
- Uses Cloudinary unsigned upload via `utils/cloudinaryUpload.js`
