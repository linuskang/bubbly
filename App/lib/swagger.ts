import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Bubbly API Docs",
        version: "2.0.0",
        description: "API documentation for Bubbly",
        termsOfService: "https://linuskang.au/terms",
        contact: { name: "Linus Kang", email: "email@linus.id.au" },
        license: { name: "CC BY-NC-SA 4.0", url: "https://creativecommons.org/licenses/by-nc-sa/4.0/" }
      },
      servers: [
        { url: "https://bubbly.lkang.au", description: "Production server" },
      ],
    },
  });
  return spec;
};