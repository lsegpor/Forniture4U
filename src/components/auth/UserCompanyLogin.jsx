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
  Avatar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router';
import useUserStore from "../../stores/useUserStore";
import { apiUrl } from '../../config';

function UserCompanyLogin() {

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState('');

  const navigate = useNavigate();
  const login = useUserStore(state => state.login);

  const isLoggedIn = useUserStore(state => state.isLoggedIn);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "El correo electrónico es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El formato del correo no es válido.";
    }
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setErrors({});

    try {
      const response = await fetch(apiUrl + "/usuario/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include' // Importante para que las cookies se guarden
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        // Extraer token de la respuesta (ajustar según tu backend)
        const token = data.token || data.accessToken || data.authToken || extractTokenFromResponse(data);

        console.log('Login exitoso (usuario):', {
          user: data.datos,
          hasToken: !!token,
          tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
        });

        // Guardar usuario y token en el store
        login(data.datos, token);
        navigate('/'); // Redirigir a la página principal
      } else {
        if (response.status === 401 && !errors.secondTry) {
          setErrors({ apiError: data.mensaje || "Credenciales incorrectas." });

          try {
            const secondResponse = await fetch(apiUrl + "/empresa/login", {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData),
              credentials: 'include'
            });

            const secondData = await secondResponse.json();

            if (secondResponse.ok && secondData.ok) {
              // Extraer token de la respuesta de empresa
              const token = secondData.token || secondData.accessToken || secondData.authToken || extractTokenFromResponse(secondData);

              console.log('Login exitoso (empresa):', {
                user: secondData.datos,
                hasToken: !!token,
                tokenPreview: token ? token.substring(0, 20) + '...' : 'No token'
              });

              // Guardar empresa y token en el store
              login(secondData.datos, token);
              navigate('/');
            } else {
              // Si ambos intentos fallan, mostrar mensaje de error
              setErrors({
                apiError: "Credenciales incorrectas. Verifique su email y contraseña."
              });
            }
          } catch (secondError) {
            console.error('Error en segundo intento:', secondError);
            setErrors({
              apiError: "Error de conexión. Verifique su conexión a internet."
            });
          }
        } else {
          // Mostrar mensaje de error del primer intento
          setErrors({
            apiError: data.mensaje || "Credenciales incorrectas."
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ apiError: "Error de red. Intentalo de nuevo más tarde." + error });
    }
  };

  // Función auxiliar para extraer token de la respuesta
  const extractTokenFromResponse = (responseData) => {
    console.log('Buscando token en response:', responseData);

    // Buscar token en diferentes ubicaciones posibles
    if (responseData.token) {
      console.log('Token encontrado en responseData.token');
      return responseData.token;
    }
    if (responseData.accessToken) {
      console.log('Token encontrado en responseData.accessToken');
      return responseData.accessToken;
    }
    if (responseData.authToken) {
      console.log('Token encontrado en responseData.authToken');
      return responseData.authToken;
    }
    if (responseData.datos?.token) {
      console.log('Token encontrado en responseData.datos.token');
      return responseData.datos.token;
    }

    console.warn('No se encontró token en la respuesta:', responseData);
    return null;
  };

  if (isLoggedIn()) {
    return <Typography variant="h6">Esta funcionalidad solo está disponible para usuarios no loggeados</Typography>;
  }

  return (
    <>
      <Container component="main" maxWidth="xs">
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
            <LockOutlinedIcon />
          </Avatar>

          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Iniciar Sesión
          </Typography>

          {errors.apiError && <Alert severity="error">{errors.apiError}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
            />

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
              Iniciar Sesión
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2">
                ¿Aún no tienes cuenta?{' '}
                <Link
                  href="/register"
                  variant="body2"
                  sx={{ color: '#da6429' }}
                >
                  Regístrate
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default UserCompanyLogin;