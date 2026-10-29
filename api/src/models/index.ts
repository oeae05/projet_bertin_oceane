import { Sequelize } from "sequelize";
import { config } from "../config";
import definePollutions, { PollutionModel } from "./pollutions.model";
import defineUtilisateurs, { UtilisateurModel } from "./utilisateurs.model";

const isLocalHost = /localhost|127\.0\.0\.1/.test(config.databaseUrl);

// Supabase impose SSL ; une base locale n'en a généralement pas
const sequelize = new Sequelize(config.databaseUrl, {
  dialect: "postgres",
  dialectOptions: isLocalHost ? {} : { ssl: { require: true, rejectUnauthorized: false } },
  logging: false,
});

export interface Database {
  sequelize: Sequelize;
  pollutions: PollutionModel;
  utilisateurs: UtilisateurModel;
}

export const db: Database = {
  sequelize,
  pollutions: definePollutions(sequelize),
  utilisateurs: defineUtilisateurs(sequelize),
};

export default db;
