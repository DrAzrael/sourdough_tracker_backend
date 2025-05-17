declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI: string
    PORT: string
    DB_NAME: string
    ACCESS_TOKEN_SECRET: string
    REFRESH_TOKEN_SECRET: string
  }
}
