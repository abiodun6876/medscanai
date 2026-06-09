# MedScan AI

AI-assisted medical imaging analysis platform built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Overview

MedScan AI helps patients and healthcare professionals upload medical images, receive AI-generated findings, and generate review-ready reports.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run dev server:

```bash
npm run dev
```

## Features

- User authentication with Supabase
- Secure image upload UI
- AI analysis workflow placeholder
- Scan history and report generation support
- Doctor review and validation workflow roadmap

## Next steps

- Add full Supabase auth + storage integration
- Implement AI inference or API integration for image analysis
- Add scan history, reports, and doctor review pages
