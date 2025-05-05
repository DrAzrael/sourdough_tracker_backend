declare namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
      PORT: string;
      DB_NAME: string;
    }
  }