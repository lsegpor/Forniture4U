import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Box,
  Modal,
  IconButton,
  Fab,
  Badge,
  Tooltip,
  Snackbar,
  Alert,
  Link,
  Divider,
  Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ConstructionIcon from "@mui/icons-material/Construction";
import { apiUrl } from "../config";
import useUserStore from "../stores/useUserStore";
import useCarritoStore from "../stores/useCarritoStore";

/**
 * Componente que muestra una lista de todos los muebles.
 * @component
 */
function ListadoMuebles() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [openCarritoModal, setOpenCarritoModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const isEmpresa = useUserStore((state) => state.isEmpresa());
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const user = useUserStore((state) => state.user);

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
    p: 3,
    outline: 'none',
    overflow: 'auto'
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

  const handleActualizarCantidad = async (id_producto, tipo_producto, nuevaCantidad) => {
    try {
      setLoading(true);
      await actualizarCantidad(id_producto, tipo_producto, nuevaCantidad);
    } catch (error) {
      showSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function getMuebles() {
      let response = await fetch(apiUrl + "/mueble");

      if (response.ok) {
        let data = await response.json();
        setRows(data.datos);
      }
    }

    getMuebles();
  }, []);

  const handleAgregarAlCarrito = async (mueble) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina un mueble por su ID.
   * @param {number} id_mueble - ID del mueble a eliminar.
   */
  const handleDelete = async (id_mueble) => {
    try {
      const response = await fetch(apiUrl + `/mueble/${id_mueble}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRows((prevRows) =>
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
      setMessage("Error al realizar la solicitud");
      handleClickOpen();
    }
  };

  return (
    <>
      <Typography variant="h4" align="center" sx={{ m: 4, color: "#332f2d" }}>
        Listado de muebles
      </Typography>

      {/* Botón flotante del carrito */}
      {!isEmpresa && (
        <>
          <Fab
            color="primary"
            aria-label="carrito"
            onClick={handleOpenCarritoModal}
            sx={{
              position: 'fixed',
              top: 130,
              right: 20,
              backgroundColor: '#da6429',
              '&:hover': {
                backgroundColor: '#c55520'
              },
              zIndex: 1000
            }}
          >
            <Badge badgeContent={getCantidadTotal()} color="error">
              <ShoppingCartIcon />
            </Badge>
          </Fab>
        </>
      )}

      <Box sx={{ mx: 10 }}>
        <TableContainer component={Paper} sx={{ my: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead sx={{ backgroundColor: "#e2d0c6" }}>
              <TableRow>
                <TableCell align="center">NOMBRE</TableCell>
                <TableCell align="center">PRECIO BASE</TableCell>
                <TableCell align="center">FECHA DE ENTREGA</TableCell>
                <TableCell align="center">REQUIERE MONTAR</TableCell>
                <TableCell align="center">EMPRESA</TableCell>
                <TableCell align="center">DETALLES</TableCell>
                {!isEmpresa && (
                  <TableCell align="center">AGREGAR AL CARRITO</TableCell>
                )}
                {isEmpresa && (
                  <>
                    <TableCell align="center">ELIMINAR</TableCell>
                    <TableCell align="center">EDITAR</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id_mueble}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="center">{row.nombre}</TableCell>
                  <TableCell align="center">{row.precio_base + "€"}</TableCell>
                  <TableCell align="center">{row.fecha_entrega}</TableCell>
                  <TableCell align="center">
                    {row.requiere_montar ? "Sí" : "No"}
                  </TableCell>
                  <TableCell align="center">{row.id_empresa_empresa?.nombre_empresa}</TableCell>
                  <TableCell align="center">
                    <Button
                      onClick={() =>
                        navigate("/" + row.id_mueble)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <InfoIcon sx={{ color: "#da6429" }} />
                    </Button>
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
                            disabled={loading}
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
                        <Button
                          onClick={() => handleDelete(row.id_mueble)}
                          disabled={!(user?.id_empresa === row.id_empresa)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <DeleteIcon sx={{ color: "black" }} />
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          onClick={() =>
                            navigate("/modificarmueble/" + row.id_mueble)
                          }
                          disabled={!(user?.id_empresa === row.id_empresa)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <EditIcon sx={{ color: "black" }} />
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

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
                <Typography id="carrito-modal-title" variant="h5" component="h2">
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
                  <Typography variant="h6" color="text.secondary">
                    El carrito está vacío
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Agrega algunos productos para comenzar
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ maxHeight: '400px', overflowY: 'auto', mb: 3 }}>
                    {items.map((item) => (
                      <Paper
                        key={`${item.id_producto}-${item.tipo_producto}`}
                        elevation={1}
                        sx={{ p: 2, mb: 2 }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6">
                              {item.nombre}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Precio unitario: {item.precio}€
                            </Typography>
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
                                disabled={loading}
                              >
                                -
                              </IconButton>
                              <Typography variant="body1" sx={{ minWidth: 30, textAlign: 'center' }}>
                                {item.cantidad}
                              </Typography>
                              <IconButton
                                onClick={() => handleActualizarCantidad(
                                  item.id_producto,
                                  item.tipo_producto,
                                  item.cantidad + 1
                                )}
                                size="small"
                                disabled={loading || (item.stock_disponible && item.cantidad >= item.stock_disponible)}
                              >
                                +
                              </IconButton>
                            </Box>

                            <Typography variant="body1" fontWeight="bold" sx={{ minWidth: 70, textAlign: 'right' }}>
                              {(item.precio * item.cantidad).toFixed(2)}€
                            </Typography>

                            <IconButton
                              onClick={() => eliminarItem(item.id_producto, item.tipo_producto)}
                              color="error"
                              size="small"
                              disabled={loading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Total: {total.toFixed(2)}€
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getCantidadTotal()} {getCantidadTotal() === 1 ? 'artículo' : 'artículos'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={limpiarCarrito}
                        fullWidth
                        disabled={loading}
                      >
                        Vaciar Carrito
                      </Button>
                      <Button
                        variant="contained"
                        sx={{ backgroundColor: '#da6429' }}
                        onClick={handleProcederCheckout}
                        fullWidth
                        disabled={loading}
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
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Dialog de login requerido */}
      <Dialog
        open={openLoginDialog}
        onClose={handleCloseLoginDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{
          textAlign: 'center',
          color: '#da6429',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }}>
          🔐 ¿Tienes cuenta?
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <DialogContentText sx={{ fontSize: '1.1rem', mb: 2 }}>
            Para proceder al checkout necesitas iniciar sesión
          </DialogContentText>
          <DialogContentText sx={{ color: 'text.secondary' }}>
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
          px: 3
        }}>
          <Button
            onClick={handleCloseLoginDialog}
            variant="outlined"
            sx={{
              borderColor: '#da6429',
              color: '#da6429',
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
            sx={{
              backgroundColor: '#da6429',
              '&:hover': { backgroundColor: '#c55520' },
              px: 4
            }}
          >
            Iniciar Sesión
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de estado de eliminación */}
      <Dialog
        open={open}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Estado de eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ListadoMuebles;
