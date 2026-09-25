<h1 align="center">Gemini Image Generator</h1>

<p align="center">
  An AI image generation app built with Next.js and the Gemini API.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#running-locally"><strong>Running Locally</strong></a>
</p>
<br/>

## Features

- Generates images with the [Gemini API](https://ai.google.dev/gemini-api/docs/image-generation) (`gemini-2.5-flash-image`, `gemini-3-pro-image`, and other Nano Banana models).
- A single input to generate images across multiple models simultaneously.
- [shadcn/ui](https://ui.shadcn.com/) components for a modern, responsive UI powered by [Tailwind CSS](https://tailwindcss.com).
- Built with the latest [Next.js](https://nextjs.org) App Router (version 15).

## Running Locally

1. Clone the repository and install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. Add a Gemini API key. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` to a key from [Google AI Studio](https://aistudio.google.com/apikey).

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to generate images.
