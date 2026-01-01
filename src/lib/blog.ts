import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

export interface BlogPostMeta {
  title: string;
  date: string;
  description: string;
  slug: string;
}

export interface BlogPostFull extends BlogPostMeta {
  content: string;
  html: string;
}

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

  // Sort posts by date/time (newest first)
  // Handle both date-only (YYYY-MM-DD) and datetime (ISO) formats
  return posts.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    // If dates are equal, use file modification time as tiebreaker
    if (dateA === dateB) {
      try {
        const fileA = path.join(blogDirectory, `${a.slug}.md`);
        const fileB = path.join(blogDirectory, `${b.slug}.md`);
        const statsA = fs.statSync(fileA);
        const statsB = fs.statSync(fileB);
        return statsB.mtime.getTime() - statsA.mtime.getTime();
      } catch {
        // If file stats can't be read, maintain current order
        return 0;
      }
    }
    
    return dateB - dateA;
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

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
