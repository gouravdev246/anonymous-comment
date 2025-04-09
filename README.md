# Anonymous Comment System with YouTube Music Player

This project is a comment system with an integrated YouTube Music player.

## Features

- Anonymous commenting system with replies
- YouTube Music player integration
- Real-time updates via Supabase

## YouTube Music Integration

The music player uses the YouTube Music API through a proxy service to:
- Search for tracks
- Play audio from YouTube videos
- Display track information and album art

This integration was inspired by [ytmusicapi](https://github.com/sigma67/ytmusicapi) Python library, but since this is a JavaScript/TypeScript frontend application, we're using REST API proxies to access YouTube Music data.

## Technical Implementation

- **Frontend**: React with TypeScript, Vite, and Tailwind CSS
- **Backend**: Supabase for database and real-time subscriptions
- **Music API**: YouTube Music accessed through API proxies

## Setup and Installation

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file with your Supabase credentials
4. Run the development server with `npm run dev`

## Limitations

- The YouTube Music API proxy is unofficially implemented and may have limitations
- Some videos may not be playable due to copyright restrictions

## Project URL

**Live App**: [Open the deployed app](https://531db411-d9c7-43e7-a102-826e0b06085d.lovableproject.com)

**Lovable Project**: [View and edit in Lovable](https://lovable.dev/projects/531db411-d9c7-43e7-a102-826e0b06085d)

## How to share this app

1. **Share the direct app URL**:
   - Send others the link to the deployed app: https://531db411-d9c7-43e7-a102-826e0b06085d.lovableproject.com

2. **Clone and run locally**:
   ```sh
   # Step 1: Clone the repository
   git clone <YOUR_GIT_URL>
   
   # Step 2: Navigate to the project directory
   cd <YOUR_PROJECT_NAME>
   
   # Step 3: Install dependencies
   npm i
   
   # Step 4: Start the development server
   npm run dev
   ```

3. **Deploy to your own hosting**:
   - The app is built with Vite and can be deployed to any static hosting service
   - Build the app with `npm run build` and deploy the contents of the `dist` folder

## Technologies used

- React
- TypeScript
- Tailwind CSS
- shadcn/ui components

## Created with Lovable

This project was built using [Lovable](https://lovable.dev), an AI-powered web app editor.
