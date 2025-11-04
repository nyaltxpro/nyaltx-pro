import type { Collection } from "tinacms";

const blog: Collection = {
  name: "blog",
  label: "Blog Posts",
  path: "src/content/blog",
  format: "json",
  ui: {
    router: (args) => {
      const doc = args.document as { slug?: string };
      return `/blog/${doc.slug ?? ''}`;
    },
    filename: {
      slugify: (values) => values?.slug ?? values?.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ?? 'blog-post',
    },
  },
  defaultItem: () => ({
    status: "draft",
    tags: [],
    categories: [],
    publishedAt: new Date().toISOString(),
  }),
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      isTitle: true,
      required: true,
    },
    {
      type: "string",
      name: "slug",
      label: "Slug",
      required: true,
      description: "Used for the blog URL (e.g. /blog/my-post)",
    },
    {
      type: "datetime",
      name: "publishedAt",
      label: "Published Date",
      required: true,
    },
    {
      type: "string",
      name: "author",
      label: "Author",
      required: true,
    },
    {
      type: "string",
      name: "excerpt",
      label: "Excerpt",
      ui: {
        component: "textarea",
      },
    },
    {
      type: "image",
      name: "featuredImage",
      label: "Featured Image",
    },
    {
      type: "string",
      name: "status",
      label: "Status",
      options: [
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
      ],
      ui: {
        defaultValue: "draft",
      },
    },
    {
      type: "string",
      name: "readingTime",
      label: "Estimated Reading Time",
      description: "Optional display value like '6 min read'",
    },
    {
      type: "string",
      name: "categories",
      label: "Categories",
      list: true,
    },
    {
      type: "string",
      name: "tags",
      label: "Tags",
      list: true,
    },
    {
      type: "object",
      name: "seo",
      label: "SEO",
      fields: [
        {
          type: "string",
          name: "metaTitle",
          label: "Meta Title",
        },
        {
          type: "string",
          name: "metaDescription",
          label: "Meta Description",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "image",
          name: "ogImage",
          label: "Open Graph Image",
        },
        {
          type: "string",
          name: "keywords",
          label: "Keywords (comma separated)",
        },
      ],
    },
    {
      type: "rich-text",
      name: "content",
      label: "Content",
      required: true,
    },
  ],
};

export default blog;
