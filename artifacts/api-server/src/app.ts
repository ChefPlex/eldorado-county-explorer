import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.set("trust proxy", 1);

function buildAllowedOrigins(): Set<string> {
  const origins = new Set<string>();

  const replitDomains = process.env["REPLIT_DOMAINS"];
  if (replitDomains) {
    for (const domain of replitDomains.split(",")) {
      const d = domain.trim();
      if (d) origins.add(`https://${d}`);
    }
  }

  const expoDomain = process.env["REPLIT_EXPO_DEV_DOMAIN"];
  if (expoDomain) {
    origins.add(`https://${expoDomain.trim()}`);
  }

  const extraOrigins = process.env["CORS_ALLOWED_ORIGINS"];
  if (extraOrigins) {
    for (const origin of extraOrigins.split(",")) {
      const o = origin.trim();
      if (o) origins.add(o);
    }
  }

  return origins;
}

const allowedOrigins = buildAllowedOrigins();

logger.info({ allowedOrigins: [...allowedOrigins] }, "CORS allowed origins");

app.use(
  cors({
    origin(requestOrigin, callback) {
      if (!requestOrigin) {
        callback(null, false);
        return;
      }
      if (allowedOrigins.has(requestOrigin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: false,
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
