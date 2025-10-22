import { Collection } from "tinacms";

export const privacyPolicy: Collection= {

      name: "privacyPolicy",
      label: "Privacy Policy",
      path: "/src/content/privacypolicy",
      format: "json",
      fields: [
        {
          type: "string",
          name: "slug",
          label: "Slug",
        },
        {
          type: "string",
          name: "title",
          label: "Title",
        },
        {
          type: "string",
          name: "description",
          label: "Description",
        },
        {
          type: "object",
          name: "hero",
          label: "Hero Section",
          fields: [
            { type: "string", name: "title", label: "Title" },
            { type: "string", name: "subtitle", label: "Subtitle" },
            { type: "image", name: "backgroundImage", label: "Background Image" },
          ],
        },
        {
          type: "rich-text",
          name: "content",
          label: "Content",
        },
        {
          type: "object",
          name: "seo",
          label: "SEO",
          fields: [
            { type: "string", name: "metaTitle", label: "Meta Title" },
            { type: "string", name: "metaDescription", label: "Meta Description" },
            { type: "string", name: "keywords", label: "Keywords" },
            { type: "image", name: "ogImage", label: "OG Image" },
          ],
        },
      ],
    
  
};
