import { Octokit } from '@octokit/rest';

export interface BlogPost {
  title: string;
  date: string;
  description: string;
  content: string;
}

export interface BlogPostFile {
  path: string;
  sha: string;
  title: string;
  date: string;
  description: string;
  content: string;
}

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
   * Create a slug from a title
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Generate frontmatter for the blog post
   */
  private generateFrontmatter(post: BlogPost): string {
    return `---
title: "${post.title}"
date: "${post.date}"
description: "${post.description}"
---

${post.content}`;
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

    try {
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
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  /**
   * Verify the token is valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      await this.octokit.users.getAuthenticated();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all blog posts from the repository
   */
  async getBlogPosts(): Promise<BlogPostFile[]> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: 'content/blog',
      });

      if (!Array.isArray(data)) {
        return [];
      }

      const posts: BlogPostFile[] = [];

      for (const file of data) {
        if (file.type === 'file' && file.name.endsWith('.md')) {
          try {
            const post = await this.getBlogPost(file.path);
            if (post) {
              posts.push(post);
            }
          } catch (error) {
            console.error(`Error fetching post ${file.path}:`, error);
          }
        }
      }

      // Sort by date (newest first)
      return posts.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    } catch (error) {
      console.error('Error getting blog posts:', error);
      throw error;
    }
  }

  /**
   * Get a single blog post by file path
   */
  async getBlogPost(filePath: string): Promise<BlogPostFile | null> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
      });

      if ('content' in data && 'sha' in data) {
        // Decode base64 content
        const content = atob(data.content.replace(/\n/g, ''));
        
        // Parse frontmatter
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);

        if (match) {
          const frontmatter = match[1];
          const postContent = match[2];

          // Parse YAML frontmatter (simple parsing)
          const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
          const dateMatch = frontmatter.match(/date:\s*"([^"]+)"/);
          const descMatch = frontmatter.match(/description:\s*"([^"]+)"/);

          return {
            path: filePath,
            sha: data.sha,
            title: titleMatch ? titleMatch[1] : 'Untitled',
            date: dateMatch ? dateMatch[1] : '',
            description: descMatch ? descMatch[1] : '',
            content: postContent.trim(),
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting blog post:', error);
      return null;
    }
  }

  /**
   * Update an existing blog post
   */
  async updateBlogPost(
    filePath: string,
    post: BlogPost,
    sha: string
  ): Promise<void> {
    const content = this.generateFrontmatter(post);
    const contentEncoded = btoa(unescape(encodeURIComponent(content)));

    try {
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: `Update blog post: ${post.title}`,
        content: contentEncoded,
        sha: sha, // Required for updates
        committer: {
          name: 'Blog Admin',
          email: 'admin@blog.com',
        },
        author: {
          name: 'Blog Admin',
          email: 'admin@blog.com',
        },
      });
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  }

  /**
   * Delete a blog post
   */
  async deleteBlogPost(filePath: string, sha: string): Promise<void> {
    try {
      await this.octokit.repos.deleteFile({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: `Delete blog post: ${filePath}`,
        sha: sha,
        committer: {
          name: 'Blog Admin',
          email: 'admin@blog.com',
        },
        author: {
          name: 'Blog Admin',
          email: 'admin@blog.com',
        },
      });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }
  }
}
