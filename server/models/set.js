import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Exercise from "./exercise.js";

const Set = sequelize.define(
    "Set",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        exercise_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Exercise,
                key: "id",
            },
        },
        set_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        lastValue: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        weight: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
        },
        reps: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "sets",
        timestamps: false,
    }
);

// Relación con Exercise
Set.belongsTo(Exercise, {
    foreignKey: "exercise_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

export default Set;
