import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
    errorFormat: 'minimal'
});
async function checkConnection() {
    try {
      // A simple query to check the connection
      await prisma.$connect();
      console.log("Connected to PostgreSQL database successfully!");
    } catch (error) {
      console.error(`Failed to connect to PostgreSQL database: ${DATABSE_URL}`, error);
    } finally {
      await prisma.$disconnect();
    }
  }
  
checkConnection();

export default prisma;