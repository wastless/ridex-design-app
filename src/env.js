import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_SECRET:
        process.env.NODE_ENV === "production"
            ? z.string()
            : z.string().optional(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
    // LIVEBLOCKS_PUBLIC_KEY: z.string(),
    // LIVEBLOCKS_SECRET_KEY: z.string(),
  },

  client: {},

  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    // LIVEBLOCKS_PUBLIC_KEY: process.env.LIVEBLOCKS_PUBLIC_KEY,
    // LIVEBLOCKS_SECRET_KEY: process.env.LIVEBLOCKS_SECRET_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
