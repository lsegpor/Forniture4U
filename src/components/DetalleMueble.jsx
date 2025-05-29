import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    CardContent,
    Typography,
    Button,
    Paper,
    Box,
    List,
    ListItem
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { apiUrl } from "../config";
import Grid from "@mui/material/Grid2";
import defaultImage from '../assets/default.jpeg'; // Ajusta la ruta según tu estructura

function DetalleMueble() {
    const params = useParams();

    const backendUrl = "http://localhost:3000";

    const [datos, setDatos] = useState({
        id_mueble: params.id_mueble,
        nombre: "",
        precio_base: "",
        fecha_entrega: "",
        requiere_montar: false,
        descripcion: "",
        id_componente_componentes: [],
    });

    const [imagenSrc, setImagenSrc] = useState(null);
    const [imagenError, setImagenError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchMuebleDetails() {
            try {
                const response = await fetch(apiUrl + "/mueble/" + datos.id_mueble);

                if (response.ok) {
                    let data = await response.json();
                    console.log("Datos recibidos de la API:", data);
                    setDatos(data.datos);

                    if (data.datos.imagen) {
                        if (data.datos.imagen.startsWith('http')) {
                            setImagenSrc(data.datos.imagen);
                        } else {
                            const imagePath = data.datos.imagen.startsWith('/')
                                ? data.datos.imagen
                                : '/' + data.datos.imagen;
                            setImagenSrc(`${backendUrl}${imagePath}`);
                        }
                        console.log("URL de imagen configurada:", `${backendUrl}${data.datos.imagen}`);
                    } else if (data.datos.imagen_url) {
                        setImagenSrc(data.datos.imagen_url);
                        console.log("URL de imagen desde imagen_url:", data.datos.imagen_url);
                    }
                }
            } catch (err) {
                console.error("Error al cargar el mueble:", err);
            }
        };

        fetchMuebleDetails();
    }, [datos.id_mueble]);

    const handleBack = () => {
        navigate(-1);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };
    const handleImageError = () => {
        console.error("Error al cargar la imagen:", imagenSrc);
        setImagenError(true);
    };

    return (
        <>
            <Box sx={{
                py: 4,
                px: { xs: 2, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <Box sx={{ alignSelf: 'flex-start', width: '100%', maxWidth: '1200px' }}>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBack}
                        sx={{ mb: 4, backgroundColor: "#da6429", color: "#fff", "&:hover": { backgroundColor: "#c55a24" } }}
                    >
                        Volver al listado
                    </Button>
                </Box>

                <Box sx={{
                    width: '100%',
                    maxWidth: '1400px',
                    mx: 'auto'
                }}>
                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={12} md={6.5}>
                            <Card elevation={3} sx={{ width: { xs: '100%', md: '500px' }, maxWidth: '100%' }}>
                                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                                    <Typography variant="h5" align="center" component="div" sx={{
                                        fontWeight: 'bold',
                                        my: 2,
                                        color: "#da6429",
                                        wordWrap: 'break-word',
                                        hyphens: 'auto'
                                    }}>
                                        {datos.nombre}
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Typography variant="body1">
                                            <strong>Precio base:</strong> {datos.precio_base}€
                                        </Typography>

                                        <Typography variant="body1">
                                            <strong>Fecha de entrega:</strong> {formatDate(datos.fecha_entrega)}
                                        </Typography>

                                        <Typography variant="body1">
                                            <strong>Requiere montaje:</strong> {datos.requiere_montar ? "Sí" : "No"}
                                        </Typography>

                                        <Typography variant="body1" sx={{
                                            wordWrap: 'break-word',
                                            hyphens: 'auto'
                                        }}>
                                            <strong>Fabricante:</strong> {datos.id_empresa_empresa?.nombre_empresa || "No disponible"}
                                        </Typography>

                                        <Box>
                                            <Typography variant="body1" component="span" sx={{ fontWeight: 'bold' }}>
                                                Descripción:
                                            </Typography>
                                            <Typography variant="body1" sx={{
                                                mt: 1,
                                                wordWrap: 'break-word',
                                                whiteSpace: 'pre-wrap', // Preserva saltos de línea y espacios
                                                hyphens: 'auto',
                                                lineHeight: 1.6,
                                                textAlign: 'justify' // Justifica el texto para mejor apariencia
                                            }}>
                                                {datos.descripcion}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                                        {imagenSrc && !imagenError ? (
                                            <img
                                                src={imagenSrc}
                                                alt={datos.nombre}
                                                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                                                onError={handleImageError}
                                            />
                                        ) : (
                                            <img
                                                src={defaultImage}
                                                alt={`${datos.nombre} (imagen predeterminada)`}
                                                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                                            />
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={5.5}>
                            <Paper elevation={3} sx={{
                                p: { xs: 2, md: 4 },
                                height: '100%',
                                width: { xs: '100%', md: '450px' },
                                maxWidth: '100%'
                            }}>
                                <Typography variant="h6" gutterBottom sx={{
                                    borderBottom: '1px solid #e0e0e0',
                                    pb: 2,
                                    color: "#da6429",
                                    textAlign: "center",
                                    fontSize: '1.3rem'
                                }}>
                                    Componentes
                                </Typography>

                                {datos.id_componente_componentes && datos.id_componente_componentes.length > 0 ? (
                                    <List sx={{ pl: 1, pr: 1 }}>
                                        {datos.id_componente_componentes.map((componente, index) => {
                                            const cantidad = componente.mueble_componentes?.cantidad ||
                                                componente.muebleComponentes?.cantidad ||
                                                componente.cantidad || 0;

                                            return (
                                                <ListItem key={index} sx={{
                                                    py: 2,
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-start',
                                                    borderBottom: index < datos.id_componente_componentes.length - 1 ? '1px solid #f0f0f0' : 'none'
                                                }}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                        {componente.nombre}
                                                    </Typography>
                                                    <Box sx={{ mt: 1.5, maxWidth: '100%' }}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1rem' }}>
                                                            Cantidad: {cantidad}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1rem', mt: 0.5 }}>
                                                            Precio unitario: {componente.precio ? `${componente.precio}€` : "No disponible"}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1, fontSize: '1.05rem' }}>
                                                            Subtotal: {((componente.precio || 0) * cantidad).toFixed(2)}€
                                                        </Typography>
                                                    </Box>
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4, fontSize: '1.1rem' }}>
                                        No hay componentes registrados para este mueble.
                                    </Typography>
                                )}

                                {datos.id_componente_componentes && datos.id_componente_componentes.length > 0 && (
                                    <Box sx={{ mt: 4, pt: 2, borderTop: '2px solid #e0e0e0' }}>
                                        <Typography variant="body1" fontWeight="bold" sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '1.1rem',
                                            mb: 1
                                        }}>
                                            <span>Precio total:</span>
                                            <span>{
                                                datos.id_componente_componentes.reduce((total, componente) => {
                                                    const cantidad = componente.mueble_componentes?.cantidad ||
                                                        componente.muebleComponentes?.cantidad ||
                                                        componente.cantidad || 0;
                                                    return total + (componente.precio || 0) * cantidad;
                                                }, 0).toFixed(2)
                                            }€</span>
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold" sx={{
                                            mt: 2,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            color: "#da6429",
                                            fontSize: '1.25rem'
                                        }}>
                                            <span>Precio final:</span>
                                            <span>{
                                                (parseFloat(datos.precio_base) +
                                                    datos.id_componente_componentes.reduce((total, componente) => {
                                                        const cantidad = componente.mueble_componentes?.cantidad ||
                                                            componente.muebleComponentes?.cantidad ||
                                                            componente.cantidad || 0;
                                                        return total + (componente.precio || 0) * cantidad;
                                                    }, 0)).toFixed(2)
                                            }€</span>
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </>
    );
}

export default DetalleMueble;