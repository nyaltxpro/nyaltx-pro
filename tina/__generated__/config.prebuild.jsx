// tina/config.ts
import { defineConfig } from "tinacms";

// tina/schema/aboutus.ts
var aboutUs = {
  name: "aboutUs",
  label: "About Us Page",
  path: "src/content/aboutus",
  format: "json",
  fields: [
    {
      name: "slug",
      label: "Slug",
      type: "string",
      required: true,
      description: "URL slug for the page"
    },
    {
      name: "meta",
      label: "Metadata",
      type: "object",
      fields: [
        {
          name: "title",
          label: "Title",
          type: "string",
          required: true
        },
        {
          name: "description",
          label: "Description",
          type: "string",
          ui: { component: "textarea" }
        },
        {
          name: "lastUpdated",
          label: "Last Updated",
          type: "datetime",
          required: true
        },
        {
          name: "version",
          label: "Version",
          type: "string"
        }
      ]
    },
    {
      name: "hero",
      label: "Hero Section",
      type: "object",
      fields: [
        {
          name: "badge",
          label: "Badge",
          type: "object",
          fields: [
            {
              name: "icon",
              label: "Icon",
              type: "string",
              description: "React Icon name, e.g., 'FiUsers'"
            },
            {
              name: "text",
              label: "Text",
              type: "string"
            }
          ]
        },
        {
          name: "title",
          label: "Title",
          type: "object",
          fields: [
            {
              name: "text",
              label: "Text",
              type: "string",
              required: true
            },
            {
              name: "gradient",
              label: "Gradient Classes",
              type: "string",
              description: "Tailwind gradient classes"
            }
          ]
        },
        {
          name: "description",
          label: "Description",
          type: "string",
          ui: { component: "textarea" }
        }
      ]
    },
    {
      name: "content",
      label: "Page Content",
      type: "object",
      fields: [
        {
          name: "sections",
          label: "Content Sections",
          type: "object",
          list: true,
          fields: [
            {
              name: "id",
              label: "Section ID",
              type: "string",
              required: true
            },
            {
              name: "icon",
              label: "Section Icon",
              type: "string",
              description: "React Icon name (optional), e.g., 'FiTarget', 'FiCpu'"
            },
            {
              name: "title",
              label: "Section Title",
              type: "string",
              required: true
            },
            {
              name: "type",
              label: "Section Type",
              type: "string",
              options: ["default", "highlight", "warning"],
              description: "Visual style of the section"
            },
            {
              name: "paragraphs",
              label: "Paragraphs",
              type: "string",
              list: true,
              ui: { component: "textarea" },
              description: "Array of paragraph texts"
            },
            {
              name: "contactInfo",
              label: "Contact Information",
              type: "object",
              list: true,
              description: "Optional contact details for contact sections",
              fields: [
                {
                  name: "label",
                  label: "Label",
                  type: "string",
                  description: "e.g., 'Email', 'Twitter'"
                },
                {
                  name: "value",
                  label: "Value",
                  type: "string",
                  description: "e.g., 'info@nyaltx.pro', '@nyaltx'"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: "seo",
      label: "SEO Settings",
      type: "object",
      fields: [
        {
          name: "metaTitle",
          label: "Meta Title",
          type: "string",
          required: true
        },
        {
          name: "metaDescription",
          label: "Meta Description",
          type: "string",
          ui: { component: "textarea" },
          required: true
        },
        {
          name: "keywords",
          label: "Keywords",
          type: "string",
          description: "Comma-separated keywords"
        },
        {
          name: "canonical",
          label: "Canonical URL",
          type: "string"
        }
      ]
    }
  ]
};

// tina/schema/generalstatment.ts
var generalStatement = {
  label: "General Statement Page",
  name: "generalStatement",
  path: "src/content/generalstatement",
  format: "json",
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
      required: true
    },
    {
      type: "string",
      name: "tagline",
      label: "Tagline"
    },
    {
      type: "string",
      name: "description",
      label: "Description",
      ui: { component: "textarea" }
    },
    {
      type: "string",
      name: "badges",
      label: "Badges",
      list: true
    },
    {
      type: "object",
      name: "sections",
      label: "Sections",
      list: true,
      fields: [
        {
          type: "string",
          name: "heading",
          label: "Heading"
        },
        {
          type: "string",
          name: "icon",
          label: "Icon (optional)"
        },
        {
          type: "object",
          name: "subsections",
          label: "Subsections",
          list: true,
          fields: [
            { type: "string", name: "title", label: "Subsection Title" },
            {
              type: "string",
              name: "content",
              label: "Content",
              ui: { component: "textarea" }
            }
          ]
        },
        {
          type: "string",
          name: "content",
          label: "Content",
          ui: { component: "textarea" }
        },
        {
          type: "string",
          name: "list",
          label: "List Items",
          list: true
        }
      ]
    }
  ]
};
var generalstatment_default = generalStatement;

// tina/schema/governa.ts
var governa = {
  name: "governa",
  label: "Governa Landing Page",
  path: "content/public-pages",
  format: "json",
  ui: {
    allowedActions: {
      create: false,
      delete: false
    }
  },
  fields: [
    {
      type: "string",
      name: "slug",
      label: "Slug",
      isTitle: true,
      required: true
    },
    {
      type: "string",
      name: "title",
      label: "Page Title",
      required: true
    },
    {
      type: "string",
      name: "description",
      label: "Page Description",
      ui: {
        component: "textarea"
      }
    },
    {
      type: "object",
      name: "nav",
      label: "Navigation",
      fields: [
        {
          type: "string",
          name: "brandText",
          label: "Brand Text"
        },
        {
          type: "string",
          name: "brandHref",
          label: "Brand Link"
        },
        {
          type: "string",
          name: "ctaText",
          label: "CTA Text"
        },
        {
          type: "string",
          name: "ctaHref",
          label: "CTA Link"
        }
      ]
    },
    {
      type: "object",
      name: "hero",
      label: "Hero Section",
      fields: [
        {
          type: "string",
          name: "eyebrow",
          label: "Eyebrow Label"
        },
        {
          type: "string",
          name: "heading",
          label: "Heading",
          required: true
        },
        {
          type: "string",
          name: "highlight",
          label: "Highlight Text"
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          ui: {
            component: "textarea"
          }
        },
        {
          type: "object",
          name: "primaryCta",
          label: "Primary CTA",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Label"
            },
            {
              type: "string",
              name: "href",
              label: "Link"
            }
          ]
        },
        {
          type: "object",
          name: "secondaryCta",
          label: "Secondary CTA",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Label"
            },
            {
              type: "string",
              name: "href",
              label: "Link"
            }
          ]
        },
        {
          type: "object",
          name: "floatingCards",
          label: "Floating Cards",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item?.alt || item?.image || "Floating Card"
            })
          },
          fields: [
            {
              type: "image",
              name: "image",
              label: "Image"
            },
            {
              type: "string",
              name: "alt",
              label: "Alt Text"
            },
            {
              type: "number",
              name: "width",
              label: "Width"
            },
            {
              type: "number",
              name: "height",
              label: "Height"
            }
          ]
        }
      ]
    },
    {
      type: "object",
      name: "comparisonSection",
      label: "Comparison Section",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Section Title"
        },
        {
          type: "object",
          name: "withGovernance",
          label: "With Governance Card",
          fields: [
            {
              type: "string",
              name: "title",
              label: "Card Title"
            },
            {
              type: "string",
              name: "icon",
              label: "Icon Text"
            },
            {
              type: "object",
              name: "benefits",
              label: "Benefits",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "text",
                  label: "Benefit",
                  ui: {
                    component: "textarea"
                  }
                }
              ]
            }
          ]
        },
        {
          type: "object",
          name: "withoutGovernance",
          label: "Without Governance Card",
          fields: [
            {
              type: "string",
              name: "title",
              label: "Card Title"
            },
            {
              type: "string",
              name: "icon",
              label: "Icon Text"
            },
            {
              type: "object",
              name: "benefits",
              label: "Benefits",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "text",
                  label: "Benefit",
                  ui: {
                    component: "textarea"
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      type: "object",
      name: "ctaSection",
      label: "CTA Section",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Title"
        },
        {
          type: "string",
          name: "subtitle",
          label: "Subtitle",
          ui: {
            component: "textarea"
          }
        },
        {
          type: "object",
          name: "primaryCta",
          label: "Primary CTA",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Label"
            },
            {
              type: "string",
              name: "href",
              label: "Link"
            }
          ]
        },
        {
          type: "object",
          name: "secondaryCta",
          label: "Secondary CTA",
          fields: [
            {
              type: "string",
              name: "label",
              label: "Label"
            },
            {
              type: "string",
              name: "href",
              label: "Link"
            }
          ]
        }
      ]
    },
    {
      type: "object",
      name: "seo",
      label: "SEO",
      fields: [
        {
          type: "string",
          name: "metaTitle",
          label: "Meta Title"
        },
        {
          type: "string",
          name: "metaDescription",
          label: "Meta Description"
        },
        {
          type: "string",
          name: "twitterTitle",
          label: "Twitter Title"
        },
        {
          type: "string",
          name: "twitterDescription",
          label: "Twitter Description"
        },
        {
          type: "image",
          name: "ogImage",
          label: "OG Image"
        }
      ]
    }
  ]
};
var governa_default = governa;

// tina/schema/legalAdvice.ts
var legalAdvice = {
  name: "legalAdvice",
  label: "Legal Advice Page",
  path: "src/content/legaladvice",
  format: "json",
  fields: [
    {
      name: "slug",
      label: "Slug",
      type: "string",
      required: true,
      description: "URL slug for the page"
    },
    {
      name: "meta",
      label: "Metadata",
      type: "object",
      fields: [
        {
          name: "title",
          label: "Title",
          type: "string",
          required: true
        },
        {
          name: "description",
          label: "Description",
          type: "string",
          ui: { component: "textarea" }
        },
        {
          name: "lastUpdated",
          label: "Last Updated",
          type: "datetime",
          required: true
        },
        {
          name: "version",
          label: "Version",
          type: "string"
        }
      ]
    },
    {
      name: "hero",
      label: "Hero Section",
      type: "object",
      fields: [
        {
          name: "badge",
          label: "Badge",
          type: "object",
          fields: [
            {
              name: "icon",
              label: "Icon",
              type: "string",
              description: "React Icon name, e.g., 'FiShield'"
            },
            {
              name: "text",
              label: "Text",
              type: "string"
            }
          ]
        },
        {
          name: "title",
          label: "Title",
          type: "object",
          fields: [
            {
              name: "text",
              label: "Text",
              type: "string",
              required: true
            },
            {
              name: "gradient",
              label: "Gradient Classes",
              type: "string",
              description: "Tailwind gradient classes"
            }
          ]
        },
        {
          name: "description",
          label: "Description",
          type: "string",
          ui: { component: "textarea" }
        }
      ]
    },
    {
      name: "content",
      label: "Page Content",
      type: "object",
      fields: [
        {
          name: "sections",
          label: "Content Sections",
          type: "object",
          list: true,
          fields: [
            {
              name: "id",
              label: "Section ID",
              type: "string",
              required: true
            },
            {
              name: "type",
              label: "Section Type",
              type: "string",
              options: ["warning", "info", "default"],
              description: "Visual style of the section"
            },
            {
              name: "paragraphs",
              label: "Paragraphs",
              type: "string",
              list: true,
              ui: { component: "textarea" },
              description: "Array of paragraph texts"
            }
          ]
        }
      ]
    },
    {
      name: "seo",
      label: "SEO Settings",
      type: "object",
      fields: [
        {
          name: "metaTitle",
          label: "Meta Title",
          type: "string",
          required: true
        },
        {
          name: "metaDescription",
          label: "Meta Description",
          type: "string",
          ui: { component: "textarea" },
          required: true
        },
        {
          name: "keywords",
          label: "Keywords",
          type: "string",
          description: "Comma-separated keywords"
        },
        {
          name: "canonical",
          label: "Canonical URL",
          type: "string"
        }
      ]
    }
  ]
};

// tina/schema/podcast.ts
var podcast = {
  name: "podcast",
  label: "Podcast Page",
  path: "src/content/podcast",
  format: "json",
  ui: {
    allowedActions: {
      create: false,
      delete: false
    }
  },
  fields: [
    {
      type: "string",
      name: "slug",
      label: "Slug",
      isTitle: true,
      required: true
    },
    {
      type: "string",
      name: "title",
      label: "Page Title",
      required: true
    },
    {
      type: "string",
      name: "description",
      label: "Description",
      ui: {
        component: "textarea"
      }
    },
    {
      type: "object",
      name: "hero",
      label: "Hero Section",
      fields: [
        {
          type: "string",
          name: "badge",
          label: "Badge Text"
        },
        {
          type: "string",
          name: "title",
          label: "Hero Title",
          required: true
        },
        {
          type: "string",
          name: "subtitle",
          label: "Hero Subtitle",
          ui: {
            component: "textarea"
          }
        },
        {
          type: "image",
          name: "backgroundImage",
          label: "Background Image"
        },
        {
          type: "object",
          name: "host",
          label: "Host",
          fields: [
            {
              type: "string",
              name: "name",
              label: "Host Name",
              required: true
            },
            {
              type: "string",
              name: "title",
              label: "Host Title"
            },
            {
              type: "string",
              name: "bio",
              label: "Host Bio",
              ui: {
                component: "textarea"
              }
            },
            {
              type: "image",
              name: "photo",
              label: "Host Photo"
            },
            {
              type: "string",
              name: "twitter",
              label: "Host X (Twitter) URL"
            },
            {
              type: "string",
              name: "linkedin",
              label: "Host LinkedIn URL"
            }
          ]
        }
      ]
    },
    {
      type: "object",
      name: "schedule",
      label: "Podcast Schedule",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Section Title"
        },
        {
          type: "string",
          name: "subtitle",
          label: "Section Subtitle",
          ui: {
            component: "textarea"
          }
        },
        {
          type: "object",
          name: "episodes",
          label: "Upcoming Episodes",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item?.topic || item?.guest?.name || "Episode"
            })
          },
          fields: [
            {
              type: "datetime",
              name: "datetime",
              label: "Broadcast Date & Time",
              required: true
            },
            {
              type: "string",
              name: "duration",
              label: "Duration"
            },
            {
              type: "string",
              name: "topic",
              label: "Topic",
              required: true
            },
            {
              type: "string",
              name: "description",
              label: "Episode Summary",
              ui: {
                component: "textarea"
              }
            },
            {
              type: "object",
              name: "guest",
              label: "Guest",
              fields: [
                {
                  type: "string",
                  name: "name",
                  label: "Guest Name",
                  required: true
                },
                {
                  type: "string",
                  name: "title",
                  label: "Guest Title"
                },
                {
                  type: "string",
                  name: "bio",
                  label: "Guest Bio",
                  ui: {
                    component: "textarea"
                  }
                },
                {
                  type: "image",
                  name: "photo",
                  label: "Guest Photo"
                },
                {
                  type: "string",
                  name: "twitter",
                  label: "Guest X (Twitter) URL"
                },
                {
                  type: "string",
                  name: "linkedin",
                  label: "Guest LinkedIn URL"
                }
              ]
            },
            {
              type: "object",
              name: "resources",
              label: "Links",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "label",
                  label: "Link Label"
                },
                {
                  type: "string",
                  name: "url",
                  label: "URL"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      type: "object",
      name: "pastEpisodes",
      label: "Past Episodes",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Section Title"
        },
        {
          type: "string",
          name: "subtitle",
          label: "Section Subtitle",
          ui: {
            component: "textarea"
          }
        },
        {
          type: "object",
          name: "episodes",
          label: "Episodes",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item?.topic || item?.guest?.name || "Episode"
            })
          },
          fields: [
            {
              type: "string",
              name: "topic",
              label: "Topic",
              required: true
            },
            {
              type: "string",
              name: "summary",
              label: "Summary",
              ui: {
                component: "textarea"
              }
            },
            {
              type: "object",
              name: "guest",
              label: "Guest",
              fields: [
                {
                  type: "string",
                  name: "name",
                  label: "Guest Name"
                },
                {
                  type: "string",
                  name: "title",
                  label: "Guest Title"
                },
                {
                  type: "image",
                  name: "photo",
                  label: "Guest Photo"
                }
              ]
            },
            {
              type: "string",
              name: "recordingUrl",
              label: "Recording URL"
            }
          ]
        }
      ]
    },
    {
      type: "object",
      name: "cta",
      label: "Call To Action",
      fields: [
        {
          type: "string",
          name: "title",
          label: "CTA Title"
        },
        {
          type: "string",
          name: "description",
          label: "CTA Description",
          ui: {
            component: "textarea"
          }
        },
        {
          type: "string",
          name: "buttonLabel",
          label: "Button Label"
        },
        {
          type: "string",
          name: "buttonLink",
          label: "Button Link"
        }
      ]
    },
    {
      type: "object",
      name: "seo",
      label: "SEO Settings",
      fields: [
        {
          type: "string",
          name: "metaTitle",
          label: "Meta Title"
        },
        {
          type: "string",
          name: "metaDescription",
          label: "Meta Description",
          ui: {
            component: "textarea"
          }
        },
        {
          type: "string",
          name: "keywords",
          label: "Meta Keywords"
        },
        {
          type: "image",
          name: "ogImage",
          label: "Open Graph Image"
        }
      ]
    }
  ]
};
var podcast_default = podcast;

// tina/schema/pricing.ts
var pricing = {
  name: "pricing",
  label: "Pricing",
  path: "content/pricing",
  format: "json",
  fields: [
    {
      type: "object",
      name: "hero",
      label: "Hero Section",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Title",
          required: true
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          required: true,
          ui: {
            component: "textarea"
          }
        }
      ]
    },
    {
      type: "object",
      name: "nyaltxPro",
      label: "NyaltxPro Section",
      fields: [
        {
          type: "string",
          name: "sectionTitle",
          label: "Section Title",
          required: true
        },
        {
          type: "string",
          name: "badge",
          label: "Badge Text"
        },
        {
          type: "string",
          name: "title",
          label: "Card Title",
          required: true
        },
        {
          type: "string",
          name: "description",
          label: "Card Description",
          required: true
        },
        {
          type: "number",
          name: "price",
          label: "Price (USD)",
          required: true
        },
        {
          type: "object",
          name: "features",
          label: "Features",
          list: true,
          fields: [
            {
              type: "string",
              name: "text",
              label: "Feature Text"
            }
          ]
        },
        {
          type: "image",
          name: "bannerImage",
          label: "Race to Liberty Banner Image",
          description: "Image shown on the Race to Liberty card (Statue of Liberty campaign banner)"
        },
        {
          type: "string",
          name: "bannerTitle",
          label: "Banner Title"
        },
        {
          type: "string",
          name: "bannerDescription",
          label: "Banner Description"
        },
        {
          type: "string",
          name: "proMessage",
          label: "Pro Member Message"
        }
      ]
    },
    {
      type: "object",
      name: "raceToLiberty",
      label: "Race to Liberty Section",
      fields: [
        {
          type: "string",
          name: "sectionTitle",
          label: "Section Title",
          required: true
        },
        {
          type: "object",
          name: "tiers",
          label: "Tiers",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item?.name || item?.id || "Tier"
            })
          },
          fields: [
            {
              type: "string",
              name: "id",
              label: "ID",
              required: true
            },
            {
              type: "string",
              name: "name",
              label: "Name",
              required: true
            },
            {
              type: "string",
              name: "description",
              label: "Description",
              required: true,
              ui: {
                component: "textarea"
              }
            },
            {
              type: "number",
              name: "priceUSD",
              label: "Price (USD)",
              required: true
            },
            {
              type: "boolean",
              name: "isPopular",
              label: "Mark as Popular"
            },
            {
              type: "string",
              name: "popularBadge",
              label: "Popular Badge Text"
            },
            {
              type: "object",
              name: "features",
              label: "Features",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "text",
                  label: "Feature Text"
                }
              ]
            },
            {
              type: "string",
              name: "buttonText",
              label: "Button Text",
              required: true
            },
            {
              type: "string",
              name: "buttonSubtext",
              label: "Button Subtext"
            }
          ]
        }
      ]
    },
    {
      type: "object",
      name: "boostPacks",
      label: "Boost Packs Section",
      fields: [
        {
          type: "string",
          name: "sectionTitle",
          label: "Section Title",
          required: true
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          required: true,
          ui: {
            component: "textarea"
          }
        },
        {
          type: "string",
          name: "subDescription",
          label: "Sub Description",
          ui: {
            component: "textarea"
          }
        },
        {
          type: "object",
          name: "packs",
          label: "Boost Packs",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item?.name || item?.id || "Pack"
            })
          },
          fields: [
            {
              type: "string",
              name: "id",
              label: "ID",
              required: true
            },
            {
              type: "string",
              name: "name",
              label: "Name",
              required: true
            },
            {
              type: "number",
              name: "points",
              label: "Points"
            },
            {
              type: "number",
              name: "priceUSD",
              label: "Price (USD)",
              required: true
            },
            {
              type: "string",
              name: "description",
              label: "Description",
              required: true,
              ui: {
                component: "textarea"
              }
            },
            {
              type: "string",
              name: "icon",
              label: "Icon (emoji)"
            },
            {
              type: "boolean",
              name: "isPopular",
              label: "Mark as Popular"
            },
            {
              type: "string",
              name: "popularBadge",
              label: "Popular Badge Text"
            },
            {
              type: "string",
              name: "buttonText",
              label: "Button Text"
            },
            {
              type: "string",
              name: "buttonSubtext",
              label: "Button Subtext"
            }
          ]
        }
      ]
    },
    {
      type: "object",
      name: "footer",
      label: "Footer Text",
      fields: [
        {
          type: "string",
          name: "paymentMethods",
          label: "Payment Methods Text",
          ui: {
            component: "textarea"
          }
        },
        {
          type: "string",
          name: "technicalNote",
          label: "Technical Note",
          ui: {
            component: "textarea"
          }
        },
        {
          type: "string",
          name: "networkFees",
          label: "Network Fees Note",
          ui: {
            component: "textarea"
          }
        },
        {
          type: "string",
          name: "paypalNote",
          label: "PayPal Note",
          ui: {
            component: "textarea"
          }
        }
      ]
    }
  ]
};
var pricing_default = pricing;

// tina/schema/privacyPolicy.ts
var privacyPolicy = {
  name: "privacyPolicy",
  label: "Privacy Policy",
  path: "/src/content/privacypolicy",
  format: "json",
  fields: [
    {
      type: "string",
      name: "slug",
      label: "Slug"
    },
    {
      type: "string",
      name: "title",
      label: "Title"
    },
    {
      type: "string",
      name: "description",
      label: "Description"
    },
    {
      type: "object",
      name: "hero",
      label: "Hero Section",
      fields: [
        { type: "string", name: "title", label: "Title" },
        { type: "string", name: "subtitle", label: "Subtitle" },
        { type: "image", name: "backgroundImage", label: "Background Image" }
      ]
    },
    {
      type: "rich-text",
      name: "content",
      label: "Content"
    },
    {
      type: "object",
      name: "seo",
      label: "SEO",
      fields: [
        { type: "string", name: "metaTitle", label: "Meta Title" },
        { type: "string", name: "metaDescription", label: "Meta Description" },
        { type: "string", name: "keywords", label: "Keywords" },
        { type: "image", name: "ogImage", label: "OG Image" }
      ]
    }
  ]
};

// tina/schema/siteSettings.ts
var siteSettings = {
  name: "siteSettings",
  label: "Site SEO Settings",
  path: "content/site-settings",
  format: "json",
  ui: {
    allowedActions: {
      create: false,
      delete: false
    }
  },
  fields: [
    {
      type: "string",
      name: "title",
      label: "Site Title",
      required: true,
      description: "Used for browser tab title and Open Graph title"
    },
    {
      type: "string",
      name: "description",
      label: "Site Description",
      required: true,
      ui: {
        component: "textarea"
      },
      description: "Meta description and Open Graph description"
    },
    {
      type: "string",
      name: "keywords",
      label: "Keywords",
      description: "Comma-separated SEO keywords"
    },
    {
      type: "string",
      name: "authors",
      label: "Authors",
      description: "Author name shown in metadata (e.g. NYALTX Team)"
    },
    {
      type: "string",
      name: "creator",
      label: "Creator",
      description: "Creator metadata field"
    },
    {
      type: "string",
      name: "publisher",
      label: "Publisher",
      description: "Publisher metadata field"
    },
    {
      type: "string",
      name: "siteName",
      label: "Open Graph Site Name"
    },
    {
      type: "image",
      name: "ogImage",
      label: "OG / Favicon Image",
      description: "Image used for social shares and icons"
    },
    {
      type: "string",
      name: "twitterSite",
      label: "Twitter Site Handle",
      description: "e.g. @nyaltx"
    },
    {
      type: "string",
      name: "twitterCreator",
      label: "Twitter Creator Handle",
      description: "e.g. @nyaltx"
    }
  ]
};
var siteSettings_default = siteSettings;

// tina/schema/tradeVideos.ts
var tradeVideos = {
  name: "tradevideos",
  label: "Trade Page Videos",
  path: "src/content/tradevideos",
  format: "json",
  ui: {
    allowedActions: {
      create: true,
      delete: true
    }
  },
  fields: [
    {
      type: "string",
      name: "title",
      label: "Video Title",
      required: true
    },
    {
      type: "string",
      name: "videoId",
      label: "YouTube Video ID",
      required: true,
      description: "11-character YouTube video identifier"
    },
    {
      type: "string",
      name: "description",
      label: "Short Description",
      ui: {
        component: "textarea"
      }
    },
    {
      type: "boolean",
      name: "featured",
      label: "Featured",
      description: "Use as the primary video on the trade page"
    },
    {
      type: "number",
      name: "order",
      label: "Display Order",
      description: "Lower numbers appear first"
    },
    {
      type: "datetime",
      name: "publishedAt",
      label: "Published Date",
      ui: {
        timeFormat: "HH:mm"
      }
    }
  ]
};
var tradeVideos_default = tradeVideos;

// tina/schema/ventureGroup.ts
var ventureGroup = {
  name: "venturegroup",
  label: "Venture Group",
  path: "src/content/venturegroup",
  format: "json",
  ui: {
    allowedActions: {
      create: false,
      delete: false
    }
  },
  fields: [
    {
      type: "string",
      name: "slug",
      label: "Slug",
      isTitle: true,
      required: true,
      description: "URL slug for this page"
    },
    {
      type: "string",
      name: "title",
      label: "Page Title",
      required: true
    },
    {
      type: "string",
      name: "description",
      label: "Meta Description",
      ui: {
        component: "textarea"
      }
    },
    {
      type: "object",
      name: "hero",
      label: "Hero Section",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Hero Title",
          required: true
        },
        {
          type: "string",
          name: "subtitle",
          label: "Hero Subtitle",
          ui: {
            component: "textarea"
          }
        },
        {
          type: "image",
          name: "backgroundImage",
          label: "Background Image"
        }
      ]
    },
    {
      type: "rich-text",
      name: "content",
      label: "Intro Content"
    },
    {
      type: "object",
      name: "teamSection",
      label: "Team Section",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Section Title"
        },
        {
          type: "string",
          name: "subtitle",
          label: "Section Subtitle",
          ui: {
            component: "textarea"
          }
        },
        {
          type: "object",
          name: "members",
          label: "Team Members",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item?.name
            })
          },
          fields: [
            {
              type: "string",
              name: "name",
              label: "Name",
              required: true
            },
            {
              type: "string",
              name: "role",
              label: "Role"
            },
            {
              type: "string",
              name: "bio",
              label: "Bio",
              ui: {
                component: "textarea"
              }
            },
            {
              type: "image",
              name: "photo",
              label: "Photo"
            },
            {
              type: "string",
              name: "linkedin",
              label: "LinkedIn URL"
            },
            {
              type: "string",
              name: "twitter",
              label: "X (Twitter) URL"
            }
          ]
        }
      ]
    },
    {
      type: "object",
      name: "sections",
      label: "Additional Sections",
      list: true,
      fields: [
        {
          type: "string",
          name: "title",
          label: "Section Title"
        },
        {
          type: "string",
          name: "description",
          label: "Section Description",
          ui: {
            component: "textarea"
          }
        },
        {
          type: "object",
          name: "items",
          label: "Highlights",
          list: true,
          fields: [
            {
              type: "string",
              name: "title",
              label: "Item Title"
            },
            {
              type: "string",
              name: "description",
              label: "Item Description",
              ui: {
                component: "textarea"
              }
            }
          ]
        }
      ]
    },
    {
      type: "object",
      name: "seo",
      label: "SEO",
      fields: [
        {
          type: "string",
          name: "metaTitle",
          label: "Meta Title"
        },
        {
          type: "string",
          name: "metaDescription",
          label: "Meta Description",
          ui: {
            component: "textarea"
          }
        },
        {
          type: "string",
          name: "keywords",
          label: "Keywords"
        },
        {
          type: "image",
          name: "ogImage",
          label: "Open Graph Image"
        }
      ]
    }
  ]
};
var ventureGroup_default = ventureGroup;

// tina/schema/whitepaper.ts
var whitepaper = {
  name: "whitepaper",
  label: "Whitepaper",
  path: "content/whitepaper",
  format: "json",
  ui: {
    allowedActions: {
      create: false,
      delete: false
    }
  },
  fields: [
    {
      type: "string",
      name: "slug",
      label: "Slug",
      isTitle: true,
      required: true,
      description: "URL slug for this page"
    },
    {
      type: "string",
      name: "title",
      label: "Page Title",
      required: true
    },
    {
      type: "string",
      name: "description",
      label: "Page Description"
    },
    {
      type: "object",
      name: "hero",
      label: "Hero Section",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Hero Title",
          required: true
        },
        {
          type: "string",
          name: "subtitle",
          label: "Hero Subtitle"
        },
        {
          type: "string",
          name: "tagline",
          label: "Hero Tagline"
        }
      ]
    },
    {
      type: "object",
      name: "toc",
      label: "Table of Contents",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.title || item?.id || "Section"
        })
      },
      fields: [
        {
          type: "string",
          name: "id",
          label: "Section ID",
          required: true
        },
        {
          type: "string",
          name: "title",
          label: "Section Title",
          required: true
        },
        {
          type: "string",
          name: "level",
          label: "Hierarchy Level",
          options: [
            { label: "Top Level", value: "0" },
            { label: "Subsection", value: "1" }
          ]
        }
      ]
    },
    {
      type: "object",
      name: "sections",
      label: "Sections",
      list: true,
      ui: {
        itemProps: (item) => ({
          label: item?.title || item?.id || "Section"
        })
      },
      fields: [
        {
          type: "string",
          name: "id",
          label: "Section ID",
          required: true
        },
        {
          type: "string",
          name: "title",
          label: "Section Title",
          required: true
        },
        {
          type: "string",
          name: "level",
          label: "Hierarchy Level",
          options: [
            { label: "Top Level", value: "0" },
            { label: "Subsection", value: "1" }
          ]
        },
        {
          type: "string",
          name: "content",
          label: "Section Content",
          ui: { component: "textarea" }
        },
        {
          type: "object",
          name: "highlight",
          label: "Highlight",
          fields: [
            {
              type: "string",
              name: "style",
              label: "Highlight Style",
              options: [
                { label: "Cyan", value: "cyan" },
                { label: "Green", value: "green" },
                { label: "Purple", value: "purple" },
                { label: "Indigo", value: "indigo" },
                { label: "Orange", value: "orange" }
              ]
            },
            {
              type: "string",
              name: "content",
              label: "Highlight Content"
            }
          ]
        },
        {
          type: "object",
          name: "listItems",
          label: "List Items",
          list: true,
          fields: [
            {
              type: "string",
              name: "content",
              label: "Item Content"
            }
          ]
        },
        {
          type: "object",
          name: "stats",
          label: "Stats",
          list: true,
          fields: [
            {
              type: "string",
              name: "value",
              label: "Value",
              required: true
            },
            {
              type: "string",
              name: "description",
              label: "Description"
            },
            {
              type: "string",
              name: "color",
              label: "Color",
              options: [
                { label: "Cyan", value: "cyan" },
                { label: "Green", value: "green" },
                { label: "Blue", value: "blue" },
                { label: "Purple", value: "purple" },
                { label: "Orange", value: "orange" }
              ]
            }
          ]
        },
        {
          type: "object",
          name: "cards",
          label: "Cards",
          list: true,
          fields: [
            {
              type: "string",
              name: "title",
              label: "Title",
              required: true
            },
            {
              type: "string",
              name: "description",
              label: "Description"
            },
            {
              type: "string",
              name: "color",
              label: "Color",
              options: [
                { label: "Blue", value: "blue" },
                { label: "Green", value: "green" },
                { label: "Purple", value: "purple" },
                { label: "Teal", value: "teal" },
                { label: "Indigo", value: "indigo" },
                { label: "Orange", value: "orange" }
              ]
            }
          ]
        },
        {
          type: "object",
          name: "details",
          label: "Detail List",
          list: true,
          fields: [
            {
              type: "string",
              name: "label",
              label: "Label",
              required: true
            },
            {
              type: "string",
              name: "value",
              label: "Value",
              required: true
            }
          ]
        },
        {
          type: "object",
          name: "subsections",
          label: "Subsections",
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item?.title || item?.id || "Subsection"
            })
          },
          fields: [
            {
              type: "string",
              name: "id",
              label: "Subsection ID",
              required: true
            },
            {
              type: "string",
              name: "title",
              label: "Title",
              required: true
            },
            {
              type: "string",
              name: "content",
              label: "Content"
            },
            {
              type: "object",
              name: "highlight",
              label: "Highlight",
              fields: [
                {
                  type: "string",
                  name: "style",
                  label: "Highlight Style",
                  options: [
                    { label: "Cyan", value: "cyan" },
                    { label: "Green", value: "green" },
                    { label: "Purple", value: "purple" },
                    { label: "Teal", value: "teal" },
                    { label: "Orange", value: "orange" }
                  ]
                },
                {
                  type: "string",
                  name: "content",
                  label: "Highlight Content"
                }
              ]
            },
            {
              type: "object",
              name: "listItems",
              label: "List Items",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "content",
                  label: "Item Content"
                }
              ]
            }
          ]
        },
        {
          type: "object",
          name: "timeline",
          label: "Timeline",
          list: true,
          fields: [
            {
              type: "string",
              name: "id",
              label: "Timeline ID",
              required: true
            },
            {
              type: "string",
              name: "title",
              label: "Title",
              required: true
            },
            {
              type: "string",
              name: "subtitle",
              label: "Subtitle"
            },
            {
              type: "string",
              name: "color",
              label: "Color",
              options: [
                { label: "Cyan", value: "cyan" },
                { label: "Green", value: "green" },
                { label: "Purple", value: "purple" },
                { label: "Blue", value: "blue" },
                { label: "Orange", value: "orange" }
              ]
            },
            {
              type: "object",
              name: "items",
              label: "Items",
              list: true,
              fields: [
                {
                  type: "string",
                  name: "text",
                  label: "Item"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      type: "object",
      name: "seo",
      label: "SEO",
      fields: [
        {
          type: "string",
          name: "metaTitle",
          label: "Meta Title"
        },
        {
          type: "string",
          name: "metaDescription",
          label: "Meta Description"
        },
        {
          type: "string",
          name: "keywords",
          label: "Keywords"
        },
        {
          type: "image",
          name: "ogImage",
          label: "OG Image"
        }
      ]
    }
  ]
};
var whitepaper_default = whitepaper;

// tina/config.ts
var branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var config_default = defineConfig({
  branch,
  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public"
    }
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/r/content-modelling-collections/
  schema: {
    collections: [
      siteSettings_default,
      generalstatment_default,
      aboutUs,
      legalAdvice,
      privacyPolicy,
      ventureGroup_default,
      podcast_default,
      tradeVideos_default,
      pricing_default,
      whitepaper_default,
      governa_default,
      {
        name: "navigation",
        label: "Navigation",
        path: "content/navigation",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
        },
        fields: [
          {
            type: "object",
            name: "brand",
            label: "Brand",
            fields: [
              {
                type: "string",
                name: "label",
                label: "Brand Label"
              },
              {
                type: "string",
                name: "href",
                label: "Brand Link",
                ui: {
                  validate: (value) => value ? void 0 : "Brand link is required"
                }
              }
            ]
          },
          {
            type: "object",
            name: "primaryLinks",
            label: "Primary Links",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.label || "New Link"
              })
            },
            fields: [
              {
                type: "string",
                name: "label",
                label: "Link Label",
                required: true
              },
              {
                type: "string",
                name: "href",
                label: "Link URL",
                required: true
              },
              {
                type: "boolean",
                name: "enabled",
                label: "Enabled",
                ui: {
                  defaultValue: true
                }
              }
            ]
          },
          {
            type: "object",
            name: "dropdownMenus",
            label: "Dropdown Menus",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item?.label || "Dropdown"
              })
            },
            fields: [
              {
                type: "string",
                name: "label",
                label: "Dropdown Label",
                required: true
              },
              {
                type: "boolean",
                name: "enabled",
                label: "Enabled",
                ui: {
                  defaultValue: true
                }
              },
              {
                type: "object",
                name: "links",
                label: "Dropdown Links",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.label || "Dropdown Link"
                  })
                },
                fields: [
                  {
                    type: "string",
                    name: "label",
                    label: "Link Label",
                    required: true
                  },
                  {
                    type: "string",
                    name: "href",
                    label: "Link URL",
                    required: true
                  },
                  {
                    type: "boolean",
                    name: "enabled",
                    label: "Enabled",
                    ui: {
                      defaultValue: true
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "landing",
        label: "Landing Page",
        path: "content/landing",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
        },
        fields: [
          {
            type: "object",
            name: "hero",
            label: "Hero Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Hero Title",
                required: true
              },
              {
                type: "string",
                name: "subtitle",
                label: "Hero Subtitle",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "string",
                name: "ctaText",
                label: "CTA Button Text"
              },
              {
                type: "string",
                name: "ctaLink",
                label: "CTA Button Link"
              },
              {
                type: "image",
                name: "backgroundImage",
                label: "Background Image"
              }
            ]
          },
          {
            type: "object",
            name: "features",
            label: "Features Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Section Title"
              },
              {
                type: "string",
                name: "subtitle",
                label: "Section Subtitle",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "object",
                name: "items",
                label: "Feature Items",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "title",
                    label: "Feature Title",
                    required: true
                  },
                  {
                    type: "string",
                    name: "description",
                    label: "Feature Description",
                    ui: {
                      component: "textarea"
                    }
                  },
                  {
                    type: "string",
                    name: "icon",
                    label: "Feature Icon (emoji)"
                  },
                  {
                    type: "image",
                    name: "image",
                    label: "Feature Image"
                  }
                ]
              }
            ]
          },
          {
            type: "object",
            name: "stats",
            label: "Statistics Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Section Title"
              },
              {
                type: "object",
                name: "items",
                label: "Stat Items",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "value",
                    label: "Stat Value",
                    required: true
                  },
                  {
                    type: "string",
                    name: "label",
                    label: "Stat Label",
                    required: true
                  },
                  {
                    type: "string",
                    name: "description",
                    label: "Stat Description"
                  }
                ]
              }
            ]
          },
          {
            type: "object",
            name: "testimonials",
            label: "Testimonials Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Section Title"
              },
              {
                type: "object",
                name: "items",
                label: "Testimonial Items",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "quote",
                    label: "Testimonial Quote",
                    ui: {
                      component: "textarea"
                    },
                    required: true
                  },
                  {
                    type: "string",
                    name: "author",
                    label: "Author Name",
                    required: true
                  },
                  {
                    type: "string",
                    name: "role",
                    label: "Author Role"
                  },
                  {
                    type: "image",
                    name: "avatar",
                    label: "Author Avatar"
                  }
                ]
              }
            ]
          },
          {
            type: "object",
            name: "cta",
            label: "Call to Action Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "CTA Title"
              },
              {
                type: "string",
                name: "subtitle",
                label: "CTA Subtitle",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "string",
                name: "primaryButtonText",
                label: "Primary Button Text"
              },
              {
                type: "string",
                name: "primaryButtonLink",
                label: "Primary Button Link"
              },
              {
                type: "string",
                name: "secondaryButtonText",
                label: "Secondary Button Text"
              },
              {
                type: "string",
                name: "secondaryButtonLink",
                label: "Secondary Button Link"
              },
              {
                type: "image",
                name: "backgroundImage",
                label: "Background Image"
              }
            ]
          },
          {
            type: "object",
            name: "howItWorks",
            label: "How It Works Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Section Title"
              },
              {
                type: "string",
                name: "subtitle",
                label: "Section Subtitle",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "object",
                name: "steps",
                label: "Steps",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "step",
                    label: "Step Number",
                    required: true
                  },
                  {
                    type: "string",
                    name: "title",
                    label: "Step Title",
                    required: true
                  },
                  {
                    type: "string",
                    name: "description",
                    label: "Step Description",
                    ui: {
                      component: "textarea"
                    }
                  },
                  {
                    type: "string",
                    name: "icon",
                    label: "Step Icon (emoji)"
                  },
                  {
                    type: "image",
                    name: "image",
                    label: "Step Image"
                  }
                ]
              }
            ]
          },
          {
            type: "object",
            name: "partnerships",
            label: "Partnerships Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Section Title"
              },
              {
                type: "string",
                name: "subtitle",
                label: "Section Subtitle",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "object",
                name: "partners",
                label: "Partners",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "name",
                    label: "Partner Name",
                    required: true
                  },
                  {
                    type: "image",
                    name: "logo",
                    label: "Partner Logo"
                  },
                  {
                    type: "string",
                    name: "description",
                    label: "Partner Description"
                  }
                ]
              }
            ]
          },
          {
            type: "object",
            name: "roadmap",
            label: "Roadmap Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Section Title"
              },
              {
                type: "string",
                name: "subtitle",
                label: "Section Subtitle",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "object",
                name: "quarters",
                label: "Roadmap Quarters",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "period",
                    label: "Time Period",
                    required: true
                  },
                  {
                    type: "string",
                    name: "title",
                    label: "Quarter Title",
                    required: true
                  },
                  {
                    type: "string",
                    name: "status",
                    label: "Status",
                    options: ["completed", "in-progress", "planned", "research"]
                  },
                  {
                    type: "string",
                    name: "features",
                    label: "Features",
                    list: true
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "footer",
        label: "Footer Settings",
        path: "content/footer",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
        },
        fields: [
          {
            type: "object",
            name: "branding",
            label: "Branding",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Company Title",
                required: true
              },
              {
                type: "string",
                name: "subtitle",
                label: "Company Subtitle"
              },
              {
                type: "string",
                name: "description",
                label: "Company Description",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "image",
                name: "logo",
                label: "Footer Logo"
              }
            ]
          },
          {
            type: "object",
            name: "links",
            label: "Footer Links",
            fields: [
              {
                type: "object",
                name: "sections",
                label: "Link Sections",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "title",
                    label: "Section Title",
                    required: true
                  },
                  {
                    type: "object",
                    name: "items",
                    label: "Links",
                    list: true,
                    fields: [
                      {
                        type: "string",
                        name: "label",
                        label: "Link Label",
                        required: true
                      },
                      {
                        type: "string",
                        name: "url",
                        label: "Link URL",
                        required: true
                      },
                      {
                        type: "boolean",
                        name: "external",
                        label: "External Link"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            type: "object",
            name: "social",
            label: "Social Media",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Social Section Title"
              },
              {
                type: "string",
                name: "description",
                label: "Social Section Description",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "object",
                name: "platforms",
                label: "Social Platforms",
                fields: [
                  {
                    type: "string",
                    name: "twitter",
                    label: "Twitter URL"
                  },
                  {
                    type: "string",
                    name: "discord",
                    label: "Discord URL"
                  },
                  {
                    type: "string",
                    name: "telegram",
                    label: "Telegram URL"
                  },
                  {
                    type: "string",
                    name: "youtube",
                    label: "YouTube URL"
                  },
                  {
                    type: "string",
                    name: "linkedin",
                    label: "LinkedIn URL"
                  },
                  {
                    type: "string",
                    name: "github",
                    label: "GitHub URL"
                  }
                ]
              }
            ]
          },
          {
            type: "object",
            name: "newsletter",
            label: "Newsletter",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Newsletter Title"
              },
              {
                type: "string",
                name: "description",
                label: "Newsletter Description",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "string",
                name: "placeholder",
                label: "Email Placeholder"
              },
              {
                type: "string",
                name: "buttonText",
                label: "Subscribe Button Text"
              }
            ]
          },
          {
            type: "object",
            name: "legal",
            label: "Legal Information",
            fields: [
              {
                type: "string",
                name: "copyright",
                label: "Copyright Text",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "string",
                name: "disclaimer",
                label: "Disclaimer Text",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "object",
                name: "links",
                label: "Legal Links",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "label",
                    label: "Link Label",
                    required: true
                  },
                  {
                    type: "string",
                    name: "url",
                    label: "Link URL",
                    required: true
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "contact",
        label: "Contact",
        path: "content/contact",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
        },
        fields: [
          {
            type: "object",
            name: "hero",
            label: "Hero Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Page Title",
                required: true
              },
              {
                type: "string",
                name: "subtitle",
                label: "Page Subtitle",
                ui: {
                  component: "textarea"
                }
              }
            ]
          },
          {
            type: "object",
            name: "contactInfo",
            label: "Contact Information",
            fields: [
              {
                type: "string",
                name: "email",
                label: "Contact Email"
              },
              {
                type: "string",
                name: "phone",
                label: "Phone Number"
              },
              {
                type: "string",
                name: "address",
                label: "Address",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "string",
                name: "businessHours",
                label: "Business Hours",
                ui: {
                  component: "textarea"
                }
              }
            ]
          },
          {
            type: "object",
            name: "form",
            label: "Contact Form",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Form Title"
              },
              {
                type: "string",
                name: "description",
                label: "Form Description"
              },
              {
                type: "string",
                name: "submitText",
                label: "Submit Button Text"
              }
            ]
          }
        ]
      },
      {
        name: "team",
        label: "Team",
        path: "content/team",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
        },
        fields: [
          {
            type: "object",
            name: "hero",
            label: "Hero Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Title",
                required: true
              },
              {
                type: "string",
                name: "subtitle",
                label: "Subtitle",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "image",
                name: "backgroundImage",
                label: "Background Image"
              }
            ]
          },
          {
            type: "object",
            name: "members",
            label: "Team Members",
            list: true,
            ui: {
              itemProps: (item) => {
                return {
                  label: item?.name || "New Team Member"
                };
              },
              defaultItem: () => ({
                name: "New Team Member",
                role: "Role / Title",
                description: "",
                image: "",
                socials: {
                  twitter: "",
                  linkedin: "",
                  telegram: ""
                }
              })
            },
            fields: [
              {
                type: "string",
                name: "name",
                label: "Name",
                required: true
              },
              {
                type: "string",
                name: "role",
                label: "Role"
              },
              {
                type: "string",
                name: "description",
                label: "Description",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "image",
                name: "image",
                label: "Photo",
                required: true
              },
              {
                type: "object",
                name: "socials",
                label: "Social Links",
                fields: [
                  {
                    type: "string",
                    name: "twitter",
                    label: "Twitter URL"
                  },
                  {
                    type: "string",
                    name: "linkedin",
                    label: "LinkedIn URL"
                  },
                  {
                    type: "string",
                    name: "telegram",
                    label: "Telegram URL"
                  }
                ]
              }
            ]
          },
          {
            type: "object",
            name: "seo",
            label: "SEO Settings",
            fields: [
              {
                type: "string",
                name: "metaTitle",
                label: "Meta Title"
              },
              {
                type: "string",
                name: "metaDescription",
                label: "Meta Description",
                ui: {
                  component: "textarea"
                }
              },
              {
                type: "string",
                name: "keywords",
                label: "Keywords (comma-separated)"
              },
              {
                type: "image",
                name: "ogImage",
                label: "Open Graph Image"
              }
            ]
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
