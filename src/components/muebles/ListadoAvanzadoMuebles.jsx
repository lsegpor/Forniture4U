import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
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
  Paper,
  Container,
  Card,
  CardContent,
  CardActions,
  Chip,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Pagination
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import BuildIcon from "@mui/icons-material/Build";
import BusinessIcon from "@mui/icons-material/Business";
import SortIcon from "@mui/icons-material/Sort";
import FilterListIcon from "@mui/icons-material/FilterList";
import { apiUrl } from "../../config";
import useUserStore from "../../stores/useUserStore";
import useCarritoStore from "../../stores/useCarritoStore";

/**
 * Componente que muestra una lista de todos los muebles usando DataGrid.
 * @component
 */
function ListadoAvanzadoMuebles() {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [openCarritoModal, setOpenCarritoModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados para funcionalidades móviles
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("nombre");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterMontaje, setFilterMontaje] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

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
    p: { xs: 2, sm: 3 },
    outline: 'none',
    overflow: 'auto'
  };

  // Definición de columnas para DataGrid
  const getColumns = () => {
    const baseColumns = [
      {
        field: 'nombre',
        headerName: 'NOMBRE',
        flex: 1.5,
        minWidth: 150,
        headerAlign: 'center',
        align: 'center',
        resizable: true,
      },
      {
        field: 'precio_base',
        headerName: 'PRECIO BASE',
        flex: 1,
        minWidth: 120,
        headerAlign: 'center',
        align: 'center',
        resizable: true,
        valueFormatter: (value) => `${value}€`,
      },
      {
        field: 'fecha_entrega',
        headerName: 'FECHA ENTREGA',
        flex: 1.2,
        minWidth: 130,
        headerAlign: 'center',
        align: 'center',
        resizable: true,
      },
      {
        field: 'requiere_montar',
        headerName: 'MONTAJE',
        flex: 1,
        minWidth: 100,
        headerAlign: 'center',
        align: 'center',
        resizable: true,
        renderCell: (params) => (
          <Chip
            label={params.value ? "Sí" : "No"}
            size="small"
            color={params.value ? "warning" : "success"}
            variant="outlined"
          />
        ),
      },
      {
        field: 'empresa',
        headerName: 'EMPRESA',
        flex: 1.3,
        minWidth: 130,
        headerAlign: 'center',
        align: 'center',
        resizable: true,
        valueGetter: (value, row) => row.id_empresa_empresa?.nombre_empresa || '',
      },
      {
        field: 'detalles',
        headerName: 'DETALLES',
        flex: 0.8,
        minWidth: 100,
        headerAlign: 'center',
        align: 'center',
        sortable: false,
        resizable: false,
        renderCell: (params) => (
          <Tooltip title="Ver detalles del mueble">
            <IconButton
              onClick={() => navigate("/" + params.row.id_mueble)}
              sx={{
                color: "#da6429",
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: "#c55520",
                  backgroundColor: 'rgba(218, 100, 41, 0.1)',
                  transform: 'scale(1.1)',
                }
              }}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
        ),
      },
    ];

    // Agregar columnas específicas según el tipo de usuario
    if (!isEmpresa) {
      baseColumns.push({
        field: 'carrito',
        headerName: 'CARRITO',
        flex: 1,
        minWidth: 100,
        headerAlign: 'center',
        align: 'center',
        sortable: false,
        resizable: false,
        renderCell: (params) => (
          <Tooltip title={
            tieneProducto(params.row.id_mueble, 'mueble') ?
              "Ya está en el carrito" :
              "Agregar al carrito"
          }>
            <span>
              <IconButton
                onClick={() => handleAgregarAlCarrito(params.row)}
                sx={{
                  color: tieneProducto(params.row.id_mueble, 'mueble') ? "#4caf50" : "#da6429",
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: tieneProducto(params.row.id_mueble, 'mueble')
                      ? 'rgba(76, 175, 80, 0.1)'
                      : 'rgba(218, 100, 41, 0.1)',
                    transform: 'scale(1.1)',
                  },
                  '&:disabled': {
                    color: '#ccc'
                  }
                }}
              >
                <AddShoppingCartIcon />
              </IconButton>
            </span>
          </Tooltip>
        ),
      });
    } else {
      baseColumns.push(
        {
          field: 'eliminar',
          headerName: 'ELIMINAR',
          flex: 0.8,
          minWidth: 100,
          headerAlign: 'center',
          align: 'center',
          sortable: false,
          resizable: false,
          renderCell: (params) => (
            <Tooltip title="Eliminar mueble">
              <span>
                <IconButton
                  onClick={() => handleDelete(params.row.id_mueble)}
                  disabled={!(user?.id_empresa === params.row.id_empresa)}
                  sx={{
                    color: "#d32f2f",
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: "#b71c1c",
                      backgroundColor: 'rgba(211, 47, 47, 0.1)',
                      transform: 'scale(1.1)',
                    },
                    '&:disabled': {
                      color: '#ccc',
                      cursor: 'not-allowed'
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </span>
            </Tooltip>
          ),
        },
        {
          field: 'editar',
          headerName: 'EDITAR',
          flex: 0.8,
          minWidth: 100,
          headerAlign: 'center',
          align: 'center',
          sortable: false,
          resizable: false,
          renderCell: (params) => (
            <Tooltip title="Editar mueble">
              <span>
                <IconButton
                  onClick={() => navigate("/modificarmueble/" + params.row.id_mueble)}
                  disabled={!(user?.id_empresa === params.row.id_empresa)}
                  sx={{
                    color: "#1976d2",
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: "#1565c0",
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      transform: 'scale(1.1)',
                    },
                    '&:disabled': {
                      color: '#ccc',
                      cursor: 'not-allowed'
                    }
                  }}
                >
                  <EditIcon />
                </IconButton>
              </span>
            </Tooltip>
          ),
        }
      );
    }

    return baseColumns;
  };

  // Aplicar filtros cuando cambien los criterios
  useEffect(() => {
    const applyFiltersAndSort = () => {
      let filtered = [...rows];

      // Aplicar filtro de búsqueda
      if (searchText) {
        filtered = filtered.filter(mueble =>
          mueble.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
          (mueble.id_empresa_empresa?.nombre_empresa || '').toLowerCase().includes(searchText.toLowerCase())
        );
      }

      // Aplicar filtro de montaje
      if (filterMontaje !== "todos") {
        filtered = filtered.filter(mueble => {
          if (filterMontaje === "si") return mueble.requiere_montar;
          if (filterMontaje === "no") return !mueble.requiere_montar;
          return true;
        });
      }

      // Aplicar ordenamiento
      filtered.sort((a, b) => {
        let aVal, bVal;

        switch (sortBy) {
          case "nombre":
            aVal = a.nombre.toLowerCase();
            bVal = b.nombre.toLowerCase();
            break;
          case "precio":
            aVal = parseFloat(a.precio_base);
            bVal = parseFloat(b.precio_base);
            break;
          case "fecha":
            aVal = new Date(a.fecha_entrega);
            bVal = new Date(b.fecha_entrega);
            break;
          case "empresa":
            aVal = (a.id_empresa_empresa?.nombre_empresa || '').toLowerCase();
            bVal = (b.id_empresa_empresa?.nombre_empresa || '').toLowerCase();
            break;
          default:
            aVal = a.nombre.toLowerCase();
            bVal = b.nombre.toLowerCase();
        }

        if (sortOrder === "asc") {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      });

      setFilteredRows(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    };
    applyFiltersAndSort();
  }, [rows, searchText, sortBy, sortOrder, filterMontaje]);

  // Calcular datos de paginación
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + itemsPerPage);
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
      await actualizarCantidad(id_producto, tipo_producto, nuevaCantidad);
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
  };

  useEffect(() => {
    async function getMuebles() {
      setLoading(true);
      try {
        let response = await fetch(apiUrl + "/mueble");

        if (response.ok) {
          let data = await response.json();
          // Asegurar que cada fila tenga un id único para DataGrid
          const mueblesConId = data.datos.map(mueble => ({
            ...mueble,
            id: mueble.id_mueble // DataGrid requiere un campo 'id'
          }));
          setRows(mueblesConId);
        }
      } catch (error) {
        console.error("Error al cargar muebles:", error);
        showSnackbar("Error al cargar los muebles", "error");
      } finally {
        setLoading(false);
      }
    }

    getMuebles();
  }, []);

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
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 3 } }}>
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
        Listado avanzado de muebles
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
              xs: 'calc(70px + 1rem)', // 70px altura navbar móvil + margen
              sm: 'calc(70px + 1rem)',
              md: 'calc(80px + 1rem)', // 80px altura navbar desktop + margen
              lg: 'calc(80px + 1rem)'
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

      {/* Contenido principal */}
      <Box>
        {isMobile || isTablet ? (
          // Vista de cards para móvil y tablet con controles
          <Box sx={{ px: { xs: 1, sm: 2 } }}>
            {/* Controles de búsqueda y filtrado */}
            <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>

              {/* Controles de ordenamiento y filtrado */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Ordenar por</InputLabel>
                    <Select
                      value={sortBy}
                      label="Ordenar por"
                      onChange={(e) => setSortBy(e.target.value)}
                      startAdornment={<SortIcon sx={{ mr: 1, color: '#da6429' }} />}
                    >
                      <MenuItem value="nombre">Nombre</MenuItem>
                      <MenuItem value="precio">Precio</MenuItem>
                      <MenuItem value="fecha">Fecha de entrega</MenuItem>
                      <MenuItem value="empresa">Empresa</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Orden</InputLabel>
                    <Select
                      value={sortOrder}
                      label="Orden"
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <MenuItem value="asc">Ascendente</MenuItem>
                      <MenuItem value="desc">Descendente</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Montaje</InputLabel>
                    <Select
                      value={filterMontaje}
                      label="Montaje"
                      onChange={(e) => setFilterMontaje(e.target.value)}
                      startAdornment={<FilterListIcon sx={{ mr: 1, color: '#da6429' }} />}
                    >
                      <MenuItem value="todos">Todos</MenuItem>
                      <MenuItem value="si">Requiere montaje</MenuItem>
                      <MenuItem value="no">Sin montaje</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Información de resultados */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {filteredRows.length} mueble{filteredRows.length !== 1 ? 's' : ''} encontrado{filteredRows.length !== 1 ? 's' : ''}
                </Typography>
                {(searchText || filterMontaje !== "todos") && (
                  <Button
                    size="small"
                    onClick={() => {
                      setSearchText("");
                      setFilterMontaje("todos");
                      setSortBy("nombre");
                      setSortOrder("asc");
                    }}
                    sx={{ color: '#da6429' }}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </Box>
            </Paper>

            {/* Lista de muebles */}
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  Cargando muebles...
                </Typography>
              </Box>
            ) : filteredRows.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  {searchText || filterMontaje !== "todos"
                    ? "No se encontraron muebles con los filtros aplicados"
                    : "No hay muebles disponibles"
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {searchText || filterMontaje !== "todos"
                    ? "Intenta modificar los criterios de búsqueda"
                    : "Vuelve más tarde para ver nuevos productos"
                  }
                </Typography>
              </Box>
            ) : (
              <>
                {paginatedRows.map((mueble) => (
                  <MuebleCard key={mueble.id_mueble} mueble={mueble} />
                ))}

                {/* Paginación */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(event, value) => setCurrentPage(value)}
                      color="primary"
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        '& .MuiPaginationItem-root': {
                          '&.Mui-selected': {
                            backgroundColor: '#da6429',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#c55520',
                            },
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(218, 100, 41, 0.1)',
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        ) : (
          // Vista de DataGrid para desktop
          <Paper
            elevation={3}
            sx={{
              height: { md: 600, lg: 650 },
              width: '100%',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(218, 100, 41, 0.1)',
            }}
          >
            <DataGrid
              rows={rows}
              columns={getColumns()}
              loading={loading}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              pageSizeOptions={[5, 10, 15]}
              disableRowSelectionOnClick
              disableColumnMenu={false}
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#e2d0c6 !important',
                  color: '#000000',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  borderBottom: '2px solid #d4c4b8',
                  '& .MuiDataGrid-columnHeader': {
                    backgroundColor: '#e2d0c6 !important',
                    color: '#000000',
                    '&:focus, &:focus-within': {
                      outline: 'none',
                    },
                  },
                  '& .MuiDataGrid-columnSeparator': {
                    color: '#000000',
                    opacity: 0.5,
                  },
                  '& .MuiDataGrid-iconButtonContainer': {
                    color: '#000000',
                  },
                  '& .MuiDataGrid-sortIcon': {
                    color: '#000000',
                  },
                  '& .MuiDataGrid-menuIcon': {
                    color: '#000000',
                  },
                },
                '& .MuiDataGrid-row': {
                  transition: 'all 0.2s ease',
                  minHeight: '60px !important',
                  '& .MuiDataGrid-cell': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: 'none',
                  },
                  '&:hover': {
                    backgroundColor: '#fff3e0',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(218, 100, 41, 0.1)',
                  },
                  '&:nth-of-type(even)': {
                    backgroundColor: '#fafafa',
                  },
                  '&:nth-of-type(even):hover': {
                    backgroundColor: '#fff3e0',
                  },
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: 'none',
                  fontSize: '0.9rem',
                  padding: '16px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:focus, &:focus-within': {
                    outline: 'none',
                  },
                },
                '& .MuiDataGrid-footerContainer': {
                  backgroundColor: '#f5f5f5',
                  borderTop: '2px solid #e0e0e0',
                  '& .MuiTablePagination-root': {
                    color: '#333',
                  },
                  '& .MuiTablePagination-selectIcon': {
                    color: '#da6429',
                  },
                  '& .MuiIconButton-root': {
                    color: '#da6429',
                    '&:hover': {
                      backgroundColor: 'rgba(218, 100, 41, 0.1)',
                    },
                    '&.Mui-disabled': {
                      color: '#ccc',
                    },
                  },
                },
                '& .MuiDataGrid-selectedRowCount': {
                  color: '#da6429',
                  fontWeight: 'bold',
                },
                // Estilos para el indicador de carga
                '& .MuiDataGrid-loadingOverlay': {
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(2px)',
                },
                '& .MuiCircularProgress-root': {
                  color: '#da6429',
                },
                // Estilos para columnas redimensionables
                '& .MuiDataGrid-columnSeparator--resizable': {
                  cursor: 'col-resize',
                  '&:hover': {
                    color: '#da6429',
                    opacity: 1,
                  },
                },
              }}
              localeText={{
                // Personalización de textos en español
                noRowsLabel: 'No hay muebles disponibles',
                noResultsOverlayLabel: 'No se encontraron resultados',
                errorOverlayDefaultLabel: 'Ocurrió un error',

                // Toolbar
                toolbarDensity: 'Densidad',
                toolbarDensityLabel: 'Densidad',
                toolbarDensityCompact: 'Compacta',
                toolbarDensityStandard: 'Estándar',
                toolbarDensityComfortable: 'Cómoda',

                // Columns panel
                columnsPanelTextFieldLabel: 'Buscar columna',
                columnsPanelTextFieldPlaceholder: 'Título de columna',
                columnsPanelDragIconLabel: 'Reordenar columna',
                columnsPanelShowAllButton: 'Mostrar todo',
                columnsPanelHideAllButton: 'Ocultar todo',

                // Filter panel
                filterPanelAddFilter: 'Agregar filtro',
                filterPanelDeleteIconLabel: 'Eliminar',
                filterPanelLinkOperator: 'Operador lógico',
                filterPanelOperators: 'Operador',
                filterPanelOperatorAnd: 'Y',
                filterPanelOperatorOr: 'O',
                filterPanelColumns: 'Columnas',
                filterPanelInputLabel: 'Valor',
                filterPanelInputPlaceholder: 'Valor del filtro',

                // Footer
                footerRowSelected: (count) =>
                  count !== 1
                    ? `${count.toLocaleString()} filas seleccionadas`
                    : `${count.toLocaleString()} fila seleccionada`,
                footerTotalRows: 'Total de filas:',
                footerTotalVisibleRows: (visibleCount, totalCount) =>
                  `${visibleCount.toLocaleString()} de ${totalCount.toLocaleString()}`,

                // Pagination
                MuiTablePagination: {
                  labelRowsPerPage: 'Filas por página:',
                  labelDisplayedRows: ({ from, to, count }) =>
                    `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`,
                },
              }}
            />
          </Paper>
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
                          alignItems: { xs: 'stretch', sm: 'flex-start' },
                          gap: { xs: 2, sm: 0 }
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="h6"
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
                                minWidth: { xs: 60, sm: 70 },
                                textAlign: 'right',
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

                  <Divider sx={{ my: 2 }} />

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
                          '&:hover': { backgroundColor: '#c55520' }
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
        autoHideDuration={4000}
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
          variant="filled"
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

      {/* Diálogo de estado de eliminación */}
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

export default ListadoAvanzadoMuebles;