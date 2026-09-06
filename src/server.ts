
import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { PrismaClient } from "@prisma/client";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs, resolvers } from "./graphql";

const app = Fastify();
const prisma = new PrismaClient();

async function start() {
  // Swagger
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Affiliate Platform API",
        version: "1.0.0",
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });

  // GET
  app.get("/products", async () => {
    return await prisma.products.findMany();
  });

  // POST
  app.post(
    "/products",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "price"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
          },
        },
      },
    },
    async (request, reply) => {
      const body = request.body as {
        name: string;
        description?: string;
        price: number;
      };

      const product = await prisma.products.create({
        data: {
          name: body.name,
          description: body.description,
          price: body.price,
        },
      });

      return reply.code(201).send(product);
    }
  );

  // PUT
  app.put(
    "/products/:id",
    {
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "integer" },
          },
        },
        body: {
          type: "object",
          required: ["name", "price"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
          },
        },
      },
    },
    async (request) => {
      const { id } = request.params as { id: number };

      const body = request.body as {
        name: string;
        description?: string;
        price: number;
      };

      return await prisma.products.update({
        where: {
          id: Number(id),
        },
        data: {
          name: body.name,
          description: body.description,
          price: body.price,
        },
      });
    }
  );

  // DELETE
  app.delete(
    "/products/:id",
    {
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "integer" },
          },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: number };

      await prisma.products.delete({
        where: {
          id: Number(id),
        },
      });

      return reply.code(204).send();
    }
  );

  // REST na porta 3000
  await app.listen({ port: 3000 });

  console.log("REST API: http://localhost:3000");
  console.log("Swagger: http://localhost:3000/docs");

  // GraphQL na porta 4000
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(apolloServer, {
    listen: {
      port: 4000,
    },
  });

  console.log(`GraphQL: ${url}`);
}

start();

