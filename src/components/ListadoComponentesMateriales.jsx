import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Fab,
  Badge,
  Snackbar,
  Alert,
  Link,
  Tooltip,
  Container,
  Card,
  CardContent,
  CardActions,
  Chip,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { useNavigate } from "react-router";
import { apiUrl } from "../config";
import useUserStore from "../stores/useUserStore";
import useCarritoStore from "../stores/useCarritoStore";

/**
 * Componente que muestra una lista de componentes filtrados por material.
 * @component
 */
function ListadoComponentesMateriales() {
  const [materiales, setMateriales] = useState([]);
  const [materialSeleccionado, setMaterialSeleccionado] = useState("");
  const [componentes, setComponentes] = useState([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [openCarritoModal, setOpenCarritoModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openLoginDialog, setOpenLoginDialog] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const navigate = useNavigate();

  const isEmpresa = useUserStore((state) => state.isEmpresa());
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  // Estados y funciones del carrito
  const {
    items,
    total,
    getCantidadTotal,
    agregarItem,
    eliminarItem,
    actualizarCantidad,
    limpiarCarrito,
    tieneProducto,
    validarStock
  } = useCarritoStore();

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 400, md: 500 },
    maxWidth: "90vw",
    maxHeight: "80vh",
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    outline: 'none'
  };

  const carritoModalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: 600, md: 700 },
    maxWidth: "95vw",
    maxHeight: "90vh",
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 3,
    outline: 'none',
    overflow: 'auto'
  };

  const handleOpenModal = (content) => {
    setModalContent(content);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleOpenCarritoModal = () => {
    setOpenCarritoModal(true);
  };

  const handleCloseCarritoModal = () => {
    setOpenCarritoModal(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleProcederCheckout = () => {
    if (items.length === 0) {
      showSnackbar('El carrito está vacío', 'error');
      return;
    }

    if (!isLoggedIn()) {
      handleCloseCarritoModal();
      setOpenLoginDialog(true);
      return;
    }

    handleCloseCarritoModal();
    navigate("/checkout");
  };

  const handleCloseLoginDialog = () => {
    setOpenLoginDialog(false);
  };

  const handleGoToLogin = () => {
    setOpenLoginDialog(false);
    navigate("/login");
  };

  /**
   * Abre el diálogo de confirmación.
   */
  const handleClickOpen = () => {
    setOpen(true);
  };

  /**
   * Cierra el diálogo de confirmación.
   */
  const handleClose = () => {
    setOpen(false);
  };

  /**
   * Elimina un componente por su ID.
   * @param {number} id_componente - ID del componente a eliminar.
   */
  const handleDelete = async (id_componente) => {
    try {
      const response = await fetch(apiUrl + `/componentes/${id_componente}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setComponentes((prevRows) =>
          prevRows.filter((row) => row.id_componente !== id_componente)
        );
        setMessage(
          `Componente con ID ${id_componente} eliminado correctamente`
        );
      } else {
        setMessage(`Error al eliminar el componente con ID ${id_componente}`);
      }
      handleClickOpen();
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
      setMessage("Error al realizar la solicitud"); // Mensaje de error
      handleClickOpen();
    }
  };

  // Obtener materiales únicos al cargar el componente
  useEffect(() => {
    const fetchMateriales = async () => {
      try {
        const response = await fetch(apiUrl + "/componentes/materiales");
        const data = await response.json();
        setMateriales(data);
      } catch (error) {
        console.error("Error al obtener materiales:", error);
      }
    };

    fetchMateriales();
  }, []);

  const handleAgregarAlCarrito = (componente) => {
    try {
      // Verificar si hay stock disponible
      if (componente.cantidad <= 0) {
        showSnackbar('Este componente no tiene stock disponible', 'error');
        return;
      }

      // Formatear el componente para el carrito
      const componenteCarrito = {
        id_componente: componente.id_componente,
        id_producto: componente.id_componente, // Para compatibilidad
        tipo_producto: 'componente',
        nombre: componente.nombre,
        precio: componente.precio,
        descripcion: componente.descripcion,
        cantidad: componente.cantidad, // Stock disponible
      };

      // Verificar si se puede agregar más cantidad
      if (!validarStock(componenteCarrito)) {
        showSnackbar('No hay suficiente stock disponible', 'warning');
        return;
      }

      agregarItem(componenteCarrito);
      showSnackbar(`${componente.nombre} agregado al carrito`, 'success');
    } catch (error) {
      showSnackbar(error.message || 'Error al agregar al carrito', 'error');
    }
  };

  /**
   * Maneja el cambio del material seleccionado.
   * @param {Event} event - El evento de cambio del material.
   */
  const handleMaterialChange = async (event) => {
    const material = event.target.value;
    setMaterialSeleccionado(material);

    if (material) {
      try {
        const response = await fetch(apiUrl + `/componentes/materiales/${material}`);
        const data = await response.json();
        setComponentes(data);
      } catch (error) {
        console.error("Error al obtener componentes:", error);
      }
    } else {
      setComponentes([]);
    }
  };

  const handleActualizarCantidad = (id_producto, tipo_producto, nuevaCantidad) => {
    try {
      actualizarCantidad(id_producto, tipo_producto, nuevaCantidad);
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
  };

  // Componente Card para vista móvil
  const ComponenteCard = ({ componente }) => (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            mb: 1,
            color: '#332f2d',
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          {componente.nombre}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            <strong>Precio:</strong> {componente.precio}€
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            <strong>Fecha importación:</strong> {componente.fecha_importacion}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            <strong>Material:</strong> {componente.material}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <strong>Stock:</strong>
            <Chip
              label={componente.cantidad}
              size="small"
              color={componente.cantidad > 0 ? "success" : "error"}
            />
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: '100%' }}>
          <Button
            size="small"
            startIcon={<InfoIcon />}
            onClick={() => handleOpenModal(componente.descripcion)}
            sx={{
              color: '#da6429',
              borderColor: '#da6429',
              '&:hover': {
                borderColor: '#c55520',
                backgroundColor: 'rgba(218, 100, 41, 0.04)'
              }
            }}
            variant="outlined"
          >
            Ver Descripción
          </Button>

          {!isEmpresa && (
            <Tooltip title={
              componente.cantidad === 0 ? "Sin stock" :
                tieneProducto(componente.id_componente, 'componente') ? "Ya está en el carrito" :
                  "Agregar al carrito"
            }>
              <span>
                <Button
                  size="small"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={() => handleAgregarAlCarrito(componente)}
                  disabled={componente.cantidad === 0}
                  variant={tieneProducto(componente.id_componente, 'componente') ? "contained" : "outlined"}
                  sx={{
                    backgroundColor: tieneProducto(componente.id_componente, 'componente') ? "#4caf50" : "transparent",
                    color: tieneProducto(componente.id_componente, 'componente') ? "white" : "#da6429",
                    borderColor: tieneProducto(componente.id_componente, 'componente') ? "#4caf50" : "#da6429",
                    '&:hover': {
                      backgroundColor: tieneProducto(componente.id_componente, 'componente') ? "#45a049" : "rgba(218, 100, 41, 0.04)",
                      borderColor: tieneProducto(componente.id_componente, 'componente') ? "#45a049" : "#c55520",
                    },
                    '&:disabled': {
                      color: '#ccc',
                      borderColor: '#ccc'
                    }
                  }}
                >
                  {tieneProducto(componente.id_componente, 'componente') ? "En carrito" : "Agregar"}
                </Button>
              </span>
            </Tooltip>
          )}

          {isEmpresa && (
            <>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => navigate("/modificarcomponente/" + componente.id_componente)}
                variant="outlined"
                sx={{
                  color: '#666',
                  borderColor: '#666',
                  '&:hover': {
                    borderColor: '#333',
                    backgroundColor: 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Editar
              </Button>
              <Button
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => handleDelete(componente.id_componente)}
                variant="outlined"
                color="error"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(211, 47, 47, 0.04)'
                  }
                }}
              >
                Eliminar
              </Button>
            </>
          )}
        </Box>
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 3 } }}>
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
        Listado de componentes por materiales
      </Typography>

      {/* Botón flotante del carrito */}
      {!isEmpresa && (
        <Fab
          color="primary"
          aria-label="carrito"
          onClick={handleOpenCarritoModal}
          sx={{
            position: 'fixed',
            top: {
              xs: 'calc(180px + 1rem)', // 70px altura navbar móvil + margen
              sm: 'calc(120px + 1rem)',
              md: 'calc(120px + 1rem)', // 80px altura navbar desktop + margen
              lg: 'calc(100px + 1rem)'
            },
            right: 20,
            backgroundColor: '#da6429',
            '&:hover': {
              backgroundColor: '#c55520'
            },
            zIndex: 1000,
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 }
          }}
        >
          <Badge badgeContent={getCantidadTotal()} color="error">
            <ShoppingCartIcon />
          </Badge>
        </Fab>
      )}

      <Box sx={{ maxWidth: 500, mx: "auto", mb: 4 }}>
        <FormControl fullWidth>
          <InputLabel id="lblComponentes">Materiales</InputLabel>
          <Select
            labelId="lblComponentes"
            id="lstComponentes"
            value={materialSeleccionado}
            label="Componente a seleccionar"
            onChange={handleMaterialChange}
          >
            {materiales.map((material) => (
              <MenuItem
                key={material}
                value={material}
              >
                {material}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box>
        {isMobile || isTablet ? (
          // Vista de cards para móvil y tablet
          <Box sx={{ px: { xs: 1, sm: 2 } }}>
            {componentes.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No se encontraron componentes
                </Typography>
              </Box>
            ) : (
              componentes.map((componente) => (
                <ComponenteCard key={componente.id_componente} componente={componente} />
              ))
            )}
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{
            my: 2,
            mx: { xs: 1, sm: 2, lg: 4 },
            borderRadius: 2,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }} id="table-container">
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead sx={{ backgroundColor: "#e2d0c6" }}>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>NOMBRE</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>PRECIO</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>FECHA DE IMPORTACIÓN</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>CANTIDAD</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>MATERIAL</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>DESCRIPCIÓN</TableCell>
                  {!isEmpresa && (
                    <>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>AGREGAR AL CARRITO</TableCell>
                    </>
                  )}
                  {isEmpresa && (
                    <>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>ELIMINAR</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>EDITAR</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {componentes.map((row) => (
                  <TableRow
                    key={row.id_componente}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 }, '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)'
                      }
                    }}
                  >
                    <TableCell align="center">{row.nombre}</TableCell>
                    <TableCell align="center">{row.precio + "€"}</TableCell>
                    <TableCell align="center">{row.fecha_importacion}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.cantidad}
                        size="small"
                        color={row.cantidad > 0 ? "success" : "error"}
                      />
                    </TableCell>
                    <TableCell align="center">{row.material}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleOpenModal(row.descripcion)}
                        sx={{ color: "#da6429" }}
                      >
                        <InfoIcon />
                      </IconButton>
                    </TableCell>
                    {!isEmpresa && (
                      <>
                        <TableCell align="center">
                          <Tooltip title={
                            row.cantidad === 0 ? "Sin stock" :
                              tieneProducto(row.id_componente, 'componente') ? "Ya está en el carrito" :
                                "Agregar al carrito"
                          }>
                            <span>
                              <IconButton
                                onClick={() => handleAgregarAlCarrito(row)}
                                disabled={row.cantidad === 0}
                                sx={{
                                  color: tieneProducto(row.id_componente, 'componente') ? "#4caf50" : "#da6429",
                                  '&:disabled': {
                                    color: '#ccc'
                                  }
                                }}
                              >
                                <AddShoppingCartIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </>
                    )}
                    {isEmpresa && (
                      <>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => handleDelete(row.id_componente)}
                            sx={{ color: "#d32f2f" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => navigate("/modificarcomponente/" + row.id_componente)}
                            sx={{ color: "#666" }}
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Modal de descripción */}
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Paper sx={modalStyle}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
              <Typography
                id="modal-title"
                variant="h6"
                component="h2"
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                Descripción
              </Typography>
              <IconButton
                onClick={handleCloseModal}
                size="small"
                sx={{ color: 'grey.500' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{
              mb: 3,
              maxHeight: '400px',
              overflowY: 'auto',
              pr: 1
            }}>
              <Typography
                id="modal-description"
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  hyphens: 'auto',
                  lineHeight: 1.6,
                  textAlign: 'justify',
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                {modalContent}
              </Typography>
            </Box>
          </Paper>
        </Modal>

        {/* Modal del carrito */}
        {!isEmpresa && (
          <Modal
            open={openCarritoModal}
            onClose={handleCloseCarritoModal}
            aria-labelledby="carrito-modal-title"
          >
            <Paper sx={carritoModalStyle}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
              }}>
                <Typography
                  id="carrito-modal-title"
                  variant="h5"
                  component="h2"
                  sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}
                >
                  🛒 Carrito de Compras
                </Typography>
                <IconButton
                  onClick={handleCloseCarritoModal}
                  sx={{ color: 'grey.500' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              {items.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    El carrito está vacío
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
                  >
                    Agrega algunos productos para comenzar
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ maxHeight: { xs: '300px', sm: '400px' }, overflowY: 'auto', mb: 3 }}>
                    {items.map((item) => (
                      <Paper
                        key={`${item.id_producto}-${item.tipo_producto}`}
                        elevation={1}
                        sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}
                      >
                        <Box sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          justifyContent: 'space-between',
                          alignItems: { xs: 'stretch', sm: 'center' },
                          gap: { xs: 2, sm: 0 }
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="h6"
                              gutterBottom
                              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                            >
                              {item.nombre}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                            >
                              Precio unitario: {item.precio}€
                            </Typography>
                          </Box>

                          <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'row', sm: 'row' },
                            alignItems: 'center',
                            justifyContent: { xs: 'space-between', sm: 'flex-end' },
                            gap: { xs: 1, sm: 2 }
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton
                                onClick={() => handleActualizarCantidad(
                                  item.id_producto,
                                  item.tipo_producto,
                                  item.cantidad - 1
                                )}
                                size="small"
                              >
                                -
                              </IconButton>
                              <Typography
                                variant="body1"
                                sx={{
                                  minWidth: 30,
                                  textAlign: 'center',
                                  fontSize: { xs: '0.9rem', sm: '1rem' }
                                }}
                              >
                                {item.cantidad}
                              </Typography>
                              <IconButton
                                onClick={() => handleActualizarCantidad(
                                  item.id_producto,
                                  item.tipo_producto,
                                  item.cantidad + 1
                                )}
                                size="small"
                                disabled={item.stock_disponible && item.cantidad >= item.stock_disponible}
                              >
                                +
                              </IconButton>
                            </Box>

                            <Typography
                              variant="body1"
                              fontWeight="bold"
                              sx={{
                                minWidth: { xs: 50, sm: 60 },
                                fontSize: { xs: '0.9rem', sm: '1rem' }
                              }}
                            >
                              {(item.precio * item.cantidad).toFixed(2)}€
                            </Typography>

                            <IconButton
                              onClick={() => eliminarItem(item.id_producto, item.tipo_producto)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                            </IconButton>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>

                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 0 }
                    }}>
                      <Typography
                        variant="h6"
                        sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                      >
                        Total: {total.toFixed(2)}€
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                      >
                        {getCantidadTotal()} {getCantidadTotal() === 1 ? 'artículo' : 'artículos'}
                      </Typography>
                    </Box>

                    <Box sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2
                    }}>
                      <Button
                        variant="outlined"
                        onClick={limpiarCarrito}
                        fullWidth
                        sx={{
                          height: { xs: '44px', sm: '48px' },
                          fontSize: { xs: '0.9rem', sm: '1rem' }
                        }}
                      >
                        Vaciar Carrito
                      </Button>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: '#da6429',
                          height: { xs: '44px', sm: '48px' },
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          '&:hover': {
                            backgroundColor: '#c55520'
                          }
                        }}
                        onClick={handleProcederCheckout}
                        fullWidth
                      >
                        Proceder al Checkout
                      </Button>
                    </Box>
                  </Box>
                </>
              )}
            </Paper>
          </Modal>
        )}
      </Box>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isMobile ? 'center' : 'left'
        }}
        sx={{
          '& .MuiSnackbarContent-root': {
            fontSize: { xs: '0.85rem', sm: '0.9rem' }
          }
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            fontSize: { xs: '0.85rem', sm: '0.9rem' }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Dialog de login requerido */}
      <Dialog
        open={openLoginDialog}
        onClose={handleCloseLoginDialog}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 2, sm: 4 },
            width: { xs: 'calc(100% - 32px)', sm: 'auto' },
            maxWidth: { xs: 'calc(100% - 32px)', sm: '600px' }
          }
        }}
      >
        <DialogTitle sx={{
          textAlign: 'center',
          color: '#da6429',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}>
          🔐 ¿Tienes cuenta?
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <DialogContentText sx={{
            fontSize: { xs: '1rem', sm: '1.1rem' },
            mb: 2
          }}>
            Para proceder al checkout necesitas iniciar sesión
          </DialogContentText>
          <DialogContentText sx={{
            color: 'text.secondary',
            fontSize: { xs: '0.85rem', sm: '0.9rem' }
          }}>
            Si no tienes cuenta, puedes registrarte fácilmente{' '}
            <Link
              href="/register"
              sx={{
                color: '#da6429',
                textDecoration: 'underline',
                fontWeight: 'bold',
                '&:hover': {
                  color: '#c55520',
                  textDecoration: 'underline'
                }
              }}
            >
              aquí
            </Link>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{
          justifyContent: 'center',
          gap: 2,
          pb: 3,
          px: 3,
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button
            onClick={handleCloseLoginDialog}
            variant="outlined"
            fullWidth={isMobile}
            sx={{
              borderColor: '#da6429',
              color: '#da6429',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              height: { xs: '44px', sm: '48px' },
              '&:hover': {
                borderColor: '#c55520',
                color: '#c55520'
              }
            }}
          >
            Cerrar
          </Button>
          <Button
            onClick={handleGoToLogin}
            variant="contained"
            fullWidth={isMobile}
            sx={{
              backgroundColor: '#da6429',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              height: { xs: '44px', sm: '48px' },
              '&:hover': { backgroundColor: '#c55520' },
              px: 4
            }}
          >
            Iniciar Sesión
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
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
          Estado de eliminación
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
              fontSize: { xs: '0.9rem', sm: '1rem' },
              minWidth: { xs: '80px', sm: '100px' }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container >
  );
}

export default ListadoComponentesMateriales;
