import { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Card,
    CardContent,
    CardHeader,
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Grid,
    ToggleButton,
    ToggleButtonGroup,
    Badge,
    Divider,
    CircularProgress,
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
    Person as PersonIcon,
    ShoppingCart as ShoppingCartIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    Refresh as RefreshIcon,
    Visibility as VisibilityIcon,
    AccountCircle as AccountCircleIcon,
    CheckCircle as CheckCircleIcon,
    Receipt as ReceiptIcon,
    LocalShipping as LocalShippingIcon,
    Schedule as ScheduleIcon,
    Done as DoneIcon
} from '@mui/icons-material';
import useUserStore from "../../stores/useUserStore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { apiUrl } from "../../config";
import "../../style/Perfiles.css";

/**
 * Componente del perfil de usuario con pestañas para datos personales e historial de pedidos.
 * @returns {JSX.Element} El componente del perfil de usuario.
 */
function PerfilUsuario() {
    const [activeTab, setActiveTab] = useState(0);
    const [userData, setUserData] = useState({
        nombre: '',
        apellidos: '',
        email: '',
        direccion: '',
        f_nacimiento: '',
        sexo: '',
        ofertas: false
    });
    const [pedidos, setPedidos] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [modalDetallesOpen, setModalDetallesOpen] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [confirmandoEntrega, setConfirmandoEntrega] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);
    const isEmpresa = useUserStore((state) => state.isEmpresa);
    const isLoggedIn = useUserStore((state) => state.isLoggedIn);

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

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Cargar datos del usuario al montar el componente
    useEffect(() => {
        if (user) {
            setUserData({
                nombre: user.nombre || '',
                apellidos: user.apellidos || '',
                email: user.email || '',
                direccion: user.direccion || '',
                f_nacimiento: user.f_nacimiento || '',
                sexo: user.sexo || '',
                ofertas: user.ofertas || false
            });
        }
    }, [user]);

    /**
     * Carga el historial de pedidos del usuario
     */
    const cargarHistorialPedidos = useCallback(async () => {
        if (!user?.id_usuario) {
            console.log('No hay usuario logueado:', user);
            return;
        }

        console.log('Cargando historial de pedidos para usuario:', user.id_usuario);

        try {
            const url = `${apiUrl}/pedidos/usuario/${user.id_usuario}?limite=50&pagina=1&orden=DESC`;
            console.log('URL de la petición:', url);

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (response.ok) {
                const data = await response.json();

                // Manejo de diferentes estructuras de respuesta
                if (data.success && data.data && data.data.pedidos) {
                    setPedidos(data.data.pedidos);
                } else if (data.ok && data.datos) {
                    const pedidosArray = Array.isArray(data.datos) ? data.datos : data.datos.pedidos || [];
                    setPedidos(pedidosArray);
                } else if (Array.isArray(data)) {
                    setPedidos(data);
                } else {
                    setPedidos([]);
                }
            } else {
                console.error('Error en la respuesta HTTP:', response.status);
                const errorText = await response.text();
                console.error('Texto del error:', errorText);
                setMessage('Error al cargar el historial de pedidos');
                handleClickOpen();
            }
        } catch (error) {
            console.error('Error en la petición:', error);
            setMessage('Error de conexión al cargar pedidos');
            handleClickOpen();
        }
    }, [user, handleClickOpen]);

    // Cargar historial de pedidos cuando se selecciona la pestaña
    useEffect(() => {
        if (activeTab === 1) {
            cargarHistorialPedidos();
        }
    }, [activeTab, cargarHistorialPedidos]);

    /**
     * Maneja los cambios en los campos del formulario
     */
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    /**
     * Guarda los cambios en los datos del usuario
     */
    const guardarCambios = async () => {
        if (!user?.id_usuario) return;

        try {
            const response = await fetch(`${apiUrl}/usuario/actualizar`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.ok && result.datos) {
                    setUser(result.datos);
                    setEditMode(false);
                    setMessage(result.mensaje || 'Datos actualizados correctamente');
                } else {
                    setMessage(result.mensaje || 'Error al actualizar los datos');
                }
            } else {
                const errorData = await response.json();
                console.log('Error response:', errorData);
                setMessage(errorData.mensaje || 'Error al actualizar los datos');
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
            setUserData({
                nombre: user.nombre || '',
                apellidos: user.apellidos || '',
                email: user.email || '',
                direccion: user.direccion || '',
                f_nacimiento: user.f_nacimiento || '',
                sexo: user.sexo || '',
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

    /**
     * Confirma la entrega del pedido (cambia cualquier estado a finalizado)
     */
    const confirmarEntrega = async (pedido) => {
        // Solo permitir si el pedido NO está ya finalizado
        if (pedido.estado === 'finalizado') {
            setMessage('Este pedido ya está finalizado');
            handleClickOpen();
            return;
        }

        setConfirmandoEntrega(true);

        try {
            const token = useUserStore.getState().getToken();

            if (!token) {
                setMessage('Error: No hay token de autenticación. Por favor, inicia sesión nuevamente.');
                handleClickOpen();
                return;
            }

            const response = await fetch(`${apiUrl}/pedidos/${pedido.id_pedido}/estado`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estado: 'finalizado' })
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401) {
                    setMessage('Sesión expirada. Por favor, inicia sesión nuevamente.');
                } else {
                    setMessage(errorData.mensaje || 'Error al confirmar la entrega');
                }
                handleClickOpen();
                return;
            }

            // Actualizar el estado local del pedido
            setPedidos(prevPedidos =>
                prevPedidos.map(p =>
                    p.id_pedido === pedido.id_pedido
                        ? { ...p, estado: 'finalizado' }
                        : p
                )
            );

            // Actualizar el pedido seleccionado en el modal
            setPedidoSeleccionado(prev =>
                prev ? { ...prev, estado: 'finalizado' } : prev
            );

            setMessage('¡Entrega confirmada exitosamente! Gracias por tu compra.');
            handleClickOpen();

            console.log(`Entrega confirmada para pedido ${pedido.id_pedido}`);

        } catch (error) {
            console.error('Error confirmando entrega:', error);
            setMessage('Error de conexión al confirmar la entrega');
            handleClickOpen();
        } finally {
            setConfirmandoEntrega(false);
        }
    };

    // Componente Card para pedidos en vista móvil
    const PedidoCard = ({ pedido }) => {
        const getEstadoIcon = (estado) => {
            switch (estado) {
                case 'finalizado':
                    return <DoneIcon sx={{ color: 'success.main' }} />;
                case 'procesando':
                    return <LocalShippingIcon sx={{ color: 'warning.main' }} />;
                default:
                    return <ScheduleIcon sx={{ color: 'error.main' }} />;
            }
        };

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
                            </Box>
                        </Box>
                        <Chip
                            icon={getEstadoIcon(pedido.estado)}
                            label={pedido.estado}
                            size="small"
                            color={
                                pedido.estado === 'finalizado' ? 'success' :
                                    pedido.estado === 'procesando' ? 'warning' : 'error'
                            }
                            variant="outlined"
                        />
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

    if (isEmpresa() || !isLoggedIn()) {
        return (
            <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
                <Typography
                    variant="h6"
                    sx={{
                        textAlign: 'center',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}
                >
                    Esta funcionalidad solo está disponible para usuarios
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
                                    <AccountCircleIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
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
                                        Mi Perfil
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
                                        fontSize: { xs: '0.9rem', sm: '1.1rem' },
                                        fontWeight: 500,
                                        py: { xs: 1.5, sm: 2 }
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
                                    icon={<PersonIcon fontSize={isMobile ? "small" : "medium"} />}
                                    label="Datos Personales"
                                    iconPosition={isMobile ? "top" : "start"}
                                />
                                <Tab
                                    icon={<ShoppingCartIcon fontSize={isMobile ? "small" : "medium"} />}
                                    label="Historial de Pedidos"
                                    iconPosition={isMobile ? "top" : "start"}
                                />
                            </Tabs>
                        </Box>

                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            {/* Pestaña de Datos Personales */}
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
                                            Información Personal
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
                                                label="Nombre"
                                                name="nombre"
                                                value={userData.nombre}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                variant="outlined"
                                                size={isMobile ? "medium" : "medium"}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Apellidos"
                                                name="apellidos"
                                                value={userData.apellidos}
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
                                                value={userData.email}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                variant="outlined"
                                                size={isMobile ? "medium" : "medium"}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Fecha de Nacimiento"
                                                type="date"
                                                name="f_nacimiento"
                                                value={userData.f_nacimiento}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                variant="outlined"
                                                size={isMobile ? "medium" : "medium"}
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <FormControl
                                                fullWidth
                                                variant="outlined"
                                                disabled={!editMode}
                                                size={isMobile ? "medium" : "medium"}
                                            >
                                                <InputLabel>Sexo</InputLabel>
                                                <Select
                                                    name="sexo"
                                                    value={userData.sexo}
                                                    onChange={handleInputChange}
                                                    label="Sexo"
                                                >
                                                    <MenuItem value="">
                                                        <em>Seleccionar sexo</em>
                                                    </MenuItem>
                                                    <MenuItem value="hombre">Hombre</MenuItem>
                                                    <MenuItem value="mujer">Mujer</MenuItem>
                                                    <MenuItem value="otro">Otro</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        name="ofertas"
                                                        checked={userData.ofertas}
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
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Dirección"
                                                name="direccion"
                                                value={userData.direccion}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                variant="outlined"
                                                size={isMobile ? "medium" : "medium"}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {/* Pestaña de Historial de Pedidos */}
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
                                            Historial de Pedidos
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<RefreshIcon />}
                                            fullWidth={isMobile}
                                            onClick={cargarHistorialPedidos}
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
                                                                <TableCell align="center">{formatearFecha(pedido.f_pedido)}</TableCell>
                                                                <TableCell align="center">{formatearPrecio(pedido.precio_total)}</TableCell>
                                                                <TableCell align="center">
                                                                    <Chip
                                                                        label={pedido.estado}
                                                                        size="small"
                                                                        color={
                                                                            pedido.estado === 'finalizado' ? 'success' :
                                                                                pedido.estado === 'procesando' ? 'warning' :
                                                                                    'error'
                                                                        }
                                                                        variant="outlined"
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <IconButton
                                                                        onClick={() => handleVerDetalles(pedido)}
                                                                        size="small"
                                                                        sx={{ color: '#259bd6' }}
                                                                    >
                                                                        <VisibilityIcon />
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
                                                No tienes pedidos realizados
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
                                                Cuando realices tu primera compra, aparecerá aquí.
                                            </Typography>
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

                                    {/* Boton confirmar entrega */}
                                    {pedidoSeleccionado.estado !== 'finalizado' && (
                                        <Box sx={{ mt: 3 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                color="success"
                                                startIcon={confirmandoEntrega ?
                                                    <CircularProgress size={20} color="inherit" /> :
                                                    <CheckCircleIcon />
                                                }
                                                onClick={() => confirmarEntrega(pedidoSeleccionado)}
                                                disabled={confirmandoEntrega}
                                                sx={{
                                                    py: { xs: 1.2, sm: 1.5 },
                                                    fontWeight: 'bold',
                                                    fontSize: { xs: '0.8rem', sm: '0.9rem' }
                                                }}
                                            >
                                                {confirmandoEntrega ? 'Confirmando...' : 'He Recibido el Pedido'}
                                            </Button>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    mt: 1,
                                                    display: 'block',
                                                    textAlign: 'center',
                                                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                                }}
                                            >
                                                Confirma cuando hayas recibido tu pedido
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Mensaje si ya está finalizado */}
                                    {pedidoSeleccionado.estado === 'finalizado' && (
                                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                                            <CheckCircleIcon sx={{ color: 'success.main', fontSize: { xs: 32, sm: 40 }, mb: 1 }} />
                                            <Typography
                                                variant="body2"
                                                color="success.main"
                                                fontWeight="medium"
                                                sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                                            >
                                                ¡Pedido completado!
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                            >
                                                Este pedido ya ha sido finalizado
                                            </Typography>
                                        </Box>
                                    )}
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
                                                                        {producto.nombre_producto}
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
                                                                    <Typography variant="body2">
                                                                        {producto.nombre_producto}
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
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions
                    sx={{
                        justifyContent: 'space-between',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1, sm: 0 },
                        px: { xs: 2, sm: 3 },
                        py: { xs: 2, sm: 2 }
                    }}
                >
                    {!isMobile && !isTablet && (
                        <Button Button
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
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            order: { xs: 1, sm: 2 }
                        }}
                        fullWidth={isMobile}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container >
    );
}

export default PerfilUsuario;