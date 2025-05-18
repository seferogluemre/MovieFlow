// swagger.js
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Emre'nin API'si",
      version: "1.0.0",
      description: "Bu API örnek amaçlı hazırlanmıştır",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: [path.join(__dirname, "../routes/*.ts")],
};

export const swaggerSpec = swaggerJSDoc(options);
