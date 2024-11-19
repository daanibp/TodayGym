import React, { useContext } from "react";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Navigate,
} from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./pages/MainLayout";
import Profile from "./pages/Profile";
import Diary from "./pages/Diary";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import WeightExercises from "./pages/WeightExercises";
import CardioExercises from "./pages/CardioExercises";
import { SessionProvider } from "./context/SessionContext";
import Progreso from "./pages/Progreso";
import FavExercises from "./pages/FavExercises";
import ExerciseHistory from "./pages/ExerciseHistory";

function App() {
    return (
        <AuthProvider>
            <SessionProvider>
                <Router>
                    <AuthRoutes />
                </Router>
            </SessionProvider>
        </AuthProvider>
    );
}

// Separa las rutas en un componente basado en el estado de autenticación
function AuthRoutes() {
    const { token, login, logout, loading } = useContext(AuthContext);
    //console.log("User:", user);

    // Mostrar un estado de carga mientras verificamos si el usuario está autenticado
    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div>
            {/* Rutas para usuarios no autenticados */}
            {!token ? (
                <Routes>
                    <Route path="/welcome" element={<Welcome />} />
                    <Route path="/login" element={<Login onLogin={login} />} />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="*" element={<Navigate to="/welcome" />} />
                </Routes>
            ) : (
                // Rutas protegidas
                <MainLayout>
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/diary" element={<Diary />} />
                        <Route
                            path="/exercises"
                            element={<WeightExercises />}
                        />
                        <Route
                            path="/exercisesCardio"
                            element={<CardioExercises />}
                        />
                        <Route path="/progress" element={<Progreso />} />
                        <Route
                            path="/favExercises"
                            element={<FavExercises />}
                        />
                        <Route
                            path="/exerciseHistory"
                            element={<ExerciseHistory />}
                        />
                        <Route
                            path="/profile"
                            element={<Profile onLogout={logout} />}
                        />
                        <Route
                            path="*"
                            element={<Navigate to="/dashboard" />}
                        />
                    </Routes>
                </MainLayout>
            )}
        </div>
    );
}

export default App;
