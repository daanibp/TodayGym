// serviceWorkerRegistration.js

// Este archivo es usado para registrar un service worker en producción.
// Esto proporciona soporte offline y hace que la app cargue más rápido.
// Sin embargo, también introduce algunos problemas. Los usuarios necesitarán
// recargar la página para ver los cambios en las actualizaciones.

const isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
        // [::1] es el IPv6 localhost.
        window.location.hostname === "[::1]" ||
        // 127.0.0.1/8 es considerado localhost en IPv4.
        window.location.hostname.match(
            /^127(?:\.\d{1,3}){3}$/ // Coincide con direcciones 127.0.0.1
        )
);

export function register(config) {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
        // El constructor de URL está disponible en todos los navegadores que soportan service workers.
        const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
        if (publicUrl.origin !== window.location.origin) {
            // Si PUBLIC_URL está en un origen diferente al de la página actual,
            // simplemente vuelve, ya que el service worker no funcionará.
            return;
        }

        window.addEventListener("load", () => {
            const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

            if (isLocalhost) {
                // Esto es una verificación localhost. Verifica si el service worker aún existe o no.
                checkValidServiceWorker(swUrl, config);

                // Agrega más logs a localhost, apúntalo a la consola del desarrollador.
                navigator.serviceWorker.ready.then(() => {
                    console.log(
                        "Esta web está siendo servida mediante un service worker en modo localhost."
                    );
                });
            } else {
                // Registrar el service worker
                registerValidSW(swUrl, config);
            }
        });
    }
}

function registerValidSW(swUrl, config) {
    navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (installingWorker == null) {
                    return;
                }
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === "installed") {
                        if (navigator.serviceWorker.controller) {
                            // Ejecutar la lógica cuando el contenido se ha actualizado.
                            console.log(
                                "Nuevo contenido está disponible y se descargará."
                            );

                            // Ejecutar callback si está disponible
                            if (config && config.onUpdate) {
                                config.onUpdate(registration);
                            }
                        } else {
                            // El contenido se precachó por primera vez.
                            console.log(
                                "El contenido se precachó para su uso offline."
                            );

                            // Ejecutar callback si está disponible
                            if (config && config.onSuccess) {
                                config.onSuccess(registration);
                            }
                        }
                    }
                };
            };
        })
        .catch((error) => {
            console.error(
                "Error durante el registro del service worker:",
                error
            );
        });
}

function checkValidServiceWorker(swUrl, config) {
    // Verifica si el service worker aún puede encontrarse en el servidor.
    fetch(swUrl, {
        headers: { "Service-Worker": "script" },
    })
        .then((response) => {
            // Asegúrate de que el service worker exista y que se sirva con contenido JavaScript.
            const contentType = response.headers.get("content-type");
            if (
                response.status === 404 ||
                (contentType != null &&
                    contentType.indexOf("javascript") === -1)
            ) {
                // No se encontró ningún service worker. Probablemente sea una app diferente.
                navigator.serviceWorker.ready.then((registration) => {
                    registration.unregister().then(() => {
                        window.location.reload();
                    });
                });
            } else {
                // El service worker fue encontrado. Procede a registrarlo.
                registerValidSW(swUrl, config);
            }
        })
        .catch(() => {
            console.log(
                "No se pudo encontrar una conexión a Internet. La aplicación se está ejecutando en modo offline."
            );
        });
}

export function unregister() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
            })
            .catch((error) => {
                console.error(error.message);
            });
    }
}
