# Quick Start Guide

## 📦 Project Overview

Your minimalist blog is now set up with Astro and ready for GitHub Pages deployment!

## 🗂️ Key Files

### Core Application
- **`src/lib/github.ts`** - GitHub API commit function for creating blog posts
- **`src/lib/blog.ts`** - Astro content fetching logic for reading Markdown files
- **`src/pages/admin.astro`** - Admin dashboard with authentication & Markdown editor
- **`src/pages/index.astro`** - Home page listing all posts
- **`src/pages/blog/[slug].astro`** - Dynamic blog post page
- **`src/layouts/Layout.astro`** - Base layout with Tailwind CSS

### Content & Config
- **`content/blog/*.md`** - Blog posts stored as Markdown files
- **`astro.config.mjs`** - Astro configuration (update site & base URLs)
- **`.github/workflows/deploy.yml`** - GitHub Actions for automatic deployment

## 🚀 Getting Started

### 1. Development Server
```bash
npm run dev
```
Visit `http://localhost:4321`

### 2. Update Configuration

Edit `astro.config.mjs`:
```js
export default defineConfig({
  site: 'https://YOURUSERNAME.github.io',  // Change this
  base: '/wriddharoy.com',                  // Change if different repo name
  // ...
});
```

### 3. Enable GitHub Pages

1. Push your code to GitHub
2. Go to Settings → Pages
3. Source: **GitHub Actions**
4. Save

### 4. Create GitHub Personal Access Token

1. Visit https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `Blog Admin`
4. Scopes: Check **`repo`** (full control of private repositories)
5. Generate token
6. **Copy the token** (you won't see it again)

## ✍️ Creating Your First Post

### Method 1: Admin Dashboard

1. Navigate to `/admin` in your browser
2. Login with:
   - **GitHub Token**: Your PAT from step 4
   - **Repository Owner**: Your GitHub username
   - **Repository Name**: `wriddharoy.com`
3. Fill in:
   - Title
   - Description
   - Content (in Markdown)
4. Click **Publish Post**

The post is committed to GitHub → GitHub Actions rebuilds → Site updates automatically!

### Method 2: Manual Creation

Create `content/blog/2024-12-16-my-first-post.md`:

```markdown
---
title: "My First Post"
date: "2024-12-16"
description: "This is my first blog post"
---

# Hello World

This is my **first** post using this blog!

## Features I Love

- Clean design
- Easy to write
- Fast performance
```

## 📝 Markdown Syntax

| Syntax | Result |
|--------|--------|
| `# Heading` | H1 heading |
| `## Heading` | H2 heading |
| `**bold**` | **bold** text |
| `*italic*` | *italic* text |
| `[text](url)` | Link |
| `![alt](url)` | Image |
| `` `code` `` | Inline code |
| ` ``` ` | Code block |
| `- item` | List item |

## 🎨 Customization

### Change Blog Title
Edit `src/layouts/Layout.astro` line 24:
```astro
<a href="/">Your Blog Name</a>
```

### Modify Colors
All styles use Tailwind CSS classes. The design is intentionally monochrome (black/white) but you can easily add colors.

### Typography
Edit `src/pages/blog/[slug].astro` styles section to customize post appearance.

## 📦 Deployment

### Automatic (Recommended)
Push to `main` branch → GitHub Actions builds & deploys automatically

### Manual
```bash
npm run build
# Outputs to ./dist
# Deploy ./dist to any static hosting
```

## 🔐 Security

- **Never commit your GitHub token**
- Token is stored in `sessionStorage` only (cleared on browser close)
- Admin dashboard is client-side only
- Token only needs `repo` scope

## 🛠️ Troubleshooting

### Build fails on GitHub Actions
- Check `astro.config.mjs` has correct `site` and `base` URLs
- Ensure `content/blog` directory exists

### Admin dashboard can't commit
- Verify token has `repo` scope
- Check owner/repo names are correct
- Ensure you have write access to the repository

### Posts don't show up
- File must be in `content/blog/`
- Must have `.md` extension
- Must have valid frontmatter (title, date, description)

## 📚 Next Steps

1. ✅ Customize `astro.config.mjs` with your URLs
2. ✅ Enable GitHub Pages
3. ✅ Create a Personal Access Token
4. ✅ Write your first post via `/admin`
5. ✅ Push to GitHub
6. ✅ Watch it deploy automatically!

---

**Full documentation**: See `README_BLOG.md`

**Need help?** Check the [Astro docs](https://docs.astro.build) or [Tailwind docs](https://tailwindcss.com)
