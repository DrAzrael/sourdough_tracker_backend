declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI: string;
    PORT: string;
    DB_NAME: string;
    REFRESH_TOKEN_SECRET: string;
    ACCESS_TOKEN_SECRET: string;
    SECRET: string;
  }
}

declare namespace Express {
  interface Request {
    user?: string; // Or JwtPayload if you want to store the full payload
  }
}