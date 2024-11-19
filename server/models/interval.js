import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Exercise from "./exercise.js";

const Interval = sequelize.define(
    "Interval",
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
        interval_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        lastValue: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        duration: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
        },
        distance: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
        },
    },
    {
        tableName: "intervals",
        timestamps: false,
    }
);

Interval.belongsTo(Exercise, {
    foreignKey: "exercise_id",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});
export default Interval;
