# Code Reference

This document contains the key code snippets from the blog implementation.

## 🔧 GitHub API Commit Function

Located in: `src/lib/github.ts`

```typescript
export class GitHubAPI {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(token: string, owner: string, repo: string) {
    this.octokit = new Octokit({ auth: token });
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Commit a new blog post to the repository
   */
  async createBlogPost(post: BlogPost): Promise<void> {
    const slug = this.slugify(post.title);
    const fileName = `${post.date}-${slug}.md`;
    const filePath = `content/blog/${fileName}`;
    const content = this.generateFrontmatter(post);
    
    // Convert content to base64
    const contentEncoded = btoa(unescape(encodeURIComponent(content)));

    await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path: filePath,
      message: `Add blog post: ${post.title}`,
      content: contentEncoded,
      committer: {
        name: 'Blog Admin',
        email: 'admin@blog.com',
      },
      author: {
        name: 'Blog Admin',
        email: 'admin@blog.com',
      },
    });
  }
}
```

**Key Points:**
- Uses Octokit REST API client
- Slugifies title for filename
- Base64 encodes content for GitHub API
- Generates YAML frontmatter automatically

## 📚 Content Fetching Logic

Located in: `src/lib/blog.ts`

```typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const blogDirectory = path.join(process.cwd(), 'content/blog');

/**
 * Get all blog posts sorted by date (newest first)
 */
export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(blogDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(blogDirectory);
  const posts = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(blogDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || 'Untitled',
        date: data.date || '',
        description: data.description || '',
      };
    });

  // Sort posts by date (newest first)
  return posts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Get a single blog post by slug
 */
export function getPostBySlug(slug: string): BlogPostFull | null {
  try {
    const fullPath = path.join(blogDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    const html = marked.parse(content);

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || '',
      description: data.description || '',
      content,
      html: typeof html === 'string' ? html : '',
    };
  } catch {
    return null;
  }
}
```

**Key Points:**
- Uses Node.js `fs` module (server-side only)
- `gray-matter` parses YAML frontmatter
- `marked` converts Markdown to HTML
- Automatic date-based sorting

## 🏠 Home Page (List Posts)

Located in: `src/pages/index.astro`

```astro
---
import Layout from '../layouts/Layout.astro';
import { getAllPosts, formatDate } from '../lib/blog';

const posts = getAllPosts();
---

<Layout title="Blog">
  <div class="space-y-16">
    <div>
      <h1 class="text-4xl font-bold tracking-tight mb-4">Posts</h1>
      <p class="text-black/60">Thoughts, stories, and ideas.</p>
    </div>

    {posts.length === 0 ? (
      <div class="text-black/60 text-center py-12">
        <p>No posts yet.</p>
      </div>
    ) : (
      <div class="space-y-12">
        {posts.map((post) => (
          <article class="group">
            <a href={`/blog/${post.slug}`} class="block space-y-2">
              <time class="text-sm text-black/50">{formatDate(post.date)}</time>
              <h2 class="text-2xl font-semibold tracking-tight group-hover:opacity-60 transition">
                {post.title}
              </h2>
              <p class="text-black/70">{post.description}</p>
            </a>
          </article>
        ))}
      </div>
    )}
  </div>
</Layout>
```

## 📄 Blog Post Page

Located in: `src/pages/blog/[slug].astro`

```astro
---
import Layout from '../../layouts/Layout.astro';
import { getAllPosts, getPostBySlug, formatDate } from '../../lib/blog';

export async function getStaticPaths() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
}

const { slug } = Astro.params;
const post = getPostBySlug(slug as string);

if (!post) {
  return Astro.redirect('/404');
}
---

<Layout title={post.title} description={post.description}>
  <article class="prose-custom">
    <header class="mb-12 space-y-4">
      <a href="/" class="text-sm text-black/50 hover:text-black transition">
        ← Back to posts
      </a>
      <time class="block text-sm text-black/50">{formatDate(post.date)}</time>
      <h1 class="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
        {post.title}
      </h1>
    </header>

    <div class="prose" set:html={post.html} />
  </article>
</Layout>
```

**Key Points:**
- `getStaticPaths()` generates all blog post routes at build time
- Uses `set:html` to inject rendered Markdown
- Dynamic routing with `[slug].astro`

## 🔐 Admin Dashboard

Located in: `src/pages/admin.astro`

```astro
<script>
  import { GitHubAPI } from '../lib/github';

  let isAuthenticated = false;
  let githubAPI: GitHubAPI | null = null;

  // Check if already authenticated
  function checkAuth() {
    const token = sessionStorage.getItem('github_token');
    const owner = sessionStorage.getItem('github_owner');
    const repo = sessionStorage.getItem('github_repo');

    if (token && owner && repo) {
      githubAPI = new GitHubAPI(token, owner, repo);
      githubAPI.verifyToken().then((valid) => {
        if (valid) {
          isAuthenticated = true;
          render();
        }
      });
    }
  }

  // Publish handler
  async function handlePublish(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;

    const date = new Date().toISOString().split('T')[0];
    await githubAPI!.createBlogPost({
      title,
      date,
      description,
      content,
    });

    alert('Post published successfully!');
  }
</script>
```

**Key Points:**
- Client-side only (runs in browser)
- Token stored in `sessionStorage` (never in code)
- Validates token before use
- Direct commit to GitHub via API

## ⚙️ Astro Configuration

Located in: `astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://yourusername.github.io',
  base: '/wriddharoy.com',
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  }
});
```

**Important:**
- `site`: Your GitHub Pages URL
- `base`: Repository name (for correct asset paths)
- `output: 'static'`: Generates static HTML files

## 🚀 GitHub Actions Workflow

Located in: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Key Points:**
- Triggers on push to `main` branch
- Builds static site with `npm run build`
- Deploys `./dist` folder to GitHub Pages
- Requires Pages to be enabled with "GitHub Actions" source

## 📝 Blog Post Format

File: `content/blog/YYYY-MM-DD-slug.md`

```markdown
---
title: "Your Post Title"
date: "2024-12-16"
description: "A brief description of your post"
---

# Your Content Here

Write your post using **Markdown** syntax.

## Subheading

- Lists work
- Like this

[Links work too](https://example.com)

\`\`\`javascript
// Code blocks are supported
console.log('Hello, world!');
\`\`\`
```

## 🎨 Styling Approach

The design uses:
- **Tailwind CSS** for utility classes
- **Custom CSS** for prose typography (in blog post page)
- **Monochrome palette** (black/white with opacity variations)
- **System fonts** for maximum performance

Example Tailwind usage:
```html
<h1 class="text-4xl font-bold tracking-tight mb-4">
  Heading
</h1>
```

Example custom prose styles:
```css
.prose :global(h2) {
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-weight: 700;
}
```

---

**Complete file tree:**
```
/
├── content/blog/           ← Markdown blog posts
├── src/
│   ├── lib/
│   │   ├── github.ts       ← GitHub API
│   │   └── blog.ts         ← Content fetching
│   ├── pages/
│   │   ├── index.astro     ← Home page
│   │   ├── admin.astro     ← Admin dashboard
│   │   └── blog/[slug].astro  ← Post page
│   └── layouts/
│       └── Layout.astro    ← Base layout
├── astro.config.mjs        ← Astro config
└── .github/workflows/
    └── deploy.yml          ← Deployment
```
