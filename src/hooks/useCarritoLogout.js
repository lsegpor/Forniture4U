import { useEffect, useRef } from "react";
import useUserStore from "../stores/useUserStore";
import { useCarritoConAuth } from "../stores/carritoStore";

/**
 * Hook que detecta automáticamente el logout y limpia el carrito
 * Usar este hook en el componente principal (App.js) o en componentes de alto nivel
 */
export const useCarritoLogout = () => {
  const user = useUserStore((state) => state.user);
  const { handleLogout } = useCarritoConAuth();
  const previousUserRef = useRef(user);

  useEffect(() => {
    const previousUser = previousUserRef.current;
    const currentUser = user;

    // Detectar logout: había usuario y ahora no hay
    if (previousUser && !currentUser) {
      console.log("Logout detectado, limpiando carrito de sesión");
      handleLogout();
    }

    // Actualizar la referencia anterior
    previousUserRef.current = currentUser;
  }, [user, handleLogout]);

  return null; // Este hook no renderiza nada
};

// Componente para usar en App.js
export const CarritoLogoutListener = () => {
  useCarritoLogout();
  return null;
};
