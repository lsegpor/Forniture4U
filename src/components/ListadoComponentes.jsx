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
  Link
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import {
  Document,
  Page,
  Text,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { apiUrl } from "../config";
import useUserStore from "../stores/useUserStore";
import useCarritoStore from "../stores/useCarritoStore";

/**
 * Componente que muestra una lista de todos los componentes.
 * @component
 */
function ListadoComponentes() {
  const [rows, setRows] = useState([]);
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

  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: "Helvetica",
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
    },
    text: {
      fontSize: 14,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      marginBottom: 10,
      fontWeight: "bold",
    },
  });

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

  // Obtener componentes al cargar el componente
  useEffect(() => {
    async function getComponentes() {
      let response = await fetch(apiUrl + "/componentes");

      if (response.ok) {
        let data = await response.json();
        setRows(data.datos);
      }
    }

    getComponentes();
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
   * Elimina un componente por su ID.
   * @param {number} id_componente - ID del componente a eliminar.
   */
  const handleDelete = async (id_componente) => {
    try {
      const response = await fetch(apiUrl + `/componentes/${id_componente}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRows((prevRows) =>
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

  const handleActualizarCantidad = (id_producto, tipo_producto, nuevaCantidad) => {
    try {
      actualizarCantidad(id_producto, tipo_producto, nuevaCantidad);
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
  };

  /**
   * Imprime la ventana actual.
   */
  const printWindow = () => {
    window.print();
  };

  /**
   * Genera un PDF a partir de una imagen de la tabla.
   */
  const printToPDFImage = () => {
    const input = document.getElementById("table-container");
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF();
      const imgWidth = doc.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      doc.save("listado_componentes_imagen.pdf");
    });
  };

  /**
   * Documento PDF para descargar.
   * @returns {JSX.Element} El documento PDF.
   */
  const MyDocument = () => (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Listado de Componentes</Text>
        <Text style={styles.subtitle}>
          Nombre - Precio - Fecha de importación - ¿Está en stock? - Material
        </Text>
        {rows.map((row) => (
          <Text key={row.id_componente} style={styles.text}>
            {row.nombre} - {row.precio}€ - {row.fecha_importacion} -{" "}
            {row.en_stock ? "Sí" : "No"} - {row.material}
          </Text>
        ))}
      </Page>
    </Document>
  );

  return (
    <>
      <Typography variant="h4" align="center" sx={{ m: 4, color: "#332f2d" }}>
        Listado de componentes
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
        <TableContainer component={Paper} sx={{ my: 2 }} id="table-container">
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
              {rows.map((row) => (
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

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mt: 3,
          mb: 4,
        }}
      >
        <Button
          variant="contained"
          sx={{ backgroundColor: "#da6429" }}
          onClick={printWindow}
        >
          Imprimir desde Navegador
        </Button>

        <Button
          variant="contained"
          sx={{ backgroundColor: "#da6429" }}
          onClick={printToPDFImage}
        >
          Imprimir a PDF (Imagen)
        </Button>

        <Button variant="contained" sx={{ backgroundColor: "#da6429" }}>
          <PDFDownloadLink
            document={<MyDocument />}
            fileName="listado_componentes.pdf"
            style={{ textDecoration: "none", color: "white" }}
          >
            {({ loading }) => (loading ? "Generando PDF..." : "Descargar PDF")}
          </PDFDownloadLink>
        </Button>
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

export default ListadoComponentes;
