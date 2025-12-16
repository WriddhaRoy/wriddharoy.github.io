import { Octokit } from '@octokit/rest';

export interface BlogPost {
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
}
