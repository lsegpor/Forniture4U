import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Hook personalizado para gestionar el estado del usuario.
 * Utiliza la biblioteca Zustand para la gestión del estado y persistencia en sessionStorage.
 */
const useUserStore = create(
    persist(
        (set, get) => ({
            user: { type: "none" }, // Estado inicial sin usuario (type puede ser 'none', 'usuario' o 'empresa')
            token: null, // Token de autenticación, inicialmente nulo

            /**
             * Establece los datos del usuario.
             * @param {Object} userData - Datos del usuario.
             * @param {string} authToken - Token de autenticación (opcional).
             */
            setUser: (userData, authToken = null) => {
                // Determinar el tipo de usuario basado en los campos que contiene
                let userType = "none";

                if (userData) {
                    // Si tiene id_usuario o campos específicos de usuario como f_nacimiento/sexo
                    if (userData.id_usuario || userData.sexo || userData.f_nacimiento) {
                        userType = "usuario";
                    }
                    // Si tiene id_empresa o campos específicos de empresa como cif_nif_nie/nombre_empresa
                    else if (userData.id_empresa || userData.cif_nif_nie || userData.nombre_empresa) {
                        userType = "empresa";
                    }

                    // Añadir el tipo al objeto userData
                    userData.type = userType;
                }

                set({
                    user: userData || { type: "none" },
                    token: authToken || get().token // Mantener el token existente si no se proporciona uno nuevo
                });
            },

            /**
             * Método específico para login con token
             * @param {Object} userData - Datos del usuario
             * @param {string} authToken - Token de autenticación
             */
            login: (userData, authToken) => {
                get().setUser(userData, authToken);

                // Notificar al carrito del cambio de autenticación
                if (window.carritoStore) {
                    window.carritoStore.getState().handleAuthChange(true, userData);
                }
            },

            /**
             * Establece solo el token (útil para renovar tokens)
             * @param {string} authToken - Nuevo token de autenticación
             */
            setToken: (authToken) => {
                set({ token: authToken });
            },

            /**
             * Limpia los datos del usuario.
             */
            clearUser: () => {
                set({
                    user: { type: "none" },
                    token: null
                });

                // Notificar al carrito del cambio de autenticación
                if (window.carritoStore) {
                    window.carritoStore.getState().handleLogout();
                }
            },

            /**
             * Método específico para logout
             */
            logout: () => {
                get().clearUser();
            },

            // Métodos de validación

            /**
             * Verifica si el usuario ha iniciado sesión.
             * @returns {boolean} - Verdadero si el usuario ha iniciado sesión, falso en caso contrario.
             */
            isLoggedIn: () => {
                const { user, token } = get();
                return !!(user?.type && user.type !== "none" && token);
            },

            /**
             * Verifica si el usuario es un usuario personal.
             * @returns {boolean} - Verdadero si es un usuario personal, falso en caso contrario.
             */
            isUsuario: () => get().user?.type === "usuario",

            /**
             * Verifica si el usuario es una empresa.
             * @returns {boolean} - Verdadero si es una empresa, falso en caso contrario.
             */
            isEmpresa: () => get().user?.type === "empresa",

            /**
             * Obtiene el tipo de usuario actual.
             * @returns {string} - El tipo de usuario: 'usuario', 'empresa' o 'none'.
             */
            getUserType: () => get().user?.type || "none",

            // Métodos para manejo de tokens

            /**
             * Obtiene el token actual
             * @returns {string|null} - Token de autenticación o null
             */
            getToken: () => get().token,

            /**
             * Verifica si hay un token válido
             * @returns {boolean} - True si hay token, false si no
             */
            hasValidToken: () => !!get().token,

            /**
             * Obtiene headers de autenticación para API calls
             * @returns {Object} - Headers con token incluido
             */
            getAuthHeaders: () => {
                const token = get().token;
                return {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                };
            },

            /**
             * Verifica si el token ha expirado (básico)
             * @returns {boolean} - True si el token parece expirado
             */
            isTokenExpired: () => {
                const token = get().token;
                if (!token) return true;

                try {
                    // Decodificar JWT básico (solo la parte payload)
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const currentTime = Date.now() / 1000;
                    return payload.exp < currentTime;
                } catch (error) {
                    console.warn('Error verificando expiración del token:', error);
                    return false; // Si no se puede verificar, asumir que es válido
                }
            },

            /**
             * Renueva el token automáticamente si está próximo a expirar
             * @param {Function} renewFunction - Función para renovar el token
             */
            autoRenewToken: async (renewFunction) => {
                const token = get().token;
                if (!token) return;

                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const currentTime = Date.now() / 1000;
                    const timeUntilExpiry = payload.exp - currentTime;

                    // Renovar si quedan menos de 5 minutos
                    if (timeUntilExpiry < 300) {
                        const newToken = await renewFunction(token);
                        if (newToken) {
                            get().setToken(newToken);
                        }
                    }
                } catch (error) {
                    console.warn('Error en renovación automática de token:', error);
                }
            }
        }),
        {
            name: "user-storage", // Clave en sessionStorage
            storage: createJSONStorage(() => sessionStorage), // Para cambiar a sessionStorage
        }
    )
);

export default useUserStore;