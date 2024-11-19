import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Profile({ onLogout }) {
    const { user } = useContext(AuthContext);

    // Formatear la fecha de registro a un formato más legible
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <section
            className="w-full mx-auto text-white p-6 rounded-lg bg-neutral-800 items-center mb-24"
            style={{ width: "90%" }}
        >
            <h2 className="text-2xl font-bold mb-4 text-center">
                Perfil de Usuario
            </h2>

            <article className="space-y-4">
                <div>
                    <h3 className="font-semibold">Nombre</h3>
                    <p>{user.name || "No disponible"}</p>
                </div>
                <div>
                    <h3 className="font-semibold">Apellidos</h3>
                    <p>{user.surnames || "No disponible"}</p>
                </div>
                <div>
                    <h3 className="font-semibold">E-mail</h3>
                    <p>{user.email || "No disponible"}</p>
                </div>
                <div>
                    <h3 className="font-semibold">Cuenta creada</h3>
                    <p>
                        {user.register_date
                            ? formatDate(user.register_date)
                            : "No disponible"}
                    </p>
                </div>
            </article>

            <div className="mt-6 flex justify-center">
                <button
                    onClick={onLogout}
                    className="bg-red-600 px-6 py-3 rounded-lg hover:bg-red-700 transition duration-300 text-lg font-semibold"
                >
                    Cerrar Sesión
                </button>
            </div>
        </section>
    );
}

export default Profile;
