#!/usr/bin/env node
/**
 * RAG Sync Script
 * 
 * This script runs before Docusaurus build to sync documentation content
 * to the backend vector database for RAG (Retrieval-Augmented Generation).
 * 
 * Features:
 * - Reads all .md/.mdx files from docs/ and blog/ directories
 * - Strips Markdown formatting, code blocks, frontmatter
 * - Sends plain text content to backend API
 * - Supports Cloudflare Access authentication
 * 
 * Required Environment Variables:
 * - RAG_SYNC_KEY: API key for backend authentication
 * - CF_CLIENT_ID: Cloudflare Access Client ID (for CF protected backends)
 * - CF_CLIENT_SECRET: Cloudflare Access Client Secret
 * - BACKEND_URL: Backend API URL (defaults to https://api.yiw.me)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PORTFOLIO_ROOT = path.resolve(ROOT_DIR, '..');

// Configuration
const CONFIG = {
  backendUrl: process.env.BACKEND_URL || 'https://papi.yiw.me',
  syncKey: process.env.RAG_SYNC_KEY,
  cfClientId: process.env.CF_CLIENT_ID,
  cfClientSecret: process.env.CF_CLIENT_SECRET,
  docsDir: path.join(ROOT_DIR, 'docs'),
  blogDir: path.join(ROOT_DIR, 'blog'),
  profileJsonPath: path.join(PORTFOLIO_ROOT, 'frontend', 'src', 'data', 'profile.json'),
  extensions: ['.md', '.mdx'],
  // Skip files that shouldn't be synced
  skipPatterns: [
    /node_modules/,
    /\.docusaurus/,
    /build/,
    /_category_\.json/,
  ],
};

/**
 * Remove Markdown/MDX formatting and extract plain text
 */
function stripMarkdown(content) {
  let text = content;

  // Remove frontmatter (YAML between ---)
  text = text.replace(/^---[\s\S]*?---\n*/m, '');

  // Remove MDX imports and exports
  text = text.replace(/^import\s+.*$/gm, '');
  text = text.replace(/^export\s+.*$/gm, '');

  // Remove code blocks (```...```)
  text = text.replace(/```[\s\S]*?```/g, '[code block]');

  // Remove inline code (`...`)
  text = text.replace(/`[^`]+`/g, '');

  // Remove JSX/HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Remove MDX components like {/* ... */}
  text = text.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Remove Mermaid diagrams content
  text = text.replace(/```mermaid[\s\S]*?```/g, '[diagram]');

  // Remove admonitions syntax but keep content
  text = text.replace(/:::(tip|note|info|warning|danger|caution)\s*/gi, '');
  text = text.replace(/:::/g, '');

  // Remove images ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // Convert links [text](url) to just text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove bold **text** or __text__
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');

  // Remove italic *text* or _text_
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');

  // Remove strikethrough ~~text~~
  text = text.replace(/~~([^~]+)~~/g, '$1');

  // Remove headers # ## ### etc, but keep the text
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove blockquotes >
  text = text.replace(/^>\s*/gm, '');

  // Remove horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');

  // Remove table formatting but try to keep content readable
  text = text.replace(/\|/g, ' ');
  text = text.replace(/^[-:|\s]+$/gm, '');

  // Remove list markers
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s]*\d+\.\s+/gm, '');

  // Clean up multiple newlines
  text = text.replace(/\n{3,}/g, '\n\n');

  // Clean up multiple spaces
  text = text.replace(/[ \t]+/g, ' ');

  // Trim whitespace
  text = text.trim();

  return text;
}

/**
 * Extract title from frontmatter or first heading
 */
function extractTitle(content, filePath) {
  // Try to get title from frontmatter
  const frontmatterMatch = content.match(/^---[\s\S]*?title:\s*["']?([^"'\n]+)["']?[\s\S]*?---/m);
  if (frontmatterMatch) {
    return frontmatterMatch[1].trim();
  }

  // Try to get first heading
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }

  // Fall back to filename
  return path.basename(filePath, path.extname(filePath));
}

/**
 * Recursively find all markdown files in a directory
 */
function findMarkdownFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Check if should skip
    if (CONFIG.skipPatterns.some(pattern => pattern.test(fullPath))) {
      continue;
    }

    if (entry.isDirectory()) {
      findMarkdownFiles(fullPath, files);
    } else if (entry.isFile() && CONFIG.extensions.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Parse profile.json and convert to plain text documents
 * This extracts structured data from the portfolio profile and converts
 * it into searchable plain text for the RAG system.
 */
function parseProfileJson() {
  const documents = [];
  
  if (!fs.existsSync(CONFIG.profileJsonPath)) {
    console.log('   ⚠️  Profile JSON not found, skipping...');
    return documents;
  }

  try {
    const profileContent = fs.readFileSync(CONFIG.profileJsonPath, 'utf-8');
    const profile = JSON.parse(profileContent);

    // 1. About section
    if (profile.about) {
      const about = profile.about;
      let aboutText = `About Yi Wang\n\n`;
      aboutText += `Name: ${about.name}\n`;
      aboutText += `Role: ${about.role}\n`;
      aboutText += `Location: ${about.location}\n`;
      aboutText += `Experience: ${about.experience} years\n`;
      aboutText += `Tagline: ${about.tagline}\n\n`;
      aboutText += `Bio: ${about.bio}\n\n`;
      
      if (about.focusAreas) {
        aboutText += `Focus Areas:\n`;
        for (const area of about.focusAreas) {
          aboutText += `- ${area.title}: ${area.description}. Technologies: ${area.tags.join(', ')}\n`;
        }
      }
      
      if (about.socials) {
        aboutText += `\nContact:\n`;
        aboutText += `- GitHub: ${about.socials.github}\n`;
        aboutText += `- LinkedIn: ${about.socials.linkedin}\n`;
        aboutText += `- Email: ${about.socials.email}\n`;
      }
      
      documents.push({
        path: 'profile/about.json',
        content: aboutText,
        title: 'About Yi Wang',
      });
    }

    // 2. Education section
    if (profile.education && profile.education.length > 0) {
      let eduText = `Yi Wang's Education\n\n`;
      for (const edu of profile.education) {
        eduText += `${edu.degree} at ${edu.school} (${edu.period})\n`;
      }
      
      documents.push({
        path: 'profile/education.json',
        content: eduText,
        title: 'Education',
      });
    }

    // 3. Experience section
    if (profile.experience && profile.experience.length > 0) {
      let expText = `Yi Wang's Work Experience\n\n`;
      for (const exp of profile.experience) {
        expText += `${exp.title} at ${exp.company} (${exp.period})\n`;
        expText += `Location: ${exp.location}\n`;
        expText += `Technologies: ${exp.tech.join(', ')}\n`;
        expText += `Key Achievements:\n`;
        for (const achievement of exp.achievements) {
          expText += `- ${achievement}\n`;
        }
        expText += `\n`;
      }
      
      documents.push({
        path: 'profile/experience.json',
        content: expText,
        title: 'Work Experience',
      });
    }

    // 4. Projects section
    if (profile.projects && profile.projects.length > 0) {
      let projText = `Yi Wang's Projects\n\n`;
      for (const proj of profile.projects) {
        projText += `Project: ${proj.title}\n`;
        projText += `Summary: ${proj.summary}\n`;
        projText += `Technologies: ${proj.tech.join(', ')}\n`;
        if (proj.metrics) {
          projText += `Metrics: ${Object.entries(proj.metrics).map(([k, v]) => `${k}: ${v}`).join(', ')}\n`;
        }
        projText += `\n`;
      }
      
      documents.push({
        path: 'profile/projects.json',
        content: projText,
        title: 'Projects Portfolio',
      });
    }

    // 5. Technical Skills (from modules)
    if (profile.modules && profile.modules.length > 0) {
      let skillsText = `Yi Wang's Technical Skills\n\n`;
      for (const mod of profile.modules) {
        skillsText += `${mod.category}:\n`;
        for (const item of mod.items) {
          skillsText += `- ${item.name} (${item.version}) - ${item.status}\n`;
        }
        skillsText += `\n`;
      }
      
      documents.push({
        path: 'profile/skills.json',
        content: skillsText,
        title: 'Technical Skills',
      });
    }

    // 6. Certifications
    if (profile.certifications && profile.certifications.length > 0) {
      let certText = `Yi Wang's Certifications\n\n`;
      for (const cert of profile.certifications) {
        certText += `${cert.name} - ${cert.provider} (${cert.date})\n`;
      }
      
      documents.push({
        path: 'profile/certifications.json',
        content: certText,
        title: 'Certifications',
      });
    }

    // 7. Coursework
    if (profile.coursework && profile.coursework.length > 0) {
      let courseText = `Yi Wang's Coursework\n\n`;
      
      // Group by type
      const coursesByType = {};
      for (const course of profile.coursework) {
        if (!coursesByType[course.type]) {
          coursesByType[course.type] = [];
        }
        coursesByType[course.type].push(course);
      }
      
      for (const [type, courses] of Object.entries(coursesByType)) {
        courseText += `${type}:\n`;
        for (const course of courses) {
          courseText += `- ${course.name} (${course.provider}) - Grade: ${course.grade}\n`;
        }
        courseText += `\n`;
      }
      
      documents.push({
        path: 'profile/coursework.json',
        content: courseText,
        title: 'Academic Coursework',
      });
    }

    console.log(`   ✅ Parsed profile.json: ${documents.length} sections`);
    return documents;
    
  } catch (error) {
    console.error(`   ❌ Error parsing profile.json:`, error.message);
    return documents;
  }
}


/**
 * Send documents to backend
 */
async function syncToBackend(documents) {
  const url = `${CONFIG.backendUrl}/api/v1/rag/sync`;
  
  console.log(`\n📤 Sending ${documents.length} documents to ${url}`);

  const headers = {
    'Content-Type': 'application/json',
    'X-SYNC-KEY': CONFIG.syncKey,
  };

  // Add Cloudflare Access headers if configured
  if (CONFIG.cfClientId && CONFIG.cfClientSecret) {
    headers['CF-Access-Client-Id'] = CONFIG.cfClientId;
    headers['CF-Access-Client-Secret'] = CONFIG.cfClientSecret;
    console.log('   🔐 Using Cloudflare Access authentication');
  } else {
    console.log('   ⚠️  No Cloudflare Access credentials configured');
    console.log('      Set CF_CLIENT_ID and CF_CLIENT_SECRET if backend is behind CF Access');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(documents),
    });

    // Check content type before parsing
    const contentType = response.headers.get('content-type') || '';
    
    if (!contentType.includes('application/json')) {
      // Response is not JSON - likely an HTML error page
      const text = await response.text();
      
      // Check if it's a Cloudflare Access block
      if (text.includes('Cloudflare') || text.includes('Access denied') || text.includes('<!DOCTYPE')) {
        throw new Error(
          `Cloudflare Access blocked the request.\n` +
          `   Status: ${response.status}\n` +
          `   Make sure CF_CLIENT_ID and CF_CLIENT_SECRET are set in Vercel environment variables.\n` +
          `   You can get a Service Token from: Cloudflare Zero Trust > Access > Service Auth`
        );
      }
      
      throw new Error(`Backend returned non-JSON response (${response.status}): ${text.substring(0, 200)}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${data.message || JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    if (error.cause?.code === 'ECONNREFUSED') {
      throw new Error(`Cannot connect to backend at ${CONFIG.backendUrl}. Is the server running?`);
    }
    throw error;
  }
}

/**
 * Main sync function
 */
async function main() {
  console.log('🔄 RAG Sync Script Starting...\n');

  // Validate configuration
  if (!CONFIG.syncKey) {
    console.warn('⚠️  RAG_SYNC_KEY not set. Skipping RAG sync.');
    console.log('   Set RAG_SYNC_KEY environment variable to enable sync.\n');
    process.exit(0);
  }

  // Find all markdown files
  console.log('📁 Scanning for documents...');
  const docsFiles = findMarkdownFiles(CONFIG.docsDir);
  const blogFiles = findMarkdownFiles(CONFIG.blogDir);
  const allFiles = [...docsFiles, ...blogFiles];

  console.log(`   Found ${docsFiles.length} docs and ${blogFiles.length} blog posts`);
  console.log(`   Total: ${allFiles.length} files\n`);

  if (allFiles.length === 0) {
    console.log('ℹ️  No documents found to sync.');
    process.exit(0);
  }

  // Process each file
  const documents = [];
  
  for (const filePath of allFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(ROOT_DIR, filePath);
      const title = extractTitle(content, filePath);
      const plainText = stripMarkdown(content);

      // Skip empty documents
      if (plainText.length < 50) {
        console.log(`   ⏭️  Skipping (too short): ${relativePath}`);
        continue;
      }

      documents.push({
        path: relativePath,
        content: plainText,
        title: title,
      });

      console.log(`   ✅ Processed: ${relativePath} (${plainText.length} chars)`);
    } catch (error) {
      console.error(`   ❌ Error processing ${filePath}:`, error.message);
    }
  }

  // Process profile.json from frontend
  console.log('\n📋 Processing profile.json...');
  const profileDocuments = parseProfileJson();
  documents.push(...profileDocuments);

  console.log(`\n📊 Processed ${documents.length} documents total`);
  console.log(`   - Markdown files: ${documents.length - profileDocuments.length}`);
  console.log(`   - Profile sections: ${profileDocuments.length}`);

  if (documents.length === 0) {
    console.log('ℹ️  No documents to sync after processing.');
    process.exit(0);
  }

  // Sync to backend
  try {
    const result = await syncToBackend(documents);
    console.log('\n✅ RAG Sync Complete!');
    console.log(`   Message: ${result.message}`);
    console.log(`   Chunks stored: ${result.chunksStored}`);
  } catch (error) {
    console.error('\n❌ RAG Sync Failed:', error.message);
    // Don't fail the build if sync fails
    if (process.env.RAG_SYNC_REQUIRED === 'true') {
      process.exit(1);
    } else {
      console.log('   Continuing with build anyway...');
    }
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
