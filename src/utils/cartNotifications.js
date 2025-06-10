// Función simple para mostrar notificación de carrito transferido
import logo from "../assets/logo.jpg";

/**
 * Muestra una notificación cuando se transfiere el carrito
 * @param {number} itemCount - Cantidad de items transferidos
 * @param {boolean} isRegistration - Si es un registro nuevo o login
 */
export const showCartTransferNotification = (
  itemCount,
  isRegistration = false
) => {
  // Usar notificaciones del navegador si están disponibles
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("🛒 Carrito Mantenido", {
      body: `${itemCount} artículo${itemCount > 1 ? "s" : ""} ${
        isRegistration
          ? "guardados en tu nueva cuenta"
          : "mantenidos en tu sesión"
      }`,
      icon: logo, // Cambia por tu logo
      tag: "cart-transfer", // Para evitar spam de notificaciones
    });
  }

  // Fallback: mostrar en consola
  console.log(
    `✅ Carrito transferido: ${itemCount} items ${
      isRegistration ? "guardados en nueva cuenta" : "mantenidos"
    }`
  );
};

/**
 * Solicita permisos para notificaciones (llamar al inicio de la app)
 */
export const requestNotificationPermission = () => {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
};

// Exponer globalmente para que el carrito store pueda usarla
if (typeof window !== "undefined") {
  window.showCartTransferNotification = showCartTransferNotification;
}

export const showCartCombineNotification = (itemsAdded, itemsCombined) => {
  const totalChanges = itemsAdded + itemsCombined;

  if (totalChanges === 0) {
    console.log("ℹ️ Login completado, carrito cargado sin cambios");
    return;
  }

  let message;
  if (itemsAdded > 0 && itemsCombined > 0) {
    message = `${itemsAdded} productos nuevos agregados, ${itemsCombined} actualizados`;
  } else if (itemsAdded > 0) {
    message = `${itemsAdded} producto${itemsAdded > 1 ? "s" : ""} nuevo${
      itemsAdded > 1 ? "s" : ""
    } agregado${itemsAdded > 1 ? "s" : ""}`;
  } else {
    message = `${itemsCombined} producto${
      itemsCombined > 1 ? "s" : ""
    } actualizado${itemsCombined > 1 ? "s" : ""}`;
  }

  // Usar notificaciones del navegador si están disponibles
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("🛒 Carrito Combinado", {
      body: `¡Bienvenido de vuelta! ${message}`,
      icon: logo,
      tag: "cart-combine",
    });
  }

  // Fallback: mostrar en consola
  console.log(
    `✅ Carritos combinados: +${itemsAdded} nuevos, ~${itemsCombined} actualizados`
  );
};

// Exponer globalmente para que el carrito store pueda usarlas
if (typeof window !== "undefined") {
  window.showCartTransferNotification = showCartTransferNotification;
  window.showCartCombineNotification = showCartCombineNotification;

  console.log("📱 Notificaciones del carrito registradas globalmente");
}
