import { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Link,
    Alert,
    Avatar,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    FormHelperText,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import HowToRegIcon from '@mui/icons-material/HowToReg';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router';
import { apiUrl } from '../config';
import { es } from 'date-fns/locale';

registerLocale("es", es);

function UserCompanyRegister() {
    const [activeTab, setActiveTab] = useState(0);

    const [userFormData, setUserFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        nombre: "",
        apellidos: "",
        direccion: "",
        f_nacimiento: null,
        sexo: "",
        ofertas: true
    });

    const [companyFormData, setCompanyFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        nombre_empresa: "",
        cif_nif_nie: "",
        direccion: "",
        nombre_personal: null,
        apellidos: "",
        ofertas: true
    });

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        navigate("/");
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setErrors({}); // Limpiar errores al cambiar de pestaña
    };

    const handleUserChange = (e) => {
        const { name, value, checked, type } = e.target;

        setUserFormData({
            ...userFormData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Limpiar error cuando el usuario escribe
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleDateChange = (date) => {
        setUserFormData({
            ...userFormData,
            f_nacimiento: date ? date.toISOString().split("T")[0] : "",
        });

        // Limpiar error de fecha
        if (errors.f_nacimiento) {
            setErrors(prev => ({ ...prev, f_nacimiento: '' }));
        }
    };

    const handleCompanyChange = (e) => {
        const { name, value, checked, type } = e.target;

        setCompanyFormData({
            ...companyFormData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Limpiar error cuando la empresa escribe
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateUserForm = () => {
        const newErrors = {};

        // Validación de email
        if (!userFormData.email) {
            newErrors.email = "El correo electrónico es obligatorio.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userFormData.email)) {
            newErrors.email = "El formato del correo no es válido.";
        }

        // Validación de contraseña
        if (!userFormData.password) {
            newErrors.password = "La contraseña es obligatoria.";
        } else if (userFormData.password.length < 8) {
            newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
        }

        // Confirmar contraseña
        if (userFormData.password !== userFormData.confirmPassword) {
            newErrors.confirmPassword = "Las contraseñas no coinciden.";
        }

        // Validación de nombre
        if (!userFormData.nombre) {
            newErrors.nombre = "El nombre es obligatorio.";
        }

        // Validación de apellidos
        if (!userFormData.apellidos) {
            newErrors.apellidos = "Los apellidos son obligatorios.";
        }

        // Validación de dirección
        if (!userFormData.direccion) {
            newErrors.direccion = "La dirección es obligatoria.";
        }

        // Validación de fecha de nacimiento
        if (!userFormData.f_nacimiento) {
            newErrors.f_nacimiento = "La fecha de nacimiento es obligatoria.";
        } else {
            const today = new Date();
            const birthDate = new Date(userFormData.f_nacimiento);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 18) {
                newErrors.f_nacimiento = "Debes ser mayor de 18 años para registrarte.";
            }
        }

        // Validación de sexo
        if (!userFormData.sexo) {
            newErrors.sexo = "Este campo es obligatorio.";
        }

        setErrors(prev => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    const validateCompanyForm = () => {
        const newErrors = {};

        // Validación de email
        if (!companyFormData.email) {
            newErrors.email = "El correo electrónico es obligatorio.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyFormData.email)) {
            newErrors.email = "El formato del correo no es válido.";
        }

        // Validación de contraseña
        if (!companyFormData.password) {
            newErrors.password = "La contraseña es obligatoria.";
        } else if (companyFormData.password.length < 8) {
            newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
        }

        // Confirmar contraseña
        if (companyFormData.password !== companyFormData.confirmPassword) {
            newErrors.confirmPassword = "Las contraseñas no coinciden.";
        }

        // Validación de nombre de empresa
        if (!companyFormData.nombre_empresa) {
            newErrors.nombre_empresa = "El nombre de la empresa es obligatorio.";
        }

        // Validación de CIF/NIF/NIE
        if (!companyFormData.cif_nif_nie) {
            newErrors.cif_nif_nie = "El CIF/NIF/NIE es obligatorio.";
        } else if (!/^[A-Z0-9]{9}$/.test(companyFormData.cif_nif_nie)) {
            newErrors.cif_nif_nie = "El formato de CIF/NIF/NIE no es válido. Debe tener 9 caracteres.";
        }

        // Validación de dirección
        if (!companyFormData.direccion) {
            newErrors.direccion = "La dirección es obligatoria.";
        }

        // Validación de nombre del representante
        if (!companyFormData.nombre_personal) {
            newErrors.nombre_personal = "El nombre del representante es obligatorio.";
        }

        // Validación de apellidos del representante
        if (!companyFormData.apellidos) {
            newErrors.apellidos = "Los apellidos son obligatorios.";
        }

        setErrors(prev => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar según el formulario activo
        const isValid = activeTab === 0
            ? validateUserForm()
            : validateCompanyForm();

        if (!isValid) return;

        setErrors({});

        try {
            // Determinar datos y endpoint según pestaña activa
            const endpoint = activeTab === 0 ? "/usuario/register" : "/empresa/register";

            // Preparar datos para enviar (remover confirmPassword)
            const dataToSend = activeTab === 0
                ? { ...userFormData }
                : { ...companyFormData };

            delete dataToSend.confirmPassword;

            // Formatear fecha para el backend si es usuario
            if (activeTab === 0 && dataToSend.f_nacimiento) {
                const date = new Date(dataToSend.f_nacimiento);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                dataToSend.f_nacimiento = `${year}-${month}-${day}`;
            }

            const response = await fetch(`${apiUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });

            const data = await response.json();

            if (response.ok && data.ok) {
                setMessage(`Cuenta creada correctamente. Redirigiendo al login.`);
                // Resetear el formulario
                if (activeTab === 0) {
                    setUserFormData({
                        email: "",
                        password: "",
                        confirmPassword: "",
                        nombre: "",
                        apellidos: "",
                        direccion: "",
                        f_nacimiento: null,
                        sexo: "",
                        ofertas: true
                    });
                } else {
                    setCompanyFormData({
                        email: "",
                        password: "",
                        confirmPassword: "",
                        nombre_empresa: "",
                        cif_nif_nie: "",
                        direccion: "",
                        nombre_personal: "",
                        apellidos: "",
                        ofertas: true
                    });
                }

                // Redirigir después de un breve retraso
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setMessage(`Error al crear la cuenta.`);
                // Mostrar mensaje de error
                setErrors({
                    apiError: data.mensaje || `Error al registrar ${activeTab === 0 ? 'usuario' : 'empresa'}.`
                });
            }
            handleClickOpen();
        } catch (error) {
            console.error('Error en registro:', error);
            setErrors({
                apiError: "Error de conexión. Verifique que el servidor esté funcionando."
            });
        }
    };

    const customDatePickerStyle = {
        width: '100%',
        padding: '16.5px 14px',
        fontSize: '1rem',
        borderRadius: '4px',
        border: '1px solid rgba(0, 0, 0, 0.23)',
        marginTop: '16px',
        marginBottom: '8px',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        boxSizing: 'border-box'
    };

    return (
        <>
            <Container component="main" maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        marginTop: 8,
                        marginBottom: 8,
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: '#da6429' }}>
                        <HowToRegIcon />
                    </Avatar>

                    <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                        Registro
                    </Typography>

                    {/* Pestañas para elegir entre usuario y empresa */}
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        aria-label="register tabs"
                        sx={{
                            mb: 3,
                            width: '100%',
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#da6429',
                            },
                        }}
                        centered
                    >
                        <Tab
                            icon={<PersonIcon />}
                            label="Usuario"
                            id="user-tab"
                            aria-controls="user-panel"
                            sx={{
                                color: activeTab === 0 ? '#da6429' : 'inherit',
                                '&.Mui-selected': {
                                    color: '#da6429',
                                },
                                mx: 3,
                            }}
                        />
                        <Tab
                            icon={<BusinessIcon />}
                            label="Empresa"
                            id="company-tab"
                            aria-controls="company-panel"
                            sx={{
                                color: activeTab === 1 ? '#da6429' : 'inherit',
                                '&.Mui-selected': {
                                    color: '#da6429',
                                },
                                mx: 3,
                            }}
                        />
                    </Tabs>

                    {errors.apiError && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {errors.apiError}
                        </Alert>
                    )}

                    {/* Panel para registro de Usuario */}
                    {activeTab === 0 && (
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                            <Grid container spacing={2} direction="column" sx={{ mx: 3 }}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="nombre"
                                        label="Nombre"
                                        name="nombre"
                                        autoComplete="given-name"
                                        value={userFormData.nombre}
                                        onChange={handleUserChange}
                                        error={!!errors.nombre}
                                        helperText={errors.nombre}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="apellidos"
                                        label="Apellidos"
                                        name="apellidos"
                                        autoComplete="family-name"
                                        value={userFormData.apellidos}
                                        onChange={handleUserChange}
                                        error={!!errors.apellidos}
                                        helperText={errors.apellidos}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="direccion"
                                        label="Dirección"
                                        name="direccion"
                                        autoComplete="street-address"
                                        value={userFormData.direccion}
                                        onChange={handleUserChange}
                                        error={!!errors.direccion}
                                        helperText={errors.direccion}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <DatePicker
                                        label="Fecha de nacimiento"
                                        placeholderText='Fecha de nacimiento'
                                        locale="es"
                                        dateFormat="dd/MM/yyyy"
                                        className="border rounded-lg py-2 px-3 w-100"
                                        calendarClassName="custom-calendar"
                                        selected={userFormData.f_nacimiento ? new Date(userFormData.f_nacimiento) : null}
                                        onChange={handleDateChange}
                                        style={customDatePickerStyle}
                                        dayClassName={(date) =>
                                            userFormData.f_nacimiento === date.toISOString().split("T")[0]
                                                ? "selected-day"
                                                : "day"
                                        }
                                    />
                                    <style>{`
        .custom-datepicker {
          width: 100%;
          padding: 16.5px 14px;
          font-size: 1rem;
          border-radius: 4px;
          border: 1px solid rgba(0, 0, 0, 0.23);
          font-family: "Roboto", "Helvetica", "Arial", sans-serif;
          box-sizing: border-box;
        }
        
        .react-datepicker-wrapper {
          width: 100%;
          display: block;
        }
        
        .react-datepicker__input-container {
          width: 100%;
          display: block;
        }
        
        .date-picker-wrapper {
          width: 100%;
          display: block;
        }
        
        .custom-datepicker:focus {
          border: 2px solid #da6429;
          outline: none;
        }
        
        .react-datepicker__day--selected {
          background-color: #da6429 !important;
          color: white !important;
        }
        
        .react-datepicker__day:hover {
          background-color: #f0814f !important;
          color: white !important;
        }
        
        /* Aumentar el tamaño del calendario */
        .react-datepicker {
          font-size: 1rem !important;
        }
        
        .react-datepicker__header {
          padding-top: 10px !important;
        }
        
        .react-datepicker__month {
          margin: 0.4rem !important;
        }
        
        .react-datepicker__day-name, .react-datepicker__day {
          width: 2rem !important;
          line-height: 2rem !important;
          margin: 0.2rem !important;
        }
      `}</style>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FormControl
                                        fullWidth
                                        required
                                        error={!!errors.sexo}
                                    >
                                        <InputLabel id="sexo-label">Género</InputLabel>
                                        <Select
                                            labelId="sexo-label"
                                            id="sexo"
                                            name="sexo"
                                            value={userFormData.sexo}
                                            label="Género"
                                            onChange={handleUserChange}
                                        >
                                            <MenuItem value="hombre">Hombre</MenuItem>
                                            <MenuItem value="mujer">Mujer</MenuItem>
                                            <MenuItem value="otro">Otro</MenuItem>
                                        </Select>
                                        {errors.sexo && <FormHelperText>{errors.sexo}</FormHelperText>}
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email"
                                        name="email"
                                        autoComplete="email"
                                        value={userFormData.email}
                                        onChange={handleUserChange}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="password"
                                        label="Contraseña"
                                        type="password"
                                        id="password"
                                        autoComplete="new-password"
                                        value={userFormData.password}
                                        onChange={handleUserChange}
                                        error={!!errors.password}
                                        helperText={errors.password}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="confirmPassword"
                                        label="Confirmar contraseña"
                                        type="password"
                                        id="confirmPassword"
                                        value={userFormData.confirmPassword}
                                        onChange={handleUserChange}
                                        error={!!errors.confirmPassword}
                                        helperText={errors.confirmPassword}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="ofertas"
                                                color="primary"
                                                checked={userFormData.ofertas}
                                                onChange={handleUserChange}
                                            />
                                        }
                                        label="Deseo recibir ofertas y novedades por correo"
                                    />
                                </Grid>
                            </Grid>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    bgcolor: '#da6429',
                                    '&:hover': {
                                        bgcolor: '#c55a24',
                                    }
                                }}
                            >
                                Registrarme como Usuario
                            </Button>
                        </Box>
                    )}

                    {/* Panel para registro de Empresa */}
                    {activeTab === 1 && (
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                            <Grid container spacing={2} direction={"column"} sx={{ mx: 3 }}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="nombre_empresa"
                                        label="Nombre de la empresa"
                                        name="nombre_empresa"
                                        autoComplete="organization"
                                        value={companyFormData.nombre_empresa}
                                        onChange={handleCompanyChange}
                                        error={!!errors.nombre_empresa}
                                        helperText={errors.nombre_empresa}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="cif_nif_nie"
                                        label="CIF/NIF/NIE"
                                        name="cif_nif_nie"
                                        value={companyFormData.cif_nif_nie}
                                        onChange={handleCompanyChange}
                                        error={!!errors.cif_nif_nie}
                                        helperText={errors.cif_nif_nie}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="direccion"
                                        label="Dirección"
                                        name="direccion"
                                        autoComplete="street-address"
                                        value={companyFormData.direccion}
                                        onChange={handleCompanyChange}
                                        error={!!errors.direccion}
                                        helperText={errors.direccion}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="nombre_personal"
                                        label="Nombre del representante"
                                        name="nombre_personal"
                                        autoComplete="given-name"
                                        value={companyFormData.nombre_personal}
                                        onChange={handleCompanyChange}
                                        error={!!errors.nombre_personal}
                                        helperText={errors.nombre_personal}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="apellidos"
                                        label="Apellidos del representante"
                                        name="apellidos"
                                        autoComplete="family-name"
                                        value={companyFormData.apellidos}
                                        onChange={handleCompanyChange}
                                        error={!!errors.apellidos}
                                        helperText={errors.apellidos}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email corporativo"
                                        name="email"
                                        autoComplete="email"
                                        value={companyFormData.email}
                                        onChange={handleCompanyChange}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="password"
                                        label="Contraseña"
                                        type="password"
                                        id="password"
                                        autoComplete="new-password"
                                        value={companyFormData.password}
                                        onChange={handleCompanyChange}
                                        error={!!errors.password}
                                        helperText={errors.password}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="confirmPassword"
                                        label="Confirmar contraseña"
                                        type="password"
                                        id="confirmPassword"
                                        value={companyFormData.confirmPassword}
                                        onChange={handleCompanyChange}
                                        error={!!errors.confirmPassword}
                                        helperText={errors.confirmPassword}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="ofertas"
                                                color="primary"
                                                checked={companyFormData.ofertas}
                                                onChange={handleCompanyChange}
                                            />
                                        }
                                        label="Deseo recibir ofertas y novedades por correo"
                                    />
                                </Grid>
                            </Grid>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    bgcolor: '#da6429',
                                    '&:hover': {
                                        bgcolor: '#c55a24',
                                    }
                                }}
                            >
                                Registrar Empresa
                            </Button>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Typography variant="body2">
                            ¿Ya tienes cuenta?{' '}
                            <Link
                                href="/login"
                                variant="body2"
                                sx={{ color: '#da6429' }}
                            >
                                Iniciar sesión
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Container>

            <Dialog
                open={open}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>Estado de alta</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        sx={{ color: "#da6429" }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default UserCompanyRegister;