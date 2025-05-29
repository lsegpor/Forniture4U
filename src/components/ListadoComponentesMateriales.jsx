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
  Tooltip
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

  const Navigate = useNavigate();

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
    Navigate("/checkout");
  };

  const handleCloseLoginDialog = () => {
    setOpenLoginDialog(false);
  };

  const handleGoToLogin = () => {
    setOpenLoginDialog(false);
    Navigate("/login");
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

  return (
    <>
      <Typography variant="h4" align="center" sx={{ m: 4, color: "#332f2d" }}>
        Listado de componentes por materiales
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

      <Box sx={{ mx: 10 }}>
        <TableContainer component={Paper} sx={{ my: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead sx={{ backgroundColor: "#e2d0c6" }}>
              <TableRow>
                <TableCell align="center">NOMBRE</TableCell>
                <TableCell align="center">PRECIO</TableCell>
                <TableCell align="center">FECHA DE IMPORTACIÓN</TableCell>
                <TableCell align="center">CANTIDAD</TableCell>
                <TableCell align="center">MATERIAL</TableCell>
                <TableCell align="center">DESCRIPCIÓN</TableCell>
                {!isEmpresa && (
                  <>
                    <TableCell align="center">AGREGAR AL CARRITO</TableCell>
                  </>
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
              {componentes.map((row) => (
                <TableRow
                  key={row.id_componente}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="center">{row.nombre}</TableCell>
                  <TableCell align="center">{row.precio + "€"}</TableCell>
                  <TableCell align="center">{row.fecha_importacion}</TableCell>
                  <TableCell align="center">{row.cantidad}</TableCell>
                  <TableCell align="center">{row.material}</TableCell>
                  <TableCell align="center">
                    <Button
                      onClick={() => handleOpenModal(row.descripcion)}
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
                        <Button
                          onClick={() => handleDelete(row.id_componente)}
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
                            Navigate("/modificarcomponente/" + row.id_componente)
                          }
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
              <Typography id="modal-title" variant="h6" component="h2">
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
                  textAlign: 'justify'
                }}
              >
                {modalContent}
              </Typography>
            </Box>
          </Paper>
        </Modal>

        {/* Modal del carrito */}
        {!isEmpresa && (
          <>
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
                      Agrega algunos componentes para comenzar
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
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" gutterBottom>
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
                                  disabled={item.stock_disponible && item.cantidad >= item.stock_disponible}
                                >
                                  +
                                </IconButton>
                              </Box>

                              <Typography variant="body1" fontWeight="bold" sx={{ minWidth: 60 }}>
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
                        </Paper>
                      ))}
                    </Box>

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
                        >
                          Vaciar Carrito
                        </Button>
                        <Button
                          variant="contained"
                          sx={{ backgroundColor: '#da6429' }}
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
          </>
        )}
      </Box>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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

      {/* Diálogo de confirmación de eliminación */}
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

export default ListadoComponentesMateriales;
