# Minimalist Blog

A fast, minimalist blogging website built with **Astro** and deployed on **GitHub Pages**. Uses the GitHub repository as a database and includes an admin dashboard for creating posts.

## 🚀 Features

- **Static Site Generation**: Built with Astro for maximum performance
- **GitHub as CMS**: Blog posts stored as Markdown files in the repository
- **Admin Dashboard**: Client-side editor at `/admin` for creating posts
- **Markdown Support**: Full Markdown syntax with YAML frontmatter
- **Minimalist Design**: Clean, monochrome design with Tailwind CSS
- **Automatic Deployment**: GitHub Actions automatically rebuilds on new commits

## 📁 Project Structure

```
/
├── content/
│   └── blog/              # Blog posts as Markdown files
│       └── *.md
├── src/
│   ├── components/        # Reusable components
│   ├── layouts/
│   │   └── Layout.astro   # Base layout
│   ├── lib/
│   │   ├── blog.ts        # Blog post fetching logic
│   │   └── github.ts      # GitHub API integration
│   ├── pages/
│   │   ├── index.astro    # Home page (list of posts)
│   │   ├── admin.astro    # Admin dashboard
│   │   └── blog/
│   │       └── [slug].astro  # Individual blog post
│   └── styles/
│       └── global.css     # Global styles
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions deployment
└── astro.config.mjs       # Astro configuration
```

## 🛠️ Setup

1. **Update configuration**
   
   Edit `astro.config.mjs`:
   ```js
   export default defineConfig({
     site: 'https://yourusername.github.io',
     base: '/wriddharoy.com',
   });
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - Save

3. **Create a GitHub Personal Access Token**
   - Visit https://github.com/settings/tokens
   - Generate new token (classic)
   - Select `repo` scope
   - Copy the token (you'll need it for the admin dashboard)

## 💻 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## ✍️ Creating Blog Posts

### Method 1: Admin Dashboard (Recommended)

1. Navigate to `/admin` in your browser
2. Login with:
   - GitHub Personal Access Token
   - Repository Owner (your username)
   - Repository Name
3. Fill in the post details:
   - Title
   - Description
   - Content (in Markdown)
4. Click "Publish Post"

The post will be committed to the repository, and GitHub Actions will automatically rebuild the site.

### Method 2: Manual File Creation

Create a new `.md` file in `content/blog/`:

```markdown
---
title: "Your Post Title"
date: "2024-01-01"
description: "A brief description"
---

# Your Content Here

Write your post content using Markdown...
```

File naming convention: `YYYY-MM-DD-slug.md`

## 🎨 Customization

### Styling

The site uses Tailwind CSS. Modify `src/styles/global.css` and component styles as needed.

### Typography

Blog post typography is defined in `src/pages/blog/[slug].astro` using custom CSS classes.

### Layout

Edit `src/layouts/Layout.astro` to change the header, footer, or overall structure.

## 📦 Deployment

Deployment is automatic via GitHub Actions:

1. Push changes to the `main` branch
2. GitHub Actions builds the site
3. Deploys to GitHub Pages

Manual deployment:
```bash
npm run build
# Deploy the ./dist folder to your hosting provider
```

## 🔒 Security Notes

- GitHub tokens are stored in `sessionStorage` (cleared when browser closes)
- Never commit tokens to the repository
- Use tokens with minimal required permissions (`repo` scope only)
- Tokens are only used client-side for the admin dashboard

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.
