import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Session from "./session.js";

const Exercise = sequelize.define(
    "Exercise",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        session_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Session,
                key: "id",
            },
        },
        exercise_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        duration: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fav: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    },
    {
        tableName: "exercise",
        timestamps: false,
    }
);

Exercise.belongsTo(Session, {
    foreignKey: "session_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});
export default Exercise;
