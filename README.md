<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/cf5b4a13-9ea0-44bf-8825-84c7fe58b105

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Cloud library

Connect a **public Vercel Blob store** to the `shadowwalk` project. Vercel adds `BLOB_READ_WRITE_TOKEN` to the project environment. Redeploy after connecting the store.

The library page can upload TXT or JSON files, open them on another device, and delete older files. Open a TXT in the editor, add a YouTube URL and timestamps, then use **클라우드 저장** to save the synced project as JSON. Existing browser projects have a **☁ 저장** action to copy them to the cloud.

Cloud library routes have no sign-in, as requested. Anyone with the site address can read, add, replace, or delete these files. Keep private information out of the files.
