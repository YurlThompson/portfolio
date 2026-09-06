
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const typeDefs = `#graphql
  type Product {
    id: Int!
    name: String
    description: String
    price: Float
    created_at: String
  }

  type Query {
    products: [Product!]!
  }
`;

export const resolvers = {
  Query: {
    products: async () => {
      return await prisma.products.findMany();
    },
  },
};

