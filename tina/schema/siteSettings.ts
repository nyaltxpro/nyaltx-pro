import type { Collection } from 'tinacms';

export const siteSettings: Collection = {
  name: 'siteSettings',
  label: 'Site SEO Settings',
  path: 'content/site-settings',
  format: 'json',
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
  },
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Site Title',
      required: true,
      description: 'Used for browser tab title and Open Graph title',
    },
    {
      type: 'string',
      name: 'description',
      label: 'Site Description',
      required: true,
      ui: {
        component: 'textarea',
      },
      description: 'Meta description and Open Graph description',
    },
    {
      type: 'string',
      name: 'keywords',
      label: 'Keywords',
      description: 'Comma-separated SEO keywords',
    },
    {
      type: 'string',
      name: 'authors',
      label: 'Authors',
      description: 'Author name shown in metadata (e.g. NYALTX Team)',
    },
    {
      type: 'string',
      name: 'creator',
      label: 'Creator',
      description: 'Creator metadata field',
    },
    {
      type: 'string',
      name: 'publisher',
      label: 'Publisher',
      description: 'Publisher metadata field',
    },
    {
      type: 'string',
      name: 'siteName',
      label: 'Open Graph Site Name',
    },
    {
      type: 'image',
      name: 'ogImage',
      label: 'OG / Favicon Image',
      description: 'Image used for social shares and icons',
    },
    {
      type: 'string',
      name: 'twitterSite',
      label: 'Twitter Site Handle',
      description: 'e.g. @nyaltx',
    },
    {
      type: 'string',
      name: 'twitterCreator',
      label: 'Twitter Creator Handle',
      description: 'e.g. @nyaltx',
    },
  ],
};

export default siteSettings;
