import { DataSourceOptions } from "typeorm";
import path from "path";

const config: DataSourceOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "5432",
  database: "moapick",
  entities: [path.join(__dirname + "../src/entities/**/*.entity.{ts,js}")],
  synchronize: true,
  logging: true,
};
export default config;
