import { useEffect, useRef } from "react";
import useUserStore from "../stores/useUserStore";
import useCarritoStore from "../stores/useCarritoStore";

/**
 * Hook que escucha cambios en la autenticación y cambia entre carritos
 */
export const useAuthListener = () => {
  const user = useUserStore((state) => state.user);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn());
  const { handleAuthChange, handleLogout, initialize } = useCarritoStore();

  // Referencias para detectar cambios
  const previousUserRef = useRef(user);
  const previousLoggedInRef = useRef(isLoggedIn);
  const initializedRef = useRef(false);

  // Inicializar el store cuando tengamos los datos del usuario cargados
  useEffect(() => {
    // Esperamos a que Zustand haya hidratado el estado del usuario
    const timer = setTimeout(() => {
      if (!initializedRef.current) {
        console.log("Inicializando carrito con estado del usuario:", {
          isLoggedIn,
          userId: user?.id_usuario || user?.id,
        });

        initialize();

        // Si hay usuario logueado al cargar la página, cambiar a su carrito
        if (isLoggedIn && (user?.id_usuario || user?.id)) {
          console.log(
            "Usuario logueado detectado al inicializar, cargando su carrito"
          );
          handleAuthChange(true, user);
        }

        initializedRef.current = true;

        // Establecer referencias iniciales
        previousUserRef.current = user;
        previousLoggedInRef.current = isLoggedIn;
      }
    }, 100); // Pequeño delay para permitir hidratación

    return () => clearTimeout(timer);
  }, [handleAuthChange, initialize, isLoggedIn, user]); // Solo ejecutar una vez

  // Manejar cambios de autenticación (después de la inicialización)
  useEffect(() => {
    // Solo procesar después de la inicialización
    if (!initializedRef.current) return;

    const previousLoggedIn = previousLoggedInRef.current;
    const currentLoggedIn = isLoggedIn;

    // Detectar cambios en el estado de login
    if (previousLoggedIn !== currentLoggedIn) {
      if (currentLoggedIn) {
        // Login: cambiar a carrito del usuario
        console.log("Login detectado, cambiando a carrito del usuario");
        handleAuthChange(true, user);
      } else {
        // Logout: cambiar a carrito anónimo
        console.log("Logout detectado, cambiando a carrito anónimo");
        handleLogout();
      }
    } else if (currentLoggedIn) {
      // Usuario ya logueado, verificar si cambió de usuario
      const previousUserId =
        previousUserRef.current?.id_usuario || previousUserRef.current?.id;
      const currentUserId = user?.id_usuario || user?.id;

      if (previousUserId && currentUserId && previousUserId !== currentUserId) {
        console.log(`Cambio de usuario: ${previousUserId} → ${currentUserId}`);
        handleAuthChange(true, user);
      }
    }

    // Actualizar referencias
    previousUserRef.current = user;
    previousLoggedInRef.current = currentLoggedIn;
  }, [user, isLoggedIn, handleAuthChange, handleLogout]);
};

/**
 * Componente para usar en App.js - escucha cambios de autenticación
 */
export const AuthListener = () => {
  useAuthListener();
  return null;
};
