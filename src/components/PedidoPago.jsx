import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
    Typography,
    Box,
    Paper,
    Button,
    Divider,
    Card,
    CardContent,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Snackbar,
    Alert,
    TextField,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DeleteIcon from "@mui/icons-material/Delete";
import useCarritoStore from "../stores/useCarritoStore";
import useUserStore from "../stores/useUserStore";
import { apiUrl } from "../config";
import Grid from "@mui/material/Grid2";

/**
 * Componente para mostrar el resumen del pedido y procesar el pago
 * @component
 */
function PedidoPago() {
    const navigate = useNavigate();

    const {
        items,
        total,
        getCantidadTotal,
        eliminarItem,
        actualizarCantidad,
        limpiarCarrito
    } = useCarritoStore();

    // Obtener información del usuario y token desde el store
    const user = useUserStore((state) => state.user);
    const token = useUserStore((state) => state.token);
    const isLoggedIn = useUserStore((state) => state.isLoggedIn);
    const getAuthHeaders = useUserStore((state) => state.getAuthHeaders);

    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [isProcessing, setIsProcessing] = useState(false);

    // Estados para la información del pedido
    const [datosEnvio, setDatosEnvio] = useState({
        nombre: '',
        apellidos: '',
        direccion: '',
        direccion_adicional: '',
        ciudad: '',
        codigoPostal: '',
        telefono: '',
        email: '',
        bizum: ''
    });

    const [metodoPago, setMetodoPago] = useState('tarjeta');
    const [datosPago, setDatosPago] = useState({
        numeroTarjeta: '',
        fechaExpiracion: '',
        cvv: '',
        nombreTitular: ''
    });

    const isEmpresa = useUserStore((state) => state.isEmpresa);

    // Redireccionar si el carrito está vacío o no está logueado
    useEffect(() => {
        if (items.length === 0 && !openDialog) {
            navigate('/');
            return;
        }

        if (!isLoggedIn()) {
            console.log('Usuario no autenticado, redirigiendo al login');
            navigate('/login');
            return;
        }

        // Debug: verificar autenticación
        console.log('Estado de autenticación:', {
            isLoggedIn: isLoggedIn(),
            hasUser: !!user,
            hasToken: !!token,
            userId: user?.id_usuario || user?.id_empresa
        });

    }, [items, navigate, isLoggedIn, user, token, openDialog]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleInputChange = (campo, valor) => {
        setDatosEnvio(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const handlePagoChange = (campo, valor) => {
        setDatosPago(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const handleActualizarCantidad = (id_producto, tipo_producto, nuevaCantidad) => {
        try {
            actualizarCantidad(id_producto, tipo_producto, nuevaCantidad);
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const validarFormulario = () => {
        // Validar datos de envío
        const camposRequeridos = ['nombre', 'apellidos', 'direccion', 'ciudad', 'codigoPostal', 'telefono', 'email'];
        for (const campo of camposRequeridos) {
            if (!datosEnvio[campo].trim()) {
                showSnackbar(`El campo ${campo} es obligatorio`, 'error');
                return false;
            }
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(datosEnvio.email)) {
            showSnackbar('Por favor, introduce un email válido', 'error');
            return false;
        }

        // Validar datos de pago si es tarjeta
        if (metodoPago === 'tarjeta') {
            if (!datosPago.numeroTarjeta || !datosPago.fechaExpiracion || !datosPago.cvv || !datosPago.nombreTitular) {
                showSnackbar('Todos los campos de la tarjeta son obligatorios', 'error');
                return false;
            }
        }

        // Validar numero de telefono si es bizum
        if (metodoPago === 'bizum') {
            const telefonoRegex = /^\d{9}$/; // 9 dígitos
            if (!datosEnvio.bizum || !telefonoRegex.test(datosEnvio.bizum)) {
                showSnackbar('Por favor, introduce un número de teléfono válido para Bizum', 'error');
                return false;
            }
        }

        return true;
    };

    const handleRealizarPedido = async () => {
        if (!validarFormulario()) {
            return;
        }

        setIsProcessing(true);

        try {
            const productosParaBackend = items.map(item => ({
                id_producto: item.id_producto,
                tipo_producto: item.tipo_producto,
                cantidad: item.cantidad
            }));

            // Calcular total con envío y método de pago
            let totalFinal = totalConEnvio;
            if (metodoPago === 'contrareembolso') {
                totalFinal += 3; // Añadir gastos de contrareembolso
            }

            // Obtener ID del usuario (ajustar según tu estructura)
            const userId = user.id_usuario || user.id_empresa;

            if (!userId) {
                throw new Error('No se pudo identificar al usuario');
            }

            // Preparar datos del pedido
            const pedidoData = {
                id_usuario: userId,
                productos: productosParaBackend,
                datos_envio: datosEnvio,
                metodo_pago: metodoPago,
                datos_pago: metodoPago === 'tarjeta' ? datosPago : null,
                precio_total: totalFinal,
                fecha: new Date().toISOString()
            };

            console.log('Enviando pedido:', {
                userId,
                productos: productosParaBackend.length,
                total: totalFinal,
                hasToken: !!token
            });

            // Headers con autenticación
            const headers = getAuthHeaders ? getAuthHeaders() : {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            console.log('Headers de la petición:', headers);

            const response = await fetch(apiUrl + "/pedidos", {
                method: "POST",
                headers: headers,
                credentials: 'include', // Asegurar que las cookies se envían
                body: JSON.stringify(pedidoData)
            });

            console.log('Respuesta del servidor:', {
                status: response.status,
                ok: response.ok
            });

            const responseData = await response.json();

            if (response.ok) {
                // Pedido creado exitosamente
                const numeroPedido = responseData.datos?.id_pedido || Math.floor(Math.random() * 1000000);

                setDialogMessage(
                    `¡Pedido realizado con éxito!\n\n` +
                    `Número de pedido: ${numeroPedido}\n` +
                    `Total: ${totalFinal.toFixed(2)}€\n` +
                    `Artículos: ${getCantidadTotal()}\n` +
                    `Método de pago: ${metodoPago}\n\n` +
                    `Recibirás un email de confirmación en: ${datosEnvio.email}\n\n` +
                    `¡Gracias por tu compra!`
                );
                setOpenDialog(true);
                setTimeout(() => {
                    limpiarCarrito();
                }, 100);
            } else {
                // Error en la respuesta del servidor
                const errorMessage = responseData.mensaje || 'Error al procesar el pedido';
                showSnackbar(errorMessage, 'error');
                console.error("Error del servidor:", responseData);
            }

        } catch (error) {
            console.error("Error al procesar el pedido:", error);

            // Manejar diferentes tipos de errores
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                showSnackbar('Error de conexión. Verifica tu conexión a internet.', 'error');
            } else if (error.message.includes('Stock insuficiente')) {
                showSnackbar('Algunos productos no tienen stock suficiente. Por favor, revisa tu carrito.', 'error');
            } else {
                showSnackbar('Error al procesar el pedido. Por favor, inténtalo de nuevo.', 'error');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        navigate('/');
    };

    const calcularEnvio = () => {
        // Envío gratuito para pedidos superiores a 50€
        return total >= 50 ? 0 : 5.99;
    };

    const totalConEnvio = total + calcularEnvio();

    if ((items.length === 0 && !openDialog) || !isLoggedIn()) {
        return null; // El useEffect ya redirigirá
    }

    if (isEmpresa()) {
        return <Typography variant="h6">Esta funcionalidad solo está disponible para usuarios</Typography>;
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography
                    variant="h4"
                    align="center"
                    sx={{
                        m: 4,
                        color: "#332f2d",
                        fontFamily: '"Georgia", "Times New Roman", serif',
                        fontWeight: 'bold'
                    }}
                >
                    Finalizar Pedido
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Columna izquierda - Resumen del pedido */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <ShoppingCartIcon sx={{ mr: 1, color: '#da6429' }} />
                            <Typography variant="h5" fontWeight="bold">
                                Resumen del Pedido
                            </Typography>
                        </Box>

                        {items.map((item) => (
                            <Card key={`${item.id_producto}-${item.tipo_producto}`} variant="outlined" sx={{ mb: 2 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" gutterBottom>
                                                {item.nombre}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Precio unitario: {item.precio}€
                                            </Typography>
                                            {item.descripcion && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    {item.descripcion.substring(0, 100)}...
                                                </Typography>
                                            )}
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <IconButton
                                                    onClick={() => handleActualizarCantidad(
                                                        item.id_producto,
                                                        item.tipo_producto,
                                                        item.cantidad - 1
                                                    )}
                                                    size="small"
                                                    sx={{ bgcolor: '#f5f5f5' }}
                                                >
                                                    -
                                                </IconButton>
                                                <Typography variant="body1" sx={{ minWidth: 30, textAlign: 'center', fontWeight: 'bold' }}>
                                                    {item.cantidad}
                                                </Typography>
                                                <IconButton
                                                    onClick={() => handleActualizarCantidad(
                                                        item.id_producto,
                                                        item.tipo_producto,
                                                        item.cantidad + 1
                                                    )}
                                                    size="small"
                                                    sx={{ bgcolor: '#f5f5f5' }}
                                                    disabled={item.stock_disponible && item.cantidad >= item.stock_disponible}
                                                >
                                                    +
                                                </IconButton>
                                            </Box>

                                            <Typography variant="h6" fontWeight="bold" sx={{ minWidth: 80, textAlign: 'center' }}>
                                                {(item.precio * item.cantidad).toFixed(2)}€
                                            </Typography>

                                            <IconButton
                                                onClick={() => eliminarItem(item.id_producto, item.tipo_producto)}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body1">Subtotal ({getCantidadTotal()} artículos):</Typography>
                            <Typography variant="body1">{total.toFixed(2)}€</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body1">
                                <LocalShippingIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                                Envío:
                            </Typography>
                            <Typography variant="body1">
                                {calcularEnvio() === 0 ? 'GRATIS' : `${calcularEnvio()}€`}
                            </Typography>
                        </Box>

                        {total < 50 && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 2 }}>
                                ¡Añade {(50 - total).toFixed(2)}€ más para envío gratuito!
                            </Typography>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight="bold">Total:</Typography>
                            <Typography variant="h6" fontWeight="bold" color="#da6429">
                                {totalConEnvio.toFixed(2)}€
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Columna derecha - Información de envío y pago */}
                <Grid item xs={12} md={5}>
                    {/* Datos de envío */}
                    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                            📍 Información de Envío
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nombre *"
                                    variant="outlined"
                                    value={datosEnvio.nombre}
                                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Apellidos *"
                                    variant="outlined"
                                    value={datosEnvio.apellidos}
                                    onChange={(e) => handleInputChange('apellidos', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Dirección *"
                                    variant="outlined"
                                    value={datosEnvio.direccion}
                                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Dirección (adicional)"
                                    variant="outlined"
                                    value={datosEnvio.direccion_adicional || ''}
                                    onChange={(e) => handleInputChange('direccion_adicional', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    fullWidth
                                    label="Ciudad *"
                                    variant="outlined"
                                    value={datosEnvio.ciudad}
                                    onChange={(e) => handleInputChange('ciudad', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Código Postal *"
                                    variant="outlined"
                                    value={datosEnvio.codigoPostal}
                                    onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Teléfono *"
                                    variant="outlined"
                                    value={datosEnvio.telefono}
                                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email *"
                                    type="email"
                                    variant="outlined"
                                    value={datosEnvio.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Método de pago */}
                    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <PaymentIcon sx={{ mr: 1, color: '#da6429' }} />
                            <Typography variant="h6" fontWeight="bold">
                                Método de Pago
                            </Typography>
                        </Box>

                        <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
                            <RadioGroup
                                value={metodoPago}
                                onChange={(e) => setMetodoPago(e.target.value)}
                            >
                                <FormControlLabel
                                    value="tarjeta"
                                    control={<Radio />}
                                    label="Tarjeta de Crédito/Débito"
                                />
                                <FormControlLabel
                                    value="bizum"
                                    control={<Radio />}
                                    label="Bizum"
                                />
                                <FormControlLabel
                                    value="contrareembolso"
                                    control={<Radio />}
                                    label="Contrareembolso (+3€)"
                                />
                            </RadioGroup>
                        </FormControl>

                        {metodoPago === 'tarjeta' && (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Número de Tarjeta *"
                                        variant="outlined"
                                        placeholder="1234 5678 9012 3456"
                                        value={datosPago.numeroTarjeta}
                                        onChange={(e) => handlePagoChange('numeroTarjeta', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Nombre del Titular *"
                                        variant="outlined"
                                        value={datosPago.nombreTitular}
                                        onChange={(e) => handlePagoChange('nombreTitular', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Fecha Exp. *"
                                        variant="outlined"
                                        placeholder="MM/AA"
                                        value={datosPago.fechaExpiracion}
                                        onChange={(e) => handlePagoChange('fechaExpiracion', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="CVV *"
                                        variant="outlined"
                                        placeholder="123"
                                        value={datosPago.cvv}
                                        onChange={(e) => handlePagoChange('cvv', e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        )}

                        {metodoPago === 'bizum' && (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Número de Teléfono *"
                                        variant="outlined"
                                        value={datosEnvio.bizum}
                                        onChange={(e) => handleInputChange('bizum', e.target.value)}
                                        placeholder="612345678"
                                    />
                                </Grid>
                            </Grid>
                        )}

                        {metodoPago === 'contrareembolso' && (
                            <Box sx={{ p: 2, bgcolor: '#fff3cd', borderRadius: 1 }}>
                                <Typography variant="body2">
                                    ⚠️ Se añadirán 3€ de gastos de gestión al total del pedido.
                                    Pagarás {(totalConEnvio + 3).toFixed(2)}€ al recibir el pedido.
                                </Typography>
                            </Box>
                        )}
                    </Paper>

                    {/* Botón de realizar pedido */}
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleRealizarPedido}
                        disabled={isProcessing}
                        sx={{
                            backgroundColor: '#da6429',
                            '&:hover': { backgroundColor: '#c55520' },
                            py: 2,
                            fontSize: '1.1rem',
                            fontWeight: 'bold'
                        }}
                    >
                        {isProcessing ? 'Procesando...' : `Realizar Pedido - ${metodoPago === 'contrareembolso'
                            ? (totalConEnvio + 3).toFixed(2)
                            : totalConEnvio.toFixed(2)
                            }€`}
                    </Button>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                        Al realizar el pedido, aceptas nuestros términos y condiciones
                    </Typography>
                </Grid>
            </Grid>

            {/* Dialog de confirmación */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ textAlign: 'center', color: '#da6429', fontWeight: 'bold' }}>
                    ✅ ¡Pedido Confirmado!
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ whiteSpace: 'pre-line', textAlign: 'center' }}>
                        {dialogMessage}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        onClick={handleCloseDialog}
                        variant="contained"
                        sx={{ backgroundColor: '#da6429', px: 4 }}
                    >
                        Continuar Comprando
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default PedidoPago;