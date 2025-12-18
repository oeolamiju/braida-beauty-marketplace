import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new SQLDatabase("braida_db", {
  migrations: "./migrations",
});
