import { DataTypes, Model, ModelStatic, Optional, Sequelize } from "sequelize";

// Mêmes champs que Declaration côté Angular (Front/src/app/models/pollution.ts)
export const TYPES_POLLUTION = ["Plastique", "Chimique", "Dépôt sauvage", "Eau", "Air", "Autre"] as const;

export interface PollutionAttributes {
  id: string;
  titre: string;
  type: (typeof TYPES_POLLUTION)[number];
  description: string;
  dateObservation: string;
  lieu: string;
  latitude: number;
  longitude: number;
  photoUrl: string | null;
  auteur: string;
  dateCreation: Date;
  dateModification: Date | null;
}

// Champs remplis par la base ou l'API, pas par le client
export interface PollutionCreationAttributes
  extends Optional<PollutionAttributes, "id" | "photoUrl" | "dateCreation" | "dateModification"> {}

export interface PollutionInstance
  extends Model<PollutionAttributes, PollutionCreationAttributes>,
    PollutionAttributes {}

export type PollutionModel = ModelStatic<PollutionInstance>;

export default function definePollutions(sequelize: Sequelize): PollutionModel {
  return sequelize.define<PollutionInstance>(
    "pollution",
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      titre: { type: DataTypes.STRING(100), allowNull: false },
      type: { type: DataTypes.STRING(30), allowNull: false, validate: { isIn: [TYPES_POLLUTION] } },
      description: { type: DataTypes.TEXT, allowNull: false },
      // DATEONLY : renvoyée en "AAAA-MM-JJ", comme le champ date du formulaire
      dateObservation: { type: DataTypes.DATEONLY, allowNull: false },
      lieu: { type: DataTypes.STRING(200), allowNull: false },
      latitude: { type: DataTypes.DOUBLE, allowNull: false, validate: { min: -90, max: 90 } },
      longitude: { type: DataTypes.DOUBLE, allowNull: false, validate: { min: -180, max: 180 } },
      photoUrl: { type: DataTypes.TEXT, allowNull: true },
      auteur: { type: DataTypes.STRING(50), allowNull: false },
      dateCreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      dateModification: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "pollution",
      // colonnes en snake_case dans Postgres (date_observation...), camelCase en JSON
      underscored: true,
      timestamps: false,
    },
  );
}
