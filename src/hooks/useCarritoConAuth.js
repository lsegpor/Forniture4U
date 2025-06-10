import useCarritoStore from "../stores/useCarritoStore";

export const useCarritoConAuth = () => {
  const carritoStore = useCarritoStore();

  return {
    // Métodos del carrito
    ...carritoStore,

    // Métodos específicos para autenticación
    handleLogin: (userData) => {
      console.log("useCarritoConAuth: Manejando login");
      carritoStore.handleLogin(userData);
    },

    handleRegister: (userData) => {
      console.log("useCarritoConAuth: Manejando registro");
      carritoStore.handleRegister(userData);
    },

    handleLogout: () => {
      console.log("useCarritoConAuth: Manejando logout");
      carritoStore.handleLogout();
    },

    // Método para verificar si se puede hacer pedido
    canCheckout: () => {
      return (
        carritoStore.isUserAuthenticated() && carritoStore.items.length > 0
      );
    },

    // Método para manejar checkout con verificación de autenticación
    checkout: async () => {
      if (!carritoStore.isUserAuthenticated()) {
        throw new Error("Debes iniciar sesión para realizar un pedido");
      }

      if (carritoStore.items.length === 0) {
        throw new Error("El carrito está vacío");
      }

      return await carritoStore.procesarPedido();
    },
  };
};
