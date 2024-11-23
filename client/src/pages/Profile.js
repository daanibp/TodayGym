import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Profile({ onLogout }) {
    const { user } = useContext(AuthContext);

    // Estado para edición de perfil
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({
        name: user.name || "",
        surnames: user.surnames || "",
        password: "",
    });
    const [error, setError] = useState(null);

    // Formatear la fecha de registro a un formato más legible
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setError(null); // Resetea los errores al cambiar el modo de edición
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSaveChanges = async () => {
        if (!editedData.name || !editedData.surnames) {
            setError("El nombre y apellidos no pueden estar vacíos.");
            return;
        }

        try {
            const response = await fetch(
                `https://regymserver.onrender.com/users/updateUserById/${user.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(editedData),
                }
            );

            if (response.ok) {
                alert("Tus datos han sido actualizados correctamente.");
                setIsEditing(false);
                setError(null);
            } else {
                const data = await response.json();
                setError(data.error || "Error al actualizar los datos.");
            }
        } catch (err) {
            setError("Hubo un problema al actualizar tus datos.");
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm(
            "¿Estás seguro de que deseas borrar tu cuenta? Esta acción es irreversible y se eliminarán todos tus datos según nuestra política de privacidad."
        );

        if (confirmDelete) {
            try {
                const response = await fetch(
                    `https://regymserver.onrender.com/users/deleteUserById/${user.id}`,
                    {
                        method: "DELETE",
                    }
                );

                if (response.ok) {
                    alert(
                        "Tu cuenta ha sido eliminada y todos tus datos han sido eliminados."
                    );
                    onLogout(); // Limpia la sesión
                    window.location.href = "/welcome";
                } else {
                    const data = await response.json();
                    setError(data.error || "Error al borrar la cuenta.");
                }
            } catch (err) {
                setError(
                    "Hubo un problema al borrar la cuenta. Por favor, inténtalo nuevamente."
                );
            }
        }
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
                {!isEditing ? (
                    <>
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
                    </>
                ) : (
                    <>
                        <div>
                            <label
                                htmlFor="name"
                                className="block font-semibold mb-1"
                            >
                                Nombre
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="w-full px-3 py-2 rounded-md text-black"
                                value={editedData.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="surnames"
                                className="block font-semibold mb-1"
                            >
                                Apellidos
                            </label>
                            <input
                                type="text"
                                id="surnames"
                                name="surnames"
                                className="w-full px-3 py-2 rounded-md text-black"
                                value={editedData.surnames}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block font-semibold mb-1"
                            >
                                Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="w-full px-3 py-2 rounded-md text-black"
                                placeholder="Dejar vacío para no cambiar"
                                value={editedData.password}
                                onChange={handleInputChange}
                            />
                        </div>
                    </>
                )}
            </article>

            {error && (
                <div className="mt-4 text-red-600 font-semibold">{error}</div>
            )}

            <div className="w-36 mt-6 flex flex-col justify-center space-y-4">
                {!isEditing ? (
                    <>
                        <button
                            onClick={handleEditToggle}
                            className="bg-green-600 py-2 rounded-lg hover:bg-green-700 transition duration-300 font-semibold"
                        >
                            Editar Perfil
                        </button>
                        <button
                            onClick={onLogout}
                            className="bg-red-600 py-2 rounded-lg hover:bg-red-700 transition duration-300 font-semibold"
                        >
                            Cerrar Sesión
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleSaveChanges}
                            className="bg-green-600 py-2 rounded-lg hover:bg-green-700 transition duration-300  font-semibold"
                        >
                            Guardar Cambios
                        </button>
                        <button
                            onClick={handleEditToggle}
                            className="bg-gray-600 py-2 rounded-lg hover:bg-gray-700 transition duration-300  font-semibold"
                        >
                            Cancelar
                        </button>
                    </>
                )}
                <button
                    onClick={handleDeleteAccount}
                    className="bg-red-800 py-2 rounded-lg hover:bg-red-900 transition duration-300  font-semibold"
                >
                    Borrar Cuenta
                </button>
            </div>

            <div className="mt-6 text-center">
                <Link
                    to="/politica-de-privacidad"
                    className="text-blue-400 underline hover:text-blue-600"
                >
                    Leer nuestra Política de Privacidad
                </Link>
            </div>
        </section>
    );
}

export default Profile;
