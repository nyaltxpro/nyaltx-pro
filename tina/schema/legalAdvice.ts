import type { Collection } from "tinacms";

export const legalAdvice: Collection = {
  name: "legalAdvice",
  label: "Legal Advice Page",
  path: "content/pages",
  format: "json",
  fields: [
    {
      name: "slug",
      label: "Slug",
      type: "string",
      required: true,
      description: "URL slug for the page, e.g., 'legal-advice'"
    },
    {
      name: "tagline",
      label: "Tagline",
      type: "string",
      description: "Short tagline displayed at the top of the page"
    },
    {
      name: "title",
      label: "Title",
      type: "string",
      description: "Main heading of the Legal Advice page"
    },
    {
      name: "description",
      label: "Description",
      type: "string",
      ui: {
        component: "textarea",
      },
      description: "Short description displayed under the title"
    },
    {
      name: "body",
      label: "Body Content",
      type: "rich-text",
      isBody: true,
      description: "Main content of the page, supports rich text formatting"
    },
    {
      name: "seo",
      label: "SEO Settings",
      type: "object",
      fields: [
        { name: "metaTitle", label: "Meta Title", type: "string" },
        { name: "metaDescription", label: "Meta Description", type: "string", ui: { component: "textarea" } },
        { name: "keywords", label: "Keywords", type: "string" },
        { name: "ogImage", label: "OG Image", type: "image" },
      ],
    },
  ],
};
