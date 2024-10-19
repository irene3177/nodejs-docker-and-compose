export default () => ({
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
  },
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    name: process.env.POSTGRES_DB || 'kupipodariday',
    user: process.env.POSTGRES_USER || 'student',
    password: process.env.POSTGRES_PASSWORD || 'student',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret-key',
    ttl: process.env.JWT_TTL || '30000s',
  },
  synchronize: process.env.SYNCHRONIZE,
});
