import { apiUrl } from "../config";
import useUserStore from "../stores/useUserStore";

/**
 * Realiza una llamada autenticada a la API
 * @param {string} endpoint - Endpoint de la API (ej: "/pedidos")
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<Response>} - Respuesta de la API
 */
export const authenticatedApiCall = async (endpoint, options = {}) => {
  // Obtener el estado actual del store
  const store = useUserStore.getState();
  
  // Obtener token
  const token = store.getToken();
  
  // Headers por defecto
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Agregar token si existe
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  // Configuración final
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  console.log('API Call:', {
    url: `${apiUrl}${endpoint}`,
    method: config.method || 'GET',
    hasToken: !!token,
    headers: config.headers
  });
  
  try {
    const response = await fetch(`${apiUrl}${endpoint}`, config);
    
    // Manejar token expirado o no autorizado
    if (response.status === 401) {
      console.warn('Token expirado o no autorizado');
      
      // Limpiar store de usuario
      store.logout();
      
      // Opcional: redirigir al login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
    }
    
    return response;
    
  } catch (error) {
    console.error('Error en API call:', error);
    throw error;
  }
};

/**
 * Crear un pedido usando la API autenticada
 * @param {Object} pedidoData - Datos del pedido
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const crearPedido = async (pedidoData) => {
  try {
    console.log('Creando pedido con datos:', pedidoData);
    
    const response = await authenticatedApiCall('/pedidos', {
      method: 'POST',
      body: JSON.stringify(pedidoData)
    });

    // Manejar otros errores HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.mensaje || errorData?.error || `Error ${response.status}`;
      throw new Error(errorMessage);
    }
    
    const responseData = await response.json();
    console.log('Respuesta del servidor:', responseData);
    
    return {
      success: true,
      data: responseData.datos,
      message: responseData.mensaje || 'Pedido creado exitosamente',
      pedidoId: responseData.datos?.id_pedido
    };
    
  } catch (error) {
    console.error('Error creando pedido:', error);
    
    return {
      success: false,
      error: error.message,
      message: error.message
    };
  }
};

/**
 * Verificar si el usuario está autenticado y tiene token válido
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const store = useUserStore.getState();
  return store.isLoggedIn();
};

/**
 * Obtener información del usuario actual
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  const store = useUserStore.getState();
  return store.user;
};

/**
 * Obtener token del usuario actual
 * @returns {string|null}
 */
export const getCurrentToken = () => {
  const store = useUserStore.getState();
  return store.getToken();
};

/**
 * Manejar errores de autenticación en componentes
 * @param {Function} navigate - Función de navegación de React Router
 * @param {Function} showSnackbar - Función para mostrar notificaciones
 */
export const handleAuthError = (navigate, showSnackbar) => {
  showSnackbar('Sesión expirada. Redirigiendo al login...', 'warning');
  
  setTimeout(() => {
    navigate('/login');
  }, 2000);
};

// Función de utilidad para usar en el componente de login
export const handleSuccessfulLogin = (userData, token) => {
  const store = useUserStore.getState();
  store.login(userData, token);
  
  console.log('Login exitoso:', {
    user: userData,
    hasToken: !!token,
    userType: userData?.type
  });
};

/**
 * Interceptor para manejar respuestas de API automáticamente
 * @param {Response} response - Respuesta de fetch
 * @param {Function} navigate - Función de navegación (opcional)
 * @param {Function} showSnackbar - Función de notificación (opcional)
 * @returns {Promise<any>} - Datos de la respuesta
 */
export const handleApiResponse = async (response, navigate = null, showSnackbar = null) => {
  try {
    if (response.status === 401) {
      if (showSnackbar) {
        showSnackbar('Sesión expirada. Por favor, inicia sesión nuevamente.', 'error');
      }
      
      // Limpiar store
      const store = useUserStore.getState();
      if (store.logout) {
        store.logout();
      }
      
      // Redirigir si se proporciona navigate
      if (navigate) {
        setTimeout(() => navigate('/login'), 1500);
      }
      
      throw new Error('Sesión expirada');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.mensaje || errorData?.error || `Error ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Error en handleApiResponse:', error);
    throw error;
  }
};