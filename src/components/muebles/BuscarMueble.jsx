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
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Modal,
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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import BuildIcon from "@mui/icons-material/Build";
import BusinessIcon from "@mui/icons-material/Business";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { apiUrl } from "../../config";
import useUserStore from "../../stores/useUserStore";
import useCarritoStore from "../../stores/useCarritoStore";

/**
 * Componente BuscarMueble que permite buscar y gestionar muebles.
 * @returns {JSX.Element} El componente BuscarMueble.
 */
function BuscarMueble() {
  const { nombre } = useParams();
  const [muebles, setMuebles] = useState([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [openCarritoModal, setOpenCarritoModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openLoginDialog, setOpenLoginDialog] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const navigate = useNavigate();

  const isEmpresa = useUserStore((state) => state.isEmpresa());
  const user = useUserStore((state) => state.user);
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
    p: { xs: 2, sm: 3 },
    outline: 'none',
    overflow: 'auto'
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
    navigate("/pedidopago");
  };

  const handleCloseLoginDialog = () => {
    setOpenLoginDialog(false);
  };

  const handleGoToLogin = () => {
    setOpenLoginDialog(false);
    navigate("/login");
  };

  const handleAgregarAlCarrito = async (mueble) => {
    try {
      showSnackbar('Verificando disponibilidad...', 'info');

      // Formatear el mueble para el carrito
      const muebleCarrito = {
        id_mueble: mueble.id_mueble,
        id_producto: mueble.id_mueble, // Para compatibilidad
        tipo_producto: 'mueble',
        nombre: mueble.nombre,
        precio: mueble.precio_base,
        precio_base: mueble.precio_base,
        descripcion: mueble.descripcion,
        requiere_montar: mueble.requiere_montar,
        fecha_entrega: mueble.fecha_entrega
      };

      // Verificar stock (esto validará internamente los componentes)
      const stockValido = await validarStock(muebleCarrito);
      if (!stockValido) {
        showSnackbar('No hay suficientes componentes disponibles para este mueble', 'warning');
        return;
      }

      await agregarItem(muebleCarrito);
      showSnackbar(`${mueble.nombre} agregado al carrito`, 'success');
    } catch (error) {
      showSnackbar(error.message || 'Error al agregar al carrito', 'error');
    }
  };

  const handleActualizarCantidad = (id_producto, tipo_producto, nuevaCantidad) => {
    try {
      actualizarCantidad(id_producto, tipo_producto, nuevaCantidad);
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
  };

  /**
   * Maneja la eliminación de un mueble.
   * @param {number} id_mueble - El ID del mueble a eliminar.
   */
  const handleDelete = async (id_mueble) => {
    try {
      const response = await fetch(apiUrl + `/mueble/${id_mueble}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMuebles((prevRows) =>
          prevRows.filter((row) => row.id_mueble !== id_mueble)
        );
        setMessage(
          `Mueble con ID ${id_mueble} eliminado correctamente`
        );
      } else {
        setMessage(`Error al eliminar el mueble con ID ${id_mueble}`);
      }
      handleClickOpen();
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
      setMessage("Error al realizar la solicitud"); // Mensaje de error
      handleClickOpen();
    }
  };

  useEffect(() => {
    const fetchMuebles = async () => {
      try {
        const response = await fetch(
          apiUrl + `/mueble/buscar?nombre=${nombre}`
        );
        const data = await response.json();

        if (response.ok) {
          setMuebles(data); // Actualizar el estado con los resultados de la búsqueda
        } else {
          setMuebles([]); // Limpiar los resultados
        }
      } catch (error) {
        console.error("Error al obtener muebles:", error);
        setMuebles([]); // Limpiar los resultados en caso de error
      }
    };

    fetchMuebles();
  }, [nombre]);

  // Componente Card para vista móvil
  const MuebleCard = ({ mueble }) => (
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
          {mueble.nombre}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            <strong>Precio:</strong> {mueble.precio_base}€
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            <strong>Fecha entrega:</strong> {mueble.fecha_entrega}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 1 }}>
            <BuildIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
            <Chip
              label={mueble.requiere_montar ? "Requiere montaje" : "Sin montaje"}
              size="small"
              color={mueble.requiere_montar ? "warning" : "success"}
              variant="outlined"
            />
          </Box>
          {mueble.id_empresa_empresa?.nombre_empresa && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <BusinessIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {mueble.id_empresa_empresa.nombre_empresa}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: '100%' }}>
          <Button
            size="small"
            startIcon={<InfoIcon />}
            onClick={() => navigate("/" + mueble.id_mueble)}
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
            Ver Detalles
          </Button>

          {!isEmpresa && (
            <Tooltip title={
              tieneProducto(mueble.id_mueble, 'mueble') ? "Ya está en el carrito" : "Agregar al carrito"
            }>
              <span>
                <Button
                  size="small"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={() => handleAgregarAlCarrito(mueble)}
                  variant={tieneProducto(mueble.id_mueble, 'mueble') ? "contained" : "outlined"}
                  sx={{
                    backgroundColor: tieneProducto(mueble.id_mueble, 'mueble') ? "#4caf50" : "transparent",
                    color: tieneProducto(mueble.id_mueble, 'mueble') ? "white" : "#da6429",
                    borderColor: tieneProducto(mueble.id_mueble, 'mueble') ? "#4caf50" : "#da6429",
                    '&:hover': {
                      backgroundColor: tieneProducto(mueble.id_mueble, 'mueble') ? "#45a049" : "rgba(218, 100, 41, 0.04)",
                      borderColor: tieneProducto(mueble.id_mueble, 'mueble') ? "#45a049" : "#c55520",
                    }
                  }}
                >
                  {tieneProducto(mueble.id_mueble, 'mueble') ? "En carrito" : "Agregar"}
                </Button>
              </span>
            </Tooltip>
          )}

          {isEmpresa && (
            <>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => navigate("/modificarmueble/" + mueble.id_mueble)}
                disabled={!(user?.id_empresa === mueble.id_empresa)}
                variant="outlined"
                sx={{
                  color: '#666',
                  borderColor: '#666',
                  '&:hover': {
                    borderColor: '#333',
                    backgroundColor: 'rgba(0,0,0,0.04)'
                  },
                  '&:disabled': {
                    color: '#ccc',
                    borderColor: '#ccc'
                  }
                }}
              >
                Editar
              </Button>
              <Button
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => handleDelete(mueble.id_mueble)}
                disabled={!(user?.id_empresa === mueble.id_empresa)}
                variant="outlined"
                color="error"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(211, 47, 47, 0.04)'
                  },
                  '&:disabled': {
                    color: '#ccc',
                    borderColor: '#ccc'
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
          mb: { xs: 3, sm: 4 },
          color: "#332f2d",
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontWeight: 'bold',
          fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
          px: 1
        }}
      >
        Resultados para &quot;{nombre}&quot;
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
            right: { xs: 16, sm: 20 },
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
            <ShoppingCartIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          </Badge>
        </Fab>
      )}

      {/* Resultados */}
      <Box>
        {isMobile || isTablet ? (
          // Vista de cards para móvil y tablet
          <Box sx={{ px: { xs: 1, sm: 2 } }}>
            {muebles.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No se encontraron muebles
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Intenta con otros términos de búsqueda
                </Typography>
              </Box>
            ) : (
              muebles.map((mueble) => (
                <MuebleCard key={mueble.id_mueble} mueble={mueble} />
              ))
            )}
          </Box>
        ) : (
          // Vista de tabla para desktop
          <TableContainer
            component={Paper}
            sx={{
              my: 2,
              mx: { xs: 1, sm: 2, lg: 4 },
              borderRadius: 2,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead sx={{ backgroundColor: "#e2d0c6" }}>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>NOMBRE</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>PRECIO BASE</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>FECHA ENTREGA</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>MONTAJE</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>EMPRESA</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>DETALLES</TableCell>
                  {!isEmpresa && (
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>AGREGAR AL CARRITO</TableCell>
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
                {muebles.map((row) => (
                  <TableRow
                    key={row.id_mueble}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)'
                      }
                    }}
                  >
                    <TableCell align="center">{row.nombre}</TableCell>
                    <TableCell align="center">{row.precio_base + "€"}</TableCell>
                    <TableCell align="center">{row.fecha_entrega}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.requiere_montar ? "Sí" : "No"}
                        size="small"
                        color={row.requiere_montar ? "warning" : "success"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">{row.id_empresa_empresa?.nombre_empresa}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => navigate("/" + row.id_mueble)}
                        sx={{ color: "#da6429" }}
                      >
                        <InfoIcon />
                      </IconButton>
                    </TableCell>
                    {!isEmpresa && (
                      <TableCell align="center">
                        <Tooltip title={
                          tieneProducto(row.id_mueble, 'mueble') ?
                            "Ya está en el carrito" :
                            "Agregar al carrito"
                        }>
                          <span>
                            <IconButton
                              onClick={() => handleAgregarAlCarrito(row)}
                              sx={{
                                color: tieneProducto(row.id_mueble, 'mueble') ? "#4caf50" : "#da6429",
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
                    )}
                    {isEmpresa && (
                      <>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => handleDelete(row.id_mueble)}
                            disabled={!(user?.id_empresa === row.id_empresa)}
                            sx={{
                              color: "#d32f2f",
                              '&:disabled': {
                                color: '#ccc'
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => navigate("/modificarmueble/" + row.id_mueble)}
                            disabled={!(user?.id_empresa === row.id_empresa)}
                            sx={{
                              color: "#666",
                              '&:disabled': {
                                color: '#ccc'
                              }
                            }}
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
                        Proceder al pago
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
            Para proceder al pago necesitas iniciar sesión
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
    </Container>
  );
}

export default BuscarMueble;