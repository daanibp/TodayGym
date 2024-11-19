import React from "react";
import Semanas from "../components/Semanas";

function Dashboard() {
    return (
        <div className="dashboard-container">
            <div className="semana">
                <Semanas />
            </div>
        </div>
    );
}

export default Dashboard;
