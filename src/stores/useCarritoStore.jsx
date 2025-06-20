import { create } from 'zustand';
import { apiUrl } from '../config';

// Sistema de carritos múltiples - cada usuario tiene su propio carrito
const useCarritoStore = create((set, get) => ({
    // Estado del carrito actual
    items: [],
    total: 0,
    isLoading: false,
    userId: null, // Usuario actual
    initialized: false,

    // Función para obtener la clave de storage del carrito
    getStorageKey: (userId = null) => {
        return userId ? `carrito-usuario-${userId}` : 'carrito-anonimo';
    },

    // Función para cargar carrito desde localStorage
    cargarCarrito: (userId = null) => {
        try {
            const key = get().getStorageKey(userId);
            const carritoGuardado = localStorage.getItem(key);

            if (carritoGuardado) {
                const { items, total } = JSON.parse(carritoGuardado);
                console.log(`Cargando carrito ${key}:`, items?.length || 0, 'items');
                return { items: items || [], total: total || 0 };
            }
        } catch (error) {
            console.error('Error cargando carrito:', error);
        }

        return { items: [], total: 0 };
    },

    // Función para guardar carrito en localStorage
    guardarCarrito: (userId = null) => {
        try {
            const key = get().getStorageKey(userId);
            const { items, total } = get();
            const carritoData = { items, total };

            localStorage.setItem(key, JSON.stringify(carritoData));
            console.log(`Guardando carrito ${key}:`, items?.length || 0, 'items');
        } catch (error) {
            console.error('Error guardando carrito:', error);
        }
    },

    // Función para cambiar entre carritos (login/logout)
    cambiarCarrito: (nuevoUserId) => {
        const { userId: userIdActual } = get();

        if (userIdActual === nuevoUserId) return; // No hay cambio

        // Guardar carrito actual
        get().guardarCarrito(userIdActual);

        // Cargar carrito del nuevo usuario
        const carritoNuevo = get().cargarCarrito(nuevoUserId);

        console.log(`Cambiando de carrito: ${get().getStorageKey(userIdActual)} → ${get().getStorageKey(nuevoUserId)}`);

        set({
            items: carritoNuevo.items,
            total: carritoNuevo.total,
            userId: nuevoUserId
        });
    },

    // Función para inicializar el store
    initialize: () => {
        if (!get().initialized) {
            console.log('Inicializando carrito store');

            // Verificar si hay usuario autenticado al inicializar
            let userId = null;
            if (typeof window !== 'undefined' && window.userStore) {
                const userState = window.userStore.getState();
                if (userState.isLoggedIn()) {
                    userId = userState.user?.id_usuario || userState.user?.id_empresa || userState.user?.id;
                }
            }

            // Cargar carrito correspondiente
            const carrito = get().cargarCarrito(userId);

            set({
                items: carrito.items,
                total: carrito.total,
                userId: userId,
                initialized: true
            });
        }
    },

    // Función para manejar cambios de autenticación
    handleAuthChange: (isAuthenticated, userData = null) => {
        const nuevoUserId = isAuthenticated ? (userData?.id_usuario || userData?.id_empresa || userData?.id) : null;

        if (!get().initialized) {
            get().initialize();
        }

        get().cambiarCarrito(nuevoUserId);
    },

    handleRegister: (userData) => {
        const nuevoUserId = userData?.id_usuario || userData?.id_empresa || userData?.id;

        if (!nuevoUserId) {
            console.error('No se pudo obtener el ID del usuario registrado');
            return;
        }

        console.log('Manejando registro de nuevo usuario:', nuevoUserId);

        if (!get().initialized) {
            get().initialize();
        }

        // Para registro: SIEMPRE transferir carrito anónimo
        get().transferirCarritoAnonimo(nuevoUserId, 'registro');
    },

    handleLogin: (userData) => {
        const nuevoUserId = userData?.id_usuario || userData?.id_empresa || userData?.id;

        if (!nuevoUserId) {
            console.error('No se pudo obtener el ID del usuario logueado');
            return;
        }

        console.log('Manejando login de usuario existente:', nuevoUserId);

        if (!get().initialized) {
            get().initialize();
        }

        // Para login: combinar carritos si hay items en el anónimo
        const { items, userId } = get();

        if (userId === null && items.length > 0) {
            // Hay carrito anónimo con items, combinar con carrito del usuario
            get().combinarCarritos(nuevoUserId);
        } else {
            // No hay carrito anónimo o está vacío, cambio normal
            get().cambiarCarrito(nuevoUserId);
        }
    },

    combinarCarritos: (userId) => {
        const { items: itemsAnonimos } = get();

        console.log('Combinando carritos - Items anónimos:', itemsAnonimos.length);

        // Cargar carrito del usuario existente
        const carritoUsuario = get().cargarCarrito(userId);

        console.log('Carrito usuario existente:', carritoUsuario.items.length, 'items');

        if (carritoUsuario.items.length === 0) {
            // Si el usuario no tiene carrito, transferir directamente
            console.log('Usuario no tiene carrito, transfiriendo carrito anónimo');
            get().transferirCarritoAnonimo(userId, 'login');
            return;
        }

        // Combinar los carritos
        const itemsCombinados = [...carritoUsuario.items];
        let itemsAgregados = 0;
        let itemsCombinados_count = 0;

        itemsAnonimos.forEach(itemAnonimo => {
            const itemExistente = itemsCombinados.find(
                item => item.id_producto === itemAnonimo.id_producto &&
                    item.tipo_producto === itemAnonimo.tipo_producto
            );

            if (itemExistente) {
                // Si existe, sumar cantidades
                itemExistente.cantidad += itemAnonimo.cantidad;
                itemsCombinados_count++;
                console.log(`Combinado: ${itemAnonimo.nombre} (${itemAnonimo.cantidad} + ${itemExistente.cantidad - itemAnonimo.cantidad})`);
            } else {
                // Si no existe, agregar el item
                itemsCombinados.push(itemAnonimo);
                itemsAgregados++;
                console.log(`Agregado: ${itemAnonimo.nombre} (${itemAnonimo.cantidad})`);
            }
        });

        // Calcular nuevo total
        const nuevoTotal = itemsCombinados.reduce((sum, item) => {
            return sum + (item.precio * item.cantidad);
        }, 0);

        // Guardar carrito combinado
        const keyUsuario = get().getStorageKey(userId);
        localStorage.setItem(keyUsuario, JSON.stringify({
            items: itemsCombinados,
            total: nuevoTotal
        }));

        // Actualizar estado del store
        set({
            items: itemsCombinados,
            total: nuevoTotal,
            userId: userId
        });

        // Limpiar carrito anónimo
        localStorage.removeItem(get().getStorageKey(null));

        console.log(`Carritos combinados exitosamente:
        - Items agregados: ${itemsAgregados}
        - Items combinados: ${itemsCombinados_count}
        - Total items final: ${itemsCombinados.length}
        - Total: €${nuevoTotal.toFixed(2)}`);

        // Mostrar notificación de éxito
        if (typeof window !== 'undefined' && window.showCartCombineNotification) {
            window.showCartCombineNotification(itemsAgregados, itemsCombinados_count);
        } else if (typeof window !== 'undefined' && window.showCartTransferNotification) {
            window.showCartTransferNotification(itemsAnonimos.length, true);
        }
    },

    // Función para transferir carrito anónimo a usuario registrado
    transferirCarritoAnonimo: (nuevoUserId, tipoAccion = "login") => {
        const { items, total, userId } = get();

        // Solo transferir si hay items en el carrito anónimo y se está logueando
        if (userId === null && items.length > 0 && nuevoUserId) {
            console.log('Transfiriendo carrito anónimo a usuario:', nuevoUserId);
            console.log('Items a transferir:', items.length);

            // Guardar el carrito actual (anónimo) en el nuevo usuario
            const carritoAnonimo = { items, total };
            const keyNuevoUsuario = get().getStorageKey(nuevoUserId);

            try {
                if (tipoAccion === 'registro') {
                    // Para registro: transferir directamente sin verificar carrito existente
                    localStorage.setItem(keyNuevoUsuario, JSON.stringify(carritoAnonimo));

                    set({
                        items,
                        total,
                        userId: nuevoUserId
                    });

                    console.log('Carrito transferido directamente al nuevo usuario registrado');
                } else {
                    // Para login: verificar si hay carrito existente y combinar
                    const carritoExistente = get().cargarCarrito(nuevoUserId);

                    if (carritoExistente.items.length > 0) {
                        // Ya manejado en combinarCarritos()
                        console.log('Combinando con carrito existente...');
                        return;
                    } else {
                        // No tiene carrito, transferir directamente
                        localStorage.setItem(keyNuevoUsuario, JSON.stringify(carritoAnonimo));

                        set({
                            items,
                            total,
                            userId: nuevoUserId
                        });

                        console.log('Carrito transferido al usuario (sin carrito previo)');
                    }
                }

                // Limpiar carrito anónimo
                localStorage.removeItem(get().getStorageKey(null));

                // Mostrar notificación de éxito
                if (typeof window !== 'undefined' && window.showCartTransferNotification) {
                    window.showCartTransferNotification(items.length, tipoAccion === 'registro');
                }

            } catch (error) {
                console.error('Error transfiriendo carrito:', error);
                // En caso de error, al menos cambiar al usuario
                get().cambiarCarrito(nuevoUserId);
            }
        } else {
            // Si no hay carrito anónimo o no hay items, cambio normal
            get().cambiarCarrito(nuevoUserId);
        }
    },

    // Función para hacer logout - cambiar a carrito anónimo
    handleLogout: () => {
        console.log('Logout detectado, cambiando a carrito anónimo');
        get().cambiarCarrito(null);
    },

    // Función para obtener los componentes de un mueble desde la API
    obtenerComponentesMueble: async (id_mueble) => {
        try {
            const response = await fetch(apiUrl + `/mueble/${id_mueble}/componentes`);
            if (!response.ok) {
                // Si es 404, significa que la ruta no existe aún
                if (response.status === 404) {
                    throw new Error('El endpoint de componentes del mueble no está disponible aún');
                }
                throw new Error(`Error HTTP: ${response.status}`);
            }

            // Verificar que la respuesta sea JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('La respuesta no es JSON válido. Verifica que el endpoint esté configurado correctamente.');
            }

            const result = await response.json();

            // Tu API devuelve la estructura: { ok: true, datos: { componentes: [...], mueble: {...} }, mensaje: "..." }
            if (result.ok && result.datos && result.datos.componentes) {
                return result.datos.componentes; // Array de { id_componente, cantidad, nombre, precio, stock_disponible }
            } else if (result.success && result.data && result.data.componentes) {
                // Formato alternativo de respuesta
                return result.data.componentes;
            } else {
                throw new Error(result.mensaje || result.message || 'Error al obtener componentes del mueble');
            }
        } catch (error) {
            console.error('Error obteniendo componentes del mueble:', error);

            // Si el error es de parsing JSON, es probable que el endpoint no exista
            if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
                throw new Error('El endpoint para obtener componentes del mueble no está configurado. Por favor, contacta al administrador.');
            }

            throw error;
        }
    },

    // Función para validar stock de mueble basado en sus componentes
    validarStockMueble: async (mueble, cantidadSolicitada = 1) => {
        try {
            const componentesNecesarios = await get().obtenerComponentesMueble(mueble.id_mueble);
            const { items } = get();

            // Calcular componentes ya reservados en el carrito
            const componentesReservados = {};

            items.forEach(item => {
                if (item.tipo_producto === 'componente') {
                    componentesReservados[item.id_producto] =
                        (componentesReservados[item.id_producto] || 0) + item.cantidad;
                } else if (item.tipo_producto === 'mueble') {
                    // Si hay otros muebles en el carrito, también consumen componentes
                    if (item.componentes_necesarios) {
                        item.componentes_necesarios.forEach(comp => {
                            const cantidadTotal = comp.cantidad * item.cantidad;
                            componentesReservados[comp.id_componente] =
                                (componentesReservados[comp.id_componente] || 0) + cantidadTotal;
                        });
                    }
                }
            });

            // Verificar si hay stock suficiente para cada componente
            for (const componente of componentesNecesarios) {
                const cantidadNecesaria = componente.cantidad * cantidadSolicitada;
                const cantidadReservada = componentesReservados[componente.id_componente] || 0;
                const stockDisponible = componente.stock_disponible || componente.cantidad || 0;

                if (stockDisponible < cantidadNecesaria + cantidadReservada) {
                    throw new Error(
                        `Stock insuficiente del componente "${componente.nombre}". ` +
                        `Necesario: ${cantidadNecesaria}, Disponible: ${stockDisponible - cantidadReservada}`
                    );
                }
            }

            return { valido: true, componentes: componentesNecesarios };
        } catch (error) {
            console.error('Error validando stock del mueble:', error);

            // Si el error es por endpoint no configurado, mostrar un mensaje más amigable
            if (error.message.includes('endpoint') || error.message.includes('no está configurado')) {
                throw new Error('Funcionalidad de muebles en desarrollo. Próximamente disponible.');
            }

            throw error;
        }
    },

    // Acciones del carrito que auto-guardan
    agregarItem: async (producto) => {
        const { items } = get();

        const idProducto = producto.tipo_producto === 'componente'
            ? producto.id_componente
            : producto.id_mueble || producto.id_producto;

        const itemExistente = items.find(
            item => item.id_producto === idProducto &&
                item.tipo_producto === producto.tipo_producto
        );

        if (producto.tipo_producto === 'mueble') {
            // Validar stock del mueble y sus componentes
            const cantidadSolicitada = itemExistente ? itemExistente.cantidad + 1 : 1;
            const validacion = await get().validarStockMueble(producto, cantidadSolicitada);

            if (itemExistente) {
                set(state => ({
                    items: state.items.map(item =>
                        item.id_producto === idProducto &&
                            item.tipo_producto === producto.tipo_producto
                            ? {
                                ...item,
                                cantidad: item.cantidad + 1,
                                componentes_necesarios: validacion.componentes
                            }
                            : item
                    )
                }));
            } else {
                const nuevoItem = {
                    id_producto: idProducto,
                    tipo_producto: producto.tipo_producto,
                    nombre: producto.nombre,
                    precio: producto.precio_base || producto.precio,
                    descripcion: producto.descripcion,
                    cantidad: 1,
                    componentes_necesarios: validacion.componentes,
                    requiere_montar: producto.requiere_montar,
                    fecha_entrega: producto.fecha_entrega
                };

                set(state => ({
                    items: [...state.items, nuevoItem]
                }));
            }
        } else {
            // Lógica original para componentes
            if (itemExistente) {
                // Verificar stock antes de incrementar
                if (itemExistente.stock_disponible &&
                    itemExistente.cantidad >= itemExistente.stock_disponible) {
                    throw new Error(`Stock insuficiente. Disponible: ${itemExistente.stock_disponible}`);
                }

                set(state => ({
                    items: state.items.map(item =>
                        item.id_producto === idProducto &&
                            item.tipo_producto === producto.tipo_producto
                            ? { ...item, cantidad: item.cantidad + 1 }
                            : item
                    )
                }));
            } else {
                const nuevoItem = {
                    id_producto: idProducto,
                    tipo_producto: producto.tipo_producto,
                    nombre: producto.nombre,
                    precio: producto.precio || producto.precio_base,
                    descripcion: producto.descripcion,
                    cantidad: 1,
                    stock_disponible: producto.cantidad || 0,
                    material: producto.material
                };

                set(state => ({
                    items: [...state.items, nuevoItem]
                }));
            }
        }

        get().calcularTotal();
        get().guardarCarrito(get().userId);
    },

    eliminarItem: (id_producto, tipo_producto) => {
        set(state => ({
            items: state.items.filter(
                item => !(item.id_producto === id_producto &&
                    item.tipo_producto === tipo_producto)
            )
        }));
        get().calcularTotal();
        get().guardarCarrito(get().userId);
    },

    actualizarCantidad: async (id_producto, tipo_producto, cantidad) => {
        if (cantidad <= 0) {
            get().eliminarItem(id_producto, tipo_producto);
            return;
        }

        const { items } = get();
        const item = items.find(item =>
            item.id_producto === id_producto &&
            item.tipo_producto === tipo_producto
        );

        if (!item) return;

        if (tipo_producto === 'mueble') {
            // Validar stock para la nueva cantidad de muebles
            const mueble = {
                id_mueble: id_producto,
                tipo_producto: 'mueble'
            };
            await get().validarStockMueble(mueble, cantidad);
        } else {
            // Validación original para componentes
            if (item.stock_disponible && cantidad > item.stock_disponible) {
                throw new Error(`Stock insuficiente. Disponible: ${item.stock_disponible}`);
            }
        }

        set(state => ({
            items: state.items.map(item =>
                item.id_producto === id_producto &&
                    item.tipo_producto === tipo_producto
                    ? { ...item, cantidad }
                    : item
            )
        }));
        get().calcularTotal();
        get().guardarCarrito(get().userId);
    },

    calcularTotal: () => {
        const { items } = get();
        const total = items.reduce((sum, item) => {
            return sum + (item.precio * item.cantidad);
        }, 0);

        set({ total });
    },

    limpiarCarrito: () => {
        set({ items: [], total: 0 });
        get().guardarCarrito(get().userId);
    },

    // Función para procesar el pedido con autenticación
    procesarPedido: async () => {
        const { items, userId } = get();

        if (items.length === 0) {
            throw new Error('El carrito está vacío');
        }

        // Verificar autenticación
        if (!userId) {
            throw new Error('Debes iniciar sesión para realizar un pedido');
        }

        // Validar stock antes de procesar el pedido
        for (const item of items) {
            if (item.tipo_producto === 'mueble') {
                const mueble = { id_mueble: item.id_producto, tipo_producto: 'mueble' };
                await get().validarStockMueble(mueble, item.cantidad);
            }
        }

        // Obtener token de autenticación
        let token = null;
        if (typeof window !== 'undefined' && window.userStore) {
            const userState = window.userStore.getState();
            token = userState.getToken();

            if (!token) {
                throw new Error('Token de autenticación no válido');
            }
        }

        set({ isLoading: true });

        try {
            const pedidoData = {
                id_usuario: userId,
                productos: items.map(item => ({
                    id_producto: item.id_producto,
                    tipo_producto: item.tipo_producto,
                    cantidad: item.cantidad,
                    // Incluir componentes necesarios para muebles
                    ...(item.tipo_producto === 'mueble' && {
                        componentes_necesarios: item.componentes_necesarios
                    })
                }))
            };

            const response = await fetch('/api/pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(pedidoData)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expirado, hacer logout
                    if (window.userStore) {
                        window.userStore.getState().logout();
                    }
                    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
                }

                const errorData = await response.json();
                throw new Error(errorData.mensaje || errorData.message || 'Error al procesar el pedido');
            }

            const resultado = await response.json();
            get().limpiarCarrito();
            return resultado;

        } catch (error) {
            console.error('Error procesando pedido:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // Getters útiles
    getCantidadTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.cantidad, 0);
    },

    tieneProducto: (id_producto, tipo_producto) => {
        const { items } = get();
        const idBuscar = typeof id_producto === 'object'
            ? (tipo_producto === 'componente' ? id_producto.id_componente : id_producto.id_mueble)
            : id_producto;

        return items.some(
            item => item.id_producto === idBuscar &&
                item.tipo_producto === tipo_producto
        );
    },

    validarStock: async (producto) => {
        if (producto.tipo_producto === 'mueble') {
            try {
                await get().validarStockMueble(producto, 1);
                return true;
            } catch (error) {
                console.error('Error validando stock del mueble:', error);
                return false;
            }
        } else {
            // Validación original para componentes
            const { items } = get();
            const idProducto = producto.id_componente || producto.id_producto;

            const itemEnCarrito = items.find(
                item => item.id_producto === idProducto &&
                    item.tipo_producto === producto.tipo_producto
            );

            const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
            const stockDisponible = producto.cantidad || 0;

            return cantidadEnCarrito < stockDisponible;
        }
    },

    // Función para obtener resumen de componentes necesarios para todo el carrito
    getResumenComponentes: () => {
        const { items } = get();
        const resumenComponentes = {};

        items.forEach(item => {
            if (item.tipo_producto === 'componente') {
                resumenComponentes[item.id_producto] = {
                    nombre: item.nombre,
                    cantidad: (resumenComponentes[item.id_producto]?.cantidad || 0) + item.cantidad,
                    precio: item.precio,
                    tipo: 'directo'
                };
            } else if (item.tipo_producto === 'mueble' && item.componentes_necesarios) {
                item.componentes_necesarios.forEach(comp => {
                    const cantidadTotal = comp.cantidad * item.cantidad;
                    resumenComponentes[comp.id_componente] = {
                        nombre: comp.nombre,
                        cantidad: (resumenComponentes[comp.id_componente]?.cantidad || 0) + cantidadTotal,
                        precio: comp.precio,
                        tipo: resumenComponentes[comp.id_componente]?.tipo === 'directo' ? 'mixto' : 'mueble'
                    };
                });
            }
        });

        return resumenComponentes;
    },

    // Función para obtener el ID del usuario actual
    getCurrentUserId: () => {
        return get().userId;
    },

    // Función para verificar si el usuario está autenticado
    isUserAuthenticated: () => {
        return !!get().userId;
    },

    // Función para debug - ver todos los carritos guardados
    debugCarritos: () => {
        const carritos = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('carrito-')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    carritos[key] = data;
                } catch (e) {
                    carritos[key] = 'Error parsing';
                    console.error(`Error parsing carrito ${key}:`, e);
                }
            }
        }
        console.table(carritos);
        return carritos;
    }
}));

// Exponer el store globalmente para integración con useUserStore
if (typeof window !== 'undefined') {
    window.carritoStore = useCarritoStore;

    // Inicializar cuando se carga el módulo
    setTimeout(() => {
        useCarritoStore.getState().initialize();
    }, 0);
}

export default useCarritoStore;