import express from "express";
import http from "node:http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import logger from "morgan";

import { createClient } from "@libsql/client";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
  connectionStateRecovery: {},
});

dotenv.config();

const db = createClient({
  url: "libsql://chatdb-nelrondon.turso.io",
  authToken: process.env.DB_TOKEN,
});

await db.execute(
  `CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    user TEXT)`
);

const PORT = process.env.PORT ?? 1234;

app.use(logger("dev"));

io.on("connection", async (socket) => {
  const { username } = socket.handshake.auth;
  console.log(`cliente conectado => ${username}`);

  socket.on("disconnect", () => {
    console.log(`cliente desconectado => ${username}`);
  });

  socket.on("message", async (msg, user) => {
    let result;
    console.log(user, msg);
    try {
      result = await db.execute({
        sql: "INSERT INTO messages (content, user) VALUES (:msg, :username)",
        args: { msg, username: user },
      });
    } catch (e) {
      console.error(`error: ${e}`);
    }

    io.emit("message", msg, user, result.lastInsertRowid.toString());
  });

  if (!socket.recovered) {
    try {
      const results = await db.execute({
        sql: "SELECT id, content, user FROM messages WHERE id > ?",
        args: [socket.handshake.auth.serverOffset ?? 0],
      });

      results.rows.forEach((row) => {
        socket.emit("message", row.content, row.user, row.id.toString());
      });
    } catch (e) {}
  }
});

app.get("/", (req, res) => {
  res.send("Sisisisi");
});

server.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});
