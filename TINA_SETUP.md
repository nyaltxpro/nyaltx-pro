# Tina CMS Setup Guide

This document explains how to use Tina CMS in the NYALTX project.

## Overview

Tina CMS is a Git-based headless CMS that provides a visual editing interface for your content. It's been integrated into this project to manage:

- **Blog Posts** - Articles and announcements
- **Pages** - Static pages like About, FAQ, etc.
- **Announcements** - Platform-wide notifications
- **Featured Tokens** - Highlighted tokens on the platform

## Getting Started

### 1. Environment Variables

Create or update your `.env.local` file with the following variables:

```bash
# Tina CMS Configuration
NEXT_PUBLIC_TINA_CLIENT_ID=your_client_id_from_tina_io
TINA_TOKEN=your_token_from_tina_io

# Optional: GitHub integration
GITHUB_BRANCH=main
```

To get your Client ID and Token:
1. Go to [tina.io](https://tina.io)
2. Sign up or log in
3. Create a new project or connect to your GitHub repository
4. Copy the Client ID and Token from your project settings

### 2. Running in Development

Start the development server with Tina CMS:

```bash
npm run dev
```

This will:
- Start the Next.js development server
- Launch Tina's GraphQL server
- Enable the visual editing interface

### 3. Accessing the CMS

#### Admin Interface
Navigate to [http://localhost:3000/admin](http://localhost:3000/admin) to access the Tina CMS admin panel.

#### Visual Editing (Coming Soon)
You can enable visual editing on content pages by adding the Tina provider to specific pages.

## Content Structure

### Blog Posts
**Location**: `content/posts/*.mdx`

Fields:
- Title (required)
- Description
- Hero Image
- Date (required)
- Author (required)
- Category (crypto, trading, news, tutorial)
- Tags (array)
- Body (MDX content)

### Pages
**Location**: `content/pages/*.mdx`

Fields:
- Title (required)
- Description
- Body (MDX content)

### Announcements
**Location**: `content/announcements/*.json`

Fields:
- Title (required)
- Message (required)
- Start Date (required)
- End Date
- Active (boolean)
- Type (info, warning, success, error)
- Link URL

### Featured Tokens
**Location**: `content/tokens/*.json`

Fields:
- Token Name (required)
- Symbol (required)
- Description
- Logo (required)
- Contract Address (required)
- Chain (ethereum, bsc, polygon, solana, arbitrum, optimism)
- Website
- Twitter
- Telegram
- Featured (boolean)
- Display Order

## Scripts

### Development
```bash
npm run dev              # Start Next.js with Tina
npm run tina:dev         # Start only Tina GraphQL server
```

### Build
```bash
npm run build            # Build Next.js with Tina build
npm run tina:build       # Build only Tina schema
```

### Initialization
```bash
npm run tina:init        # Initialize Tina CMS (first-time setup)
```

## File Structure

```
/
├── tina/
│   └── config.ts        # Tina CMS configuration
├── content/
│   ├── posts/           # Blog posts (MDX)
│   ├── pages/           # Static pages (MDX)
│   ├── announcements/   # Platform announcements (JSON)
│   └── tokens/          # Featured tokens (JSON)
├── public/
│   ├── admin/           # Generated Tina admin UI (auto-generated)
│   └── uploads/         # Media uploads from Tina
└── src/
    ├── app/admin/       # Admin page route
    └── components/
        └── TinaProvider.tsx  # Tina context provider
```

## Configuration

The Tina configuration is located at `tina/config.ts`. You can customize:

- **Collections**: Add or modify content types
- **Fields**: Define the structure of your content
- **Media**: Configure image upload settings
- **Branch**: Set which Git branch to use

## Deployment

### Vercel / Netlify
1. Add environment variables to your deployment platform
2. Tina will automatically build during deployment
3. Admin interface will be available at `/admin`

### Production Considerations
- Set `NEXT_PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN` in production environment
- Configure proper authentication for the admin panel
- Set up proper Git branch management

## Content Workflow

1. **Create Content**: Use the admin panel to create/edit content
2. **Preview**: Changes are immediately visible in development
3. **Save**: Content is saved to your Git repository
4. **Deploy**: Push changes to deploy to production

## Troubleshooting

### Tina Admin Panel Not Loading
- Check that environment variables are set correctly
- Ensure Tina GraphQL server is running
- Clear browser cache and restart dev server

### Content Not Updating
- Check that content files are in the correct location
- Verify file format (MDX for posts/pages, JSON for announcements/tokens)
- Restart dev server to rebuild GraphQL schema

### Build Errors
- Run `npm run tina:build` separately to see detailed errors
- Check that all required fields are filled in content files
- Verify image paths in content match actual files

## Resources

- [Tina CMS Documentation](https://tina.io/docs/)
- [Tina CMS Discord Community](https://discord.com/invite/zumN63Ybpf)
- [GitHub Repository](https://github.com/tinacms/tinacms)

## Support

For NYALTX-specific Tina integration questions, contact the development team.
For general Tina CMS questions, visit [tina.io/docs](https://tina.io/docs) or join their Discord community.
