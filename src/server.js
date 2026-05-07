const app = require("./app");
const { initializeDatabase } = require("./db");

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
