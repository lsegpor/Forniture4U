import { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Button,
    TextField,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    Box,
    Tabs,
    Tab,
    IconButton,
    FormControlLabel,
    Checkbox,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    ToggleButton,
    ToggleButtonGroup,
    Badge,
    Divider,
    useMediaQuery,
    useTheme,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Stack,
    Avatar
} from '@mui/material';
import {
    Business as BusinessIcon,
    ShoppingCart as ShoppingCartIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    Refresh as RefreshIcon,
    Visibility as VisibilityIcon,
    Delete as DeleteIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material';
import useUserStore from "../../stores/useUserStore";
import { apiUrl } from "../../config";
import "../../style/Perfiles.css";
import EstadoChipEditable from '../ui/EstadoChipEditable';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Componente del perfil de empresa con pestañas para datos de la empresa e historial de pedidos.
 * @returns {JSX.Element} El componente del perfil de empresa.
 */
function PerfilEmpresa() {
    const [activeTab, setActiveTab] = useState(0);
    const [empresaData, setEmpresaData] = useState({
        nombre_empresa: '',
        cif_nif_nie: '',
        direccion: '',
        nombre_personal: '',
        apellidos: '',
        email: '',
        ofertas: false
    });
    const [pedidos, setPedidos] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [modalDetallesOpen, setModalDetallesOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [pedidoAEliminar, setPedidoAEliminar] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('todos');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);
    const isLoggedIn = useUserStore((state) => state.isLoggedIn);
    const isEmpresa = useUserStore((state) => state.isEmpresa);

    const handleClickOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = () => {
        setOpen(false);
    };

    const handleVerDetalles = (pedido) => {
        setPedidoSeleccionado(pedido);
        setModalDetallesOpen(true);
    };

    const handleCloseDetalles = () => {
        setModalDetallesOpen(false);
        setPedidoSeleccionado(null);
    };

    const handleEliminarPedido = (pedido) => {
        setPedidoAEliminar(pedido);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!pedidoAEliminar) return;

        const token = useUserStore.getState().getToken();

        try {
            if (!token) {
                setMessage('Error: No hay token de autenticación. Por favor, inicia sesión nuevamente.');
                handleClickOpen();
                return;
            }

            const response = await fetch(`${apiUrl}/pedidos/${pedidoAEliminar.id_pedido}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                setMessage(result.mensaje || 'Pedido eliminado exitosamente');
                // Recargar la lista de pedidos
                cargarHistorialPedidos();
            } else {
                const errorData = await response.json();
                if (response.status === 401) {
                    setMessage('Sesión expirada. Por favor, inicia sesión nuevamente.');
                } else {
                    setMessage(errorData.mensaje || 'Error al eliminar el pedido');
                }
            }
        } catch (error) {
            console.error('Error eliminando pedido:', error);
            setMessage('Error de conexión al eliminar el pedido');
        } finally {
            setConfirmDeleteOpen(false);
            setPedidoAEliminar(null);
            handleClickOpen();
        }
    };

    const handleCancelDelete = () => {
        setConfirmDeleteOpen(false);
        setPedidoAEliminar(null);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Cargar datos de la empresa al montar el componente
    useEffect(() => {
        if (user) {
            setEmpresaData({
                nombre_empresa: user.nombre_empresa || '',
                cif_nif_nie: user.cif_nif_nie || '',
                direccion: user.direccion || '',
                nombre_personal: user.nombre_personal || '',
                apellidos: user.apellidos || '',
                email: user.email || '',
                ofertas: user.ofertas || false
            });
        }
    }, [user]);

    /**
     * Carga el historial de pedidos (todos los pedidos para empresas)
     */
    const cargarHistorialPedidos = useCallback(async () => {
        if (!isLoggedIn() || !user?.type === 'empresa') {
            return;
        }

        try {
            const url = `${apiUrl}/pedidos/empresa/mis-pedidos?limite=50&pagina=1&orden=DESC`;
            const token = useUserStore.getState().getToken();

            if (!token) {
                return;
            }

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${useUserStore.getState().getToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Manejo de la estructura de respuesta esperada: {ok, datos, mensaje}
                if (data.ok && data.datos && data.datos.pedidos) {
                    setPedidos(data.datos.pedidos);
                } else {
                    setPedidos([]);
                }
            } else {
                if (isLoggedIn() && response.status !== 401) {
                    setMessage('Error al cargar el historial de pedidos');
                    handleClickOpen();
                }
                setPedidos([]);
            }
        } catch (error) {
            if (isLoggedIn()) {
                console.error('Error en la petición:', error);
                setMessage('Error de conexión al cargar pedidos');
                handleClickOpen();
            }
        }
    }, [handleClickOpen, user?.type, isLoggedIn]);

    // Cargar historial de pedidos cuando se selecciona la pestaña
    useEffect(() => {
        if (activeTab === 1 && isLoggedIn() && user?.type === 'empresa') {
            cargarHistorialPedidos();
        }
    }, [activeTab, cargarHistorialPedidos, isLoggedIn, user?.type]);

    /**
     * Maneja los cambios en los campos del formulario
     */
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEmpresaData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    /**
     * Guarda los cambios en los datos de la empresa
     */
    const guardarCambios = async () => {
        if (!user?.id_empresa) return;

        const token = useUserStore.getState().getToken();

        try {
            if (!token) {
                setMessage('Error: No hay token de autenticación. Por favor, inicia sesión nuevamente.');
                handleClickOpen();
                return;
            }

            const response = await fetch(`${apiUrl}/empresa/actualizar`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(empresaData)
            });

            if (response.ok) {
                const result = await response.json();

                // Estructura de tu respuesta: {ok, datos, mensaje}
                if (result.ok && result.datos) {
                    const updatedUserData = {
                        ...result.datos,
                        token: token // Mantener el token
                    };

                    setUser(updatedUserData, token);
                    setEditMode(false);
                    setMessage(result.mensaje || 'Datos actualizados correctamente');
                } else {
                    setMessage(result.mensaje || 'Error al actualizar los datos');
                }
            } else {
                const errorData = await response.json();

                if (response.status === 401) {
                    setMessage('Sesión expirada. Por favor, inicia sesión nuevamente.');
                } else {
                    setMessage(errorData.mensaje || 'Error al actualizar los datos');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error de conexión al actualizar datos');
        } finally {
            handleClickOpen();
        }
    };

    /**
     * Cancela la edición y restaura los datos originales
     */
    const cancelarEdicion = () => {
        if (user) {
            setEmpresaData({
                nombre_empresa: user.nombre_empresa || '',
                cif_nif_nie: user.cif_nif_nie || '',
                direccion: user.direccion || '',
                nombre_personal: user.nombre_personal || '',
                apellidos: user.apellidos || '',
                email: user.email || '',
                ofertas: user.ofertas || false
            });
        }
        setEditMode(false);
    };

    /**
     * Formatea la fecha para mostrar
     */
    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        return new Date(fecha).toLocaleDateString('es-ES');
    };

    /**
     * Formatea el precio
     */
    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(precio);
    };

    /**
    * Maneja el cambio de estado de un pedido
    */
    const handleEstadoChange = async (idPedido, nuevoEstado) => {
        const token = useUserStore.getState().getToken();

        try {
            if (!token) {
                setMessage('Error: No hay token de autenticación. Por favor, inicia sesión nuevamente.');
                handleClickOpen();
                throw new Error('No token');
            }

            const response = await fetch(`${apiUrl}/pedidos/${idPedido}/estado`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401) {
                    setMessage('Sesión expirada. Por favor, inicia sesión nuevamente.');
                } else {
                    setMessage(errorData.mensaje || 'Error al actualizar el estado del pedido');
                }
                handleClickOpen();
                throw new Error(errorData.mensaje || 'Error actualizando estado');
            }

            const result = await response.json();

            // Actualizar el estado local del pedido
            setPedidos(prevPedidos =>
                prevPedidos.map(pedido =>
                    pedido.id_pedido === idPedido
                        ? { ...pedido, estado: nuevoEstado }
                        : pedido
                )
            );

            // Mostrar mensaje de éxito (opcional)
            setMessage(result.mensaje || `Estado actualizado a ${nuevoEstado} exitosamente`);
            handleClickOpen();

            console.log(`Estado del pedido ${idPedido} actualizado a ${nuevoEstado}`);

        } catch (error) {
            console.error('Error:', error);
            throw error; // Re-lanzar para que el componente maneje el loading
        }
    };

    /**
         * Genera un PDF a partir de una imagen de la tabla.
         */
    const printToPDFImage = () => {
        const input = document.getElementById("pedido-detalles-dialog");
        const scale = isMobile ? 1 : isTablet ? 1.5 : 2;

        html2canvas(input, { scale }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const doc = new jsPDF(isMobile ? "p" : "l", "mm", "a4");
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Si la imagen es muy alta, ajustarla
            const maxImgHeight = pageHeight - 30;
            const finalImgHeight = Math.min(imgHeight, maxImgHeight);
            const finalImgWidth = (canvas.width * finalImgHeight) / canvas.height;

            doc.addImage(imgData, "PNG", 10, 15, finalImgWidth, finalImgHeight);
            doc.save("detalles_pedido_imagen.pdf");
        });
    };

    const pedidosFiltrados = pedidos.filter(pedido => {
        if (filtroEstado === 'todos') return true;
        return pedido.estado === filtroEstado;
    });

    const contarPedidosPorEstado = () => {
        const conteos = {
            todos: pedidos.length,
            pendiente: pedidos.filter(p => p.estado === 'pendiente').length,
            procesando: pedidos.filter(p => p.estado === 'procesando').length,
            finalizado: pedidos.filter(p => p.estado === 'finalizado').length
        };
        return conteos;
    };

    const handleFiltroChange = (event, nuevoFiltro) => {
        if (nuevoFiltro !== null) {
            setFiltroEstado(nuevoFiltro);
        }
    };

    // Componente Card para pedidos en vista móvil
    const PedidoCard = ({ pedido }) => {
        return (
            <Card sx={{ mb: 2, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#da6429', fontSize: '0.8rem' }}>
                                #{pedido.id_pedido}
                            </Avatar>
                            <Box>
                                <Typography variant="body1" fontWeight="bold">
                                    Pedido #{pedido.id_pedido}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {formatearFecha(pedido.f_pedido)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {pedido.usuario ? pedido.usuario.nombre : `Usuario #${pedido.id_usuario}`}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                            <EstadoChipEditable
                                pedido={pedido}
                                onEstadoChange={handleEstadoChange}
                            />
                            <IconButton
                                color="error"
                                onClick={() => handleEliminarPedido(pedido)}
                                size="small"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="h6" color="#da6429" fontWeight="bold">
                            {formatearPrecio(pedido.precio_total)}
                        </Typography>
                        <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleVerDetalles(pedido)}
                            sx={{
                                color: '#259bd6',
                                '&:hover': {
                                    backgroundColor: 'rgba(37, 155, 214, 0.1)'
                                }
                            }}
                        >
                            Ver Detalles
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    const conteos = contarPedidosPorEstado();

    if (!isEmpresa()) {
        return (
            <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
                <Typography
                    variant="h6"
                    sx={{
                        textAlign: 'center',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}
                >
                    Esta funcionalidad solo está disponible para empresas
                </Typography>
            </Container>
        );
    }

    return (
        <Container
            maxWidth="lg"
            sx={{
                py: { xs: 2, sm: 3, md: 4 },
                px: { xs: 1, sm: 2, md: 3 }
            }}
        >
            <Grid container justifyContent="center">
                <Grid item xs={12} md={10}>
                    <Card elevation={3} sx={{ borderRadius: { xs: 2, sm: 3 } }}>
                        <CardHeader
                            title={
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    flexDirection={{ xs: 'column', sm: 'row' }}
                                    gap={{ xs: 1, sm: 2 }}
                                >
                                    <BusinessIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                                    <Typography
                                        variant="h4"
                                        align="center"
                                        sx={{
                                            color: "#332f2d",
                                            fontFamily: '"Georgia", "Times New Roman", serif',
                                            fontWeight: 'bold',
                                            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
                                        }}
                                    >
                                        Perfil de Empresa
                                    </Typography>
                                </Box>
                            }
                            sx={{
                                backgroundColor: "#e2d0c6",
                                color: "#332f2d",
                                textAlign: "center",
                                py: { xs: 2, sm: 3 }
                            }}
                        />

                        {/* Pestañas */}
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                centered={!isMobile}
                                variant={isMobile ? "fullWidth" : "standard"}
                                sx={{
                                    '& .MuiTab-root': {
                                        fontSize: { xs: '0.8rem', sm: '1.1rem' },
                                        fontWeight: 500,
                                        py: { xs: 1.5, sm: 2 },
                                        minHeight: { xs: 64, sm: 72 }
                                    },
                                    '& .Mui-selected': {
                                        color: '#da6429 !important',
                                    },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: '#da6429',
                                    }
                                }}
                            >
                                <Tab
                                    icon={<BusinessIcon fontSize={isMobile ? "small" : "medium"} />}
                                    label="Datos de Empresa"
                                    iconPosition={isMobile ? "top" : "start"}
                                    sx={{ textTransform: 'none' }}
                                />
                                <Tab
                                    icon={<ShoppingCartIcon fontSize={isMobile ? "small" : "medium"} />}
                                    label="Todos los Pedidos"
                                    iconPosition={isMobile ? "top" : "start"}
                                    sx={{ textTransform: 'none' }}
                                />
                            </Tabs>
                        </Box>

                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            {/* Pestaña de Datos de Empresa */}
                            {activeTab === 0 && (
                                <Box>
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                                        flexDirection={{ xs: 'column', sm: 'row' }}
                                        gap={{ xs: 2, sm: 0 }}
                                        mb={3}
                                    >
                                        <Typography
                                            variant="h5"
                                            component="h2"
                                            sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}
                                        >
                                            Información de la Empresa
                                        </Typography>
                                        {!editMode ? (
                                            <Button
                                                variant="contained"
                                                startIcon={<EditIcon />}
                                                fullWidth={isMobile}
                                                onClick={() => setEditMode(true)}
                                                sx={{
                                                    backgroundColor: "#da6429",
                                                    height: { xs: '44px', sm: '48px' },
                                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                                    '&:hover': {
                                                        backgroundColor: "#c55722"
                                                    }
                                                }}
                                            >
                                                Editar
                                            </Button>
                                        ) : (
                                            <Stack
                                                direction={{ xs: 'column', sm: 'row' }}
                                                spacing={1}
                                                sx={{ width: { xs: '100%', sm: 'auto' } }}
                                            >
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<SaveIcon />}
                                                    fullWidth={isMobile}
                                                    onClick={guardarCambios}
                                                    sx={{
                                                        height: { xs: '44px', sm: '48px' },
                                                        fontSize: { xs: '0.9rem', sm: '1rem' }
                                                    }}
                                                >
                                                    Guardar
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<CloseIcon />}
                                                    fullWidth={isMobile}
                                                    onClick={cancelarEdicion}
                                                    sx={{
                                                        height: { xs: '44px', sm: '48px' },
                                                        fontSize: { xs: '0.9rem', sm: '1rem' }
                                                    }}
                                                >
                                                    Cancelar
                                                </Button>
                                            </Stack>
                                        )}
                                    </Box>

                                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Nombre de la Empresa"
                                                name="nombre_empresa"
                                                value={empresaData.nombre_empresa}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                variant="outlined"
                                                size={isMobile ? "medium" : "medium"}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="CIF/NIF/NIE"
                                                name="cif_nif_nie"
                                                value={empresaData.cif_nif_nie}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                variant="outlined"
                                                size={isMobile ? "medium" : "medium"}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Dirección"
                                                name="direccion"
                                                value={empresaData.direccion}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                variant="outlined"
                                                size={isMobile ? "medium" : "medium"}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Nombre del Contacto"
                                                name="nombre_personal"
                                                value={empresaData.nombre_personal}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                variant="outlined"
                                                size={isMobile ? "medium" : "medium"}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Apellidos del Contacto"
                                                name="apellidos"
                                                value={empresaData.apellidos}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                variant="outlined"
                                                size={isMobile ? "medium" : "medium"}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                type="email"
                                                name="email"
                                                value={empresaData.email}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                variant="outlined"
                                                size={isMobile ? "medium" : "medium"}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        name="ofertas"
                                                        checked={empresaData.ofertas}
                                                        onChange={handleInputChange}
                                                        disabled={!editMode}
                                                        sx={{
                                                            color: '#da6429',
                                                            '&.Mui-checked': {
                                                                color: '#da6429',
                                                            },
                                                        }}
                                                    />
                                                }
                                                label="Recibir ofertas por email"
                                                sx={{
                                                    alignItems: 'flex-start',
                                                    '& .MuiFormControlLabel-label': {
                                                        fontSize: { xs: '0.9rem', sm: '1rem' }
                                                    }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {/* Pestaña de Todos los Pedidos */}
                            {activeTab === 1 && (
                                <Box>
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                                        flexDirection={{ xs: 'column', sm: 'row' }}
                                        gap={{ xs: 2, sm: 0 }}
                                        mb={3}
                                    >
                                        <Typography
                                            variant="h5"
                                            component="h2"
                                            sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}
                                        >
                                            {user?.type === 'empresa' ?
                                                'Pedidos con Muebles de su Empresa' :
                                                'Todos los Pedidos del Sistema'
                                            }
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<RefreshIcon />}
                                            onClick={cargarHistorialPedidos}
                                            fullWidth={isMobile}
                                            sx={{
                                                backgroundColor: "#da6429",
                                                height: { xs: '44px', sm: '48px' },
                                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                                '&:hover': {
                                                    backgroundColor: "#c55722"
                                                }
                                            }}
                                        >
                                            Actualizar
                                        </Button>
                                    </Box>

                                    {pedidos.length > 0 && (
                                        <Box mb={3}>
                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: { xs: 'column', sm: 'row' },
                                                gap: 1,
                                                alignItems: { xs: 'stretch', sm: 'center' }
                                            }}>
                                                <ToggleButtonGroup
                                                    value={filtroEstado}
                                                    exclusive
                                                    onChange={handleFiltroChange}
                                                    aria-label="filtro por estado"
                                                    size={isMobile ? "small" : "medium"}
                                                    sx={{
                                                        flexWrap: 'wrap',
                                                        '& .MuiToggleButton-root': {
                                                            borderColor: '#da6429',
                                                            color: '#da6429',
                                                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                                            px: { xs: 1, sm: 2 },
                                                            '&.Mui-selected': {
                                                                backgroundColor: '#da6429',
                                                                color: 'white',
                                                                '&:hover': {
                                                                    backgroundColor: '#c55722',
                                                                }
                                                            },
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(218, 100, 41, 0.1)',
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <ToggleButton value="todos" aria-label="todos los pedidos">
                                                        <Badge
                                                            badgeContent={conteos.todos}
                                                            sx={{
                                                                mr: { xs: 0.5, sm: 1 },
                                                                '& .MuiBadge-badge': {
                                                                    backgroundColor: '#259bd6',
                                                                    color: 'white',
                                                                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                                                }
                                                            }}
                                                        >
                                                            <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                                                                Todos
                                                            </Typography>
                                                        </Badge>
                                                    </ToggleButton>

                                                    <ToggleButton value="pendiente" aria-label="pedidos pendientes">
                                                        <Badge
                                                            badgeContent={conteos.pendiente}
                                                            color="error"
                                                            sx={{
                                                                mr: { xs: 0.5, sm: 1 },
                                                                '& .MuiBadge-badge': {
                                                                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                                                }
                                                            }}
                                                        >
                                                            <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                                                                Pendientes
                                                            </Typography>
                                                        </Badge>
                                                    </ToggleButton>

                                                    <ToggleButton value="procesando" aria-label="pedidos procesando">
                                                        <Badge
                                                            badgeContent={conteos.procesando}
                                                            color="warning"
                                                            sx={{
                                                                mr: { xs: 0.5, sm: 1 },
                                                                '& .MuiBadge-badge': {
                                                                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                                                }
                                                            }}
                                                        >
                                                            <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                                                                Procesando
                                                            </Typography>
                                                        </Badge>
                                                    </ToggleButton>

                                                    <ToggleButton value="finalizado" aria-label="pedidos finalizados">
                                                        <Badge
                                                            badgeContent={conteos.finalizado}
                                                            color="success"
                                                            sx={{
                                                                mr: { xs: 0.5, sm: 1 },
                                                                '& .MuiBadge-badge': {
                                                                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                                                }
                                                            }}
                                                        >
                                                            <Typography variant="body2" fontWeight="medium" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                                                                Finalizados
                                                            </Typography>
                                                        </Badge>
                                                    </ToggleButton>
                                                </ToggleButtonGroup>
                                            </Box>

                                            {/* Mostrar estado del filtro actual */}
                                            <Box mt={2}>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                                                >
                                                    {filtroEstado === 'todos'
                                                        ? `Mostrando todos los pedidos (${pedidosFiltrados.length})`
                                                        : `Mostrando pedidos con estado "${filtroEstado}" (${pedidosFiltrados.length} de ${pedidos.length})`
                                                    }
                                                </Typography>
                                            </Box>

                                            <Divider sx={{ mt: 2 }} />
                                        </Box>
                                    )}

                                    {pedidosFiltrados.length > 0 ? (
                                        isMobile ? (
                                            // Vista de cards para móvil
                                            <Box>
                                                {pedidosFiltrados.map((pedido) => (
                                                    <PedidoCard key={pedido.id_pedido} pedido={pedido} />
                                                ))}
                                            </Box>
                                        ) : (
                                            // Vista de tabla para tablet/desktop
                                            <TableContainer component={Paper} elevation={2}>
                                                <Table size={isTablet ? "small" : "medium"}>
                                                    <TableHead>
                                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                            <TableCell align="center"><strong>Nº Pedido</strong></TableCell>
                                                            <TableCell align="center"><strong>Usuario</strong></TableCell>
                                                            <TableCell align="center"><strong>Fecha</strong></TableCell>
                                                            <TableCell align="center"><strong>Total</strong></TableCell>
                                                            <TableCell align="center"><strong>Estado</strong></TableCell>
                                                            <TableCell align="center"><strong>Acciones</strong></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {pedidosFiltrados.map((pedido) => (
                                                            <TableRow key={pedido.id_pedido} hover>
                                                                <TableCell align="center">#{pedido.id_pedido}</TableCell>
                                                                <TableCell align="center">
                                                                    {pedido.usuario ?
                                                                        `${pedido.usuario.nombre}` :
                                                                        `Usuario #${pedido.id_usuario}`
                                                                    }
                                                                </TableCell>
                                                                <TableCell align="center">{formatearFecha(pedido.f_pedido)}</TableCell>
                                                                <TableCell align="center">{formatearPrecio(pedido.precio_total)}</TableCell>
                                                                <TableCell align="center">
                                                                    <EstadoChipEditable
                                                                        pedido={pedido}
                                                                        onEstadoChange={handleEstadoChange}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <IconButton
                                                                        onClick={() => handleVerDetalles(pedido)}
                                                                        size="small"
                                                                        className="me-1"
                                                                        sx={{ color: '#259bd6' }}
                                                                    >
                                                                        <VisibilityIcon />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        color="error"
                                                                        onClick={() => handleEliminarPedido(pedido)}
                                                                        size="small"
                                                                        className="ms-1"
                                                                    >
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )
                                    ) : (
                                        <Box
                                            display="flex"
                                            flexDirection="column"
                                            alignItems="center"
                                            justifyContent="center"
                                            py={{ xs: 6, sm: 8 }}
                                        >
                                            <ShoppingCartIcon
                                                sx={{
                                                    fontSize: { xs: 60, sm: 80 },
                                                    color: 'text.secondary',
                                                    mb: 2
                                                }}
                                            />
                                            <Typography
                                                variant="h6"
                                                color="text.secondary"
                                                gutterBottom
                                                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                                            >
                                                {pedidos.length === 0 ? (
                                                    user?.type === 'empresa' ?
                                                        'No hay pedidos con muebles de su empresa' :
                                                        'No hay pedidos en el sistema'
                                                ) : (
                                                    `No hay pedidos con estado "${filtroEstado}"`
                                                )}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    fontSize: { xs: '0.85rem', sm: '0.875rem' },
                                                    textAlign: 'center',
                                                    px: 2
                                                }}
                                            >
                                                {pedidos.length === 0 ? (
                                                    user?.type === 'empresa' ?
                                                        'Los pedidos que incluyan sus muebles aparecerán aquí cuando los usuarios realicen compras.' :
                                                        'Los pedidos aparecerán aquí cuando los usuarios realicen compras.'
                                                ) : (
                                                    `Prueba con otros filtros de estado. Total de pedidos: ${pedidos.length}`
                                                )}
                                            </Typography>

                                            {/* Mostrar botón para limpiar filtro si hay pedidos pero ninguno coincide */}
                                            {pedidos.length > 0 && pedidosFiltrados.length === 0 && (
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => setFiltroEstado('todos')}
                                                    sx={{
                                                        mt: 2,
                                                        borderColor: '#da6429',
                                                        color: '#da6429',
                                                        '&:hover': {
                                                            borderColor: '#c55722',
                                                            backgroundColor: 'rgba(218, 100, 41, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    Ver todos los pedidos
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Dialog de confirmación responsive */}
            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
                fullWidth
                maxWidth="sm"
                sx={{
                    '& .MuiDialog-paper': {
                        margin: { xs: 2, sm: 4 },
                        width: { xs: 'calc(100% - 32px)', sm: 'auto' },
                        maxWidth: { xs: 'calc(100% - 32px)', sm: '600px' }
                    }
                }}
            >
                <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                    Información
                </DialogTitle>
                <DialogContent>
                    <DialogContentText
                        id="alert-dialog-slide-description"
                        sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                    >
                        {message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
                    <Button
                        onClick={handleClose}
                        sx={{
                            color: "#da6429",
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            minWidth: { xs: '80px', sm: '100px' }
                        }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog de confirmación para eliminar pedido */}
            <Dialog
                open={confirmDeleteOpen}
                keepMounted
                onClose={handleCancelDelete}
                aria-labelledby="confirm-delete-dialog-title"
                aria-describedby="confirm-delete-dialog-description"
                fullWidth
                maxWidth="sm"
                sx={{
                    '& .MuiDialog-paper': {
                        margin: { xs: 2, sm: 4 },
                        width: { xs: 'calc(100% - 32px)', sm: 'auto' },
                        maxWidth: { xs: 'calc(100% - 32px)', sm: '600px' }
                    }
                }}
            >
                <DialogTitle id="confirm-delete-dialog-title" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                    Confirmar Eliminación
                </DialogTitle>
                <DialogContent>
                    <DialogContentText
                        id="confirm-delete-dialog-description"
                        sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                    >
                        ¿Está seguro de que desea eliminar el pedido #{pedidoAEliminar?.id_pedido}?
                        <br />
                        <strong>Esta acción no se puede deshacer.</strong>
                        {pedidoAEliminar && (
                            <>
                                <br /><br />
                                <strong>Detalles del pedido:</strong>
                                <br />• Usuario: {pedidoAEliminar.usuario?.nombre || `Usuario #${pedidoAEliminar.id_usuario}`}
                                <br />• Fecha: {formatearFecha(pedidoAEliminar.f_pedido)}
                                <br />• Total: {formatearPrecio(pedidoAEliminar.precio_total)}
                            </>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
                    <Button
                        onClick={handleCancelDelete}
                        sx={{
                            color: "gray",
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            minWidth: { xs: '80px', sm: '100px' }
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        autoFocus
                        sx={{
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            minWidth: { xs: '80px', sm: '100px' }
                        }}
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de detalles del pedido responsive */}
            <Dialog
                open={modalDetallesOpen}
                onClose={handleCloseDetalles}
                maxWidth="lg"
                fullWidth
                id="pedido-detalles-dialog"
                sx={{
                    '& .MuiDialog-paper': {
                        margin: { xs: 1, sm: 2, md: 4 },
                        width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)', md: 'auto' },
                        maxWidth: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)', md: '1200px' },
                        maxHeight: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 64px)' }
                    }
                }}
            >
                <DialogTitle>
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        gap={{ xs: 1, sm: 0 }}
                    >
                        <Typography
                            variant="h6"
                            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                        >
                            Detalles del Pedido #{pedidoSeleccionado?.id_pedido}
                        </Typography>
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={handleCloseDetalles}
                            aria-label="close"
                            size={isMobile ? "small" : "medium"}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                    {pedidoSeleccionado && (
                        <Grid container spacing={{ xs: 2, sm: 3 }}>
                            {/* Información general del pedido */}
                            <Grid item xs={12} md={4}>
                                <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        color="#da6429"
                                        sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                                    >
                                        Información del Pedido
                                    </Typography>
                                    <Box sx={{ mb: 1 }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                                        >
                                            Número de pedido
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            fontWeight="medium"
                                            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                                        >
                                            #{pedidoSeleccionado.id_pedido}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 1 }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                                        >
                                            Fecha
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                                        >
                                            {formatearFecha(pedidoSeleccionado.f_pedido)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mb: 1 }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                                        >
                                            Usuario
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                                        >
                                            {pedidoSeleccionado.usuario ?
                                                `${pedidoSeleccionado.usuario.nombre} (${pedidoSeleccionado.usuario.email})` :
                                                `Usuario #${pedidoSeleccionado.id_usuario}`
                                            }
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                                        >
                                            Total
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            color="#da6429"
                                            fontWeight="bold"
                                            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                                        >
                                            {formatearPrecio(pedidoSeleccionado.precio_total)}
                                        </Typography>
                                    </Box>
                                </Card>
                            </Grid>

                            {/* Lista de productos */}
                            <Grid item xs={12} md={8}>
                                <Card variant="outlined">
                                    <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: 1, borderColor: 'divider' }}>
                                        <Typography
                                            variant="h6"
                                            color="#da6429"
                                            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                                        >
                                            Productos del Pedido
                                        </Typography>
                                    </Box>
                                    {pedidoSeleccionado.pedido_productos?.length > 0 ? (
                                        isMobile ? (
                                            // Vista de lista para móvil
                                            <List sx={{ py: 0 }}>
                                                {pedidoSeleccionado.pedido_productos.map((producto, index) => (
                                                    <ListItem key={index} divider sx={{ py: 1 }}>
                                                        <ListItemIcon>
                                                            <ReceiptIcon sx={{ color: '#da6429', fontSize: '1.2rem' }} />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                    <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.85rem' }}>
                                                                        {producto.nombre_producto || `Producto #${producto.id_producto}`}
                                                                    </Typography>
                                                                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>
                                                                        {producto.precio_unitario ?
                                                                            formatearPrecio(producto.precio_unitario * producto.cantidad) :
                                                                            'N/A'
                                                                        }
                                                                    </Typography>
                                                                </Box>
                                                            }
                                                            secondary={
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                                        <Chip
                                                                            label={producto.tipo_producto}
                                                                            size="small"
                                                                            color={producto.tipo_producto === 'mueble' ? 'primary' : 'secondary'}
                                                                            variant="outlined"
                                                                            sx={{ fontSize: '0.7rem', height: '20px' }}
                                                                        />
                                                                        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                                                            Cant: {producto.cantidad}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                                                        {producto.precio_unitario ? formatearPrecio(producto.precio_unitario) + '/ud' : 'N/A'}
                                                                    </Typography>
                                                                </Box>
                                                            }
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        ) : (
                                            // Vista de tabla para tablet/desktop
                                            <TableContainer>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                            <TableCell><strong>Producto</strong></TableCell>
                                                            <TableCell><strong>Tipo</strong></TableCell>
                                                            <TableCell align="center"><strong>Cantidad</strong></TableCell>
                                                            <TableCell align="right"><strong>Precio Unit.</strong></TableCell>
                                                            <TableCell align="right"><strong>Total</strong></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {pedidoSeleccionado.pedido_productos.map((producto, index) => (
                                                            <TableRow key={index} hover>
                                                                <TableCell>
                                                                    <Typography variant="body2" fontWeight="medium">
                                                                        {producto.nombre_producto || `Producto #${producto.id_producto}`}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={producto.tipo_producto}
                                                                        size="small"
                                                                        color={producto.tipo_producto === 'mueble' ? 'primary' : 'secondary'}
                                                                        variant="outlined"
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Typography variant="body2" fontWeight="medium">
                                                                        {producto.cantidad}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Typography variant="body2">
                                                                        {producto.precio_unitario ? formatearPrecio(producto.precio_unitario) : 'N/A'}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    <Typography variant="body2" fontWeight="medium">
                                                                        {producto.precio_unitario ?
                                                                            formatearPrecio(producto.precio_unitario * producto.cantidad) :
                                                                            'N/A'
                                                                        }
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )
                                    ) : (
                                        <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                                            >
                                                No hay información de productos disponible
                                            </Typography>
                                        </Box>
                                    )}
                                </Card>
                            </Grid>

                            {/* Datos de envío si están disponibles */}
                            {pedidoSeleccionado.datos_envio && (
                                <Grid item xs={12}>
                                    <Card variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
                                        <Typography
                                            variant="h6"
                                            gutterBottom
                                            color="#da6429"
                                            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                                        >
                                            Datos de Envío
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                whiteSpace: 'pre-wrap',
                                                fontSize: { xs: '0.85rem', sm: '0.875rem' }
                                            }}
                                        >
                                            {typeof pedidoSeleccionado.datos_envio === 'string'
                                                ? pedidoSeleccionado.datos_envio
                                                : JSON.stringify(pedidoSeleccionado.datos_envio, null, 2)
                                            }
                                        </Typography>
                                    </Card>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions
                    sx={{
                        justifyContent: 'flex-end',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1, sm: 0 },
                        px: { xs: 2, sm: 3 },
                        py: { xs: 2, sm: 2 }
                    }}
                >
                    {!isMobile && !isTablet && (
                        <Button
                            sx={{
                                color: "#da6429",
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                order: { xs: 2, sm: 1 }
                            }}
                            onClick={printToPDFImage}
                            fullWidth={isMobile}
                        >
                            Imprimir a PDF (Imagen)
                        </Button>
                    )}
                    <Button
                        onClick={handleCloseDetalles}
                        sx={{
                            color: "#da6429",
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                        }}
                        fullWidth={isMobile}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default PerfilEmpresa;