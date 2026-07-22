import "dotenv/config";
import express from "express";
import { createServer } from "http";
import authRouter from "./routes/auth.js";
import hackatimeRouter from "./routes/hackatime.js";
import projectsRouter from "./routes/projects.js";
import notificationsRouter from "./routes/notifications.js";
import profileRouter from "./routes/profile.js";
import friendsRouter from "./routes/friends.js";
import uploadsRouter from "./routes/uploads.js";
import exploreRouter from "./routes/explore.js";
import adminRouter from "./routes/admin.js";
import shopRouter from "./routes/shop.js";
import eventsRouter from "./routes/events.js";
import sidequestsRouter from "./routes/sidequests.js";
import reportsRouter from "./routes/reports.js";
import vaultRouter from "./routes/vault.js";
import storyRouter from "./routes/story.js";
import { rateLimit } from "./rateLimit.js";
import { attachWebSocketServer } from "./ws/gameServer.js";

const app = express();

// CORS: the web export (served from another origin, with COEP require-corp)
// reaches us via the browser's fetch, which enforces CORS. Tokens travel in the
// query string, not cookies, so a permissive origin is safe here.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(rateLimit({ windowMs: 60_000, max: 300, name: "all" }));
const writeLimiter = rateLimit({ windowMs: 60_000, max: 60, name: "write" });
app.use((req, res, next) =>
  req.method === "GET" ? next() : writeLimiter(req, res, next),
);

app.use(express.json());
app.use(authRouter);
app.use(hackatimeRouter);
app.use(projectsRouter);
app.use(notificationsRouter);
app.use(profileRouter);
app.use(friendsRouter);
app.use(uploadsRouter);
app.use(exploreRouter);
app.use(adminRouter);
app.use(shopRouter);
app.use(eventsRouter);
app.use(sidequestsRouter);
app.use(reportsRouter);
app.use(vaultRouter);
app.use(storyRouter);

app.get("/", (_req, res) => res.json({ name: "pixl-server", status: "ok" }));
app.get("/health", (_req, res) => res.json({ ok: true }));

const httpServer = createServer(app);
attachWebSocketServer(httpServer);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = "0.0.0.0";
httpServer.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});
