import { DataTypes, Model, ModelStatic, Sequelize } from "sequelize";

export interface UtilisateurAttributes {
  login: string;
  nom: string;
  prenom: string;
  email: string;
  // Le mot de passe n'est jamais stocké en clair (voir controllers/utilisateur.controllers.ts)
  motDePasseHash: string;
}

export interface UtilisateurInstance extends Model<UtilisateurAttributes>, UtilisateurAttributes {}

export type UtilisateurModel = ModelStatic<UtilisateurInstance>;

export default function defineUtilisateurs(sequelize: Sequelize): UtilisateurModel {
  return sequelize.define<UtilisateurInstance>(
    "utilisateur",
    {
      login: { type: DataTypes.STRING(50), primaryKey: true },
      nom: { type: DataTypes.STRING(100), allowNull: false },
      prenom: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(200), allowNull: false, validate: { isEmail: true } },
      motDePasseHash: { type: DataTypes.STRING(200), allowNull: false },
    },
    { tableName: "utilisateur", underscored: true, timestamps: false },
  );
}
