import type {} from "../types/express-session.js";
import session from "express-session";
import MongoStore from "connect-mongo";

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error(
    "SESSION_SECRET must be configured with a strong secret."
  );
}

const isProduction = process.env.NODE_ENV === "production" ||
  Boolean(process.env.VERCEL);

export const sessionMiddleware = session({
  name: "wallycart_admin_session",
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "admin_sessions",
    ttl: 60 * 60 * 8,
    autoRemove: "native",
  }),
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 8,
    path: "/",
  },
});