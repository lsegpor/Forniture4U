import { Box, TextField, Button, Typography, Container, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { MDBSwitch } from "mdb-react-ui-kit";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import DeleteIcon from "@mui/icons-material/Delete";
import { apiUrl } from "../config";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import useUserStore from "../stores/useUserStore";
import { Navigate } from "react-router-dom";
import defaultImage from "../assets/default.jpeg";

// Registrar el idioma español
registerLocale("es", es);

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

/**
 * Componente para modificar un mueble existente.
 * @returns {JSX.Element} El componente de modificación de mueble.
 */
function ModificarMueble() {
  const params = useParams();

  console.log("ID del mueble a modificar:", params.id_mueble);

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

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [componentes, setComponentes] = useState([]);
  const [componenteSel, setComponenteSel] = useState(null);
  const [componentesEliminados, setComponentesEliminados] = useState([]);

  const [redirect, setRedirect] = useState(false);

  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState('');
  const [imagenExistente, setImagenExistente] = useState('');
  const [imagenEliminada, setImagenEliminada] = useState(false);

  const user = useUserStore((state) => state.user);
  const isEmpresa = useUserStore((state) => state.isEmpresa);

  useEffect(() => {
    if (!isEmpresa) {
      setRedirect(true);
    }

    if (isEmpresa() && user?.id_empresa) {
      setDatos(prev => ({
        ...prev,
        id_empresa: user.id_empresa
      }));
    }

    async function getMuebleById() {
      try {
        let response = await fetch(apiUrl + "/mueble/" + datos.id_mueble);

        if (response.ok) {
          let data = await response.json();
          console.log("Datos recibidos de la API:", data);
          setDatos(data.datos);

          setImagenEliminada(false);

          if (data.datos.imagen) {
            setImagenExistente(data.datos.imagen);
            console.log("Imagen existente:", data.datos.imagen);
          }
        } else if (response.status === 404) {
          setMessage(`El mueble no se pudo encontrar`);
          handleClickOpen();
        }

        let response2 = await fetch(apiUrl + "/componentes");

        if (response2.ok) {
          let data = await response2.json();
          setComponentes(data.datos);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    }

    getMuebleById();
  }, [datos.id_mueble, navigate, user, isEmpresa]);

  useEffect(() => {
    if (imagenExistente && !imagenEliminada) {
      const imagenUrl = `${backendUrl}${imagenExistente}`;
      console.log("Intentando cargar imagen desde:", imagenUrl);

      // Comprobar si la imagen es accesible
      fetch(imagenUrl)
        .then(response => {
          if (!response.ok) {
            console.error("Error al acceder a la imagen:", response.status, response.statusText);
          } else {
            console.log("Imagen accesible correctamente");
          }
        })
        .catch(error => {
          console.error("Error al verificar la imagen:", error);
        });
    }
  }, [imagenExistente, imagenEliminada, backendUrl]);

  if (redirect) {
    return <Navigate to="/" replace />;
  }

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setImagenEliminada(false);

      // Crear una URL para la vista previa de la imagen
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setImagenPreview(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleEliminarImagen = () => {
    // Eliminar imagen seleccionada (si hay)
    setImagen(null);
    setImagenPreview('');

    // Marcar imagen existente como eliminada
    setImagenEliminada(true);
  };

  /**
   * Maneja el cambio de los campos del formulario.
   * @param {Event} e - El evento de cambio del campo.
   */
  const handleChange = (e) => {
    setDatos({
      ...datos,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Maneja el cambio de la fecha de entrega.
   * @param {Date} date - La nueva fecha de entrega.
   */
  const handleDateChange = (date) => {
    setDatos({
      ...datos,
      fecha_entrega: date ? date.toISOString().split("T")[0] : "", // Guardamos en formato yyyy-MM-dd
    });
  };

  /**
   * Maneja el cambio del estado del switch.
   * @param {Event} e - El evento de cambio del switch.
   */
  const handleSwitchChange = (e) => {
    const { name, type, checked, value } = e.target;

    setDatos((prevDatos) => ({
      ...prevDatos,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Abre el diálogo de estado.
   */
  const handleClickOpen = () => {
    setOpen(true);
  };

  /**
   * Cierra el diálogo de estado y navega a la página anterior.
   */
  const handleClose = () => {
    setOpen(false);
    navigate(-1);
  };

  /**
   * Maneja el cambio del componente seleccionado.
   * @param {Event} event - El evento de cambio del componente.
   */
  const handleChangeSel = (event) => {
    setComponenteSel(event.target.value);
  };

  /**
   * Agrega un componente a la lista de componentes seleccionados.
   */
  const agregarComponente = () => {
    // Buscar el componente por su id_componente en lugar de por índice
    const componente = componentes.find(
      (c) => c.id_componente === componenteSel
    );

    if (!componente) return; // Si no encuentra el componente, salir

    // Verificar si el componente ya está en la lista de componentes seleccionados
    setDatos((prevDatos) => {
      const index = prevDatos.id_componente_componentes.findIndex(
        (item) => item.id_componente === componente.id_componente
      );

      let updatedComponentes;
      if (index !== -1) {
        // Si el componente ya existe, incrementamos la cantidad
        updatedComponentes = [...prevDatos.id_componente_componentes];
        updatedComponentes[index] = {
          ...updatedComponentes[index],
          mueble_componentes: {
            ...updatedComponentes[index].mueble_componentes,
            cantidad: updatedComponentes[index].mueble_componentes.cantidad + 1,
          },
        };
      } else {
        // Si no existe, lo agregamos con cantidad 1
        updatedComponentes = [
          ...prevDatos.id_componente_componentes,
          { ...componente, mueble_componentes: { cantidad: 1 } },
        ];
      }

      return {
        ...prevDatos,
        id_componente_componentes: updatedComponentes,
      };
    });
  };

  /**
   * Elimina un componente de la lista de componentes seleccionados.
   * @param {number} id_componente - El ID del componente a eliminar.
   */
  const handleDelete = (id_componente) => {
    setDatos((prevDatos) => {
      const componente = prevDatos.id_componente_componentes.find(
        c => c.id_componente === id_componente
      );

      // Si encontramos el componente y su cantidad llegará a 0
      if (componente && componente.mueble_componentes.cantidad <= 1) {
        // Agregar a la lista de componentes eliminados
        setComponentesEliminados(prev => [
          ...prev,
          { id_componente: componente.id_componente }
        ]);

        // Filtrar este componente de la UI
        return {
          ...prevDatos,
          id_componente_componentes: prevDatos.id_componente_componentes.filter(
            c => c.id_componente !== id_componente
          )
        };
      }

      // Si la cantidad es mayor a 1, solo reducirla
      return {
        ...prevDatos,
        id_componente_componentes: prevDatos.id_componente_componentes.map(c => {
          if (c.id_componente === id_componente) {
            return {
              ...c,
              mueble_componentes: {
                ...c.mueble_componentes,
                cantidad: c.mueble_componentes.cantidad - 1
              }
            };
          }
          return c;
        })
      };
    });
  };

  /**
   * Maneja el envío del formulario.
   * @param {Event} e - El evento de envío del formulario.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!datos.nombre || !datos.precio_base || !datos.fecha_entrega || !datos.id_empresa) {
        setMessage("Por favor, complete todos los campos obligatorios");
        handleClickOpen();
        return;
      }

      // Verificar que el usuario sea una empresa y tenga ID
      if (!isEmpresa || !user || !user.id_empresa) {
        setMessage("Solo empresas pueden crear muebles");
        handleClickOpen();
        return;
      }

      const componentesActuales = datos.id_componente_componentes.map(componente => ({
        id_componente: componente.id_componente,
        cantidad: componente.mueble_componentes.cantidad
      }));

      // Incluir componentes eliminados con cantidad 0
      const componentesEliminados0 = componentesEliminados.map(comp => ({
        id_componente: comp.id_componente,
        cantidad: 0
      }));

      // Combinar ambos arrays para enviar al backend
      const componentesConCantidad = [...componentesActuales, ...componentesEliminados0];

      const formDataToSend = new FormData();
      formDataToSend.append('id_mueble', datos.id_mueble);
      formDataToSend.append('nombre', datos.nombre);
      formDataToSend.append('precio_base', datos.precio_base);
      formDataToSend.append('fecha_entrega', datos.fecha_entrega);
      formDataToSend.append('requiere_montar', datos.requiere_montar);
      formDataToSend.append('id_empresa', user.id_empresa);
      formDataToSend.append('descripcion', datos.descripcion);
      formDataToSend.append('componentes', JSON.stringify(componentesConCantidad));

      if (imagen) {
        formDataToSend.append('imagen', imagen);
      }

      if (imagenEliminada && !imagen) {
        formDataToSend.append('imagen_null', 'true');
      }

      console.log("Datos enviados:", {
        id_mueble: datos.id_mueble,
        nombre: datos.nombre,
        precio_base: datos.precio_base,
        fecha_entrega: datos.fecha_entrega,
        requiere_montar: datos.requiere_montar,
        id_empresa: user.id_empresa,
        descripcion: datos.descripcion,
        componentes: componentesConCantidad
      });

      const response = await axios.put(apiUrl + "/mueble/" + datos.id_mueble, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.ok) {
        setMessage("Mueble actualizado correctamente");
      } else {
        setMessage("Error al actualizar el mueble");
      }
      handleClickOpen();
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setMessage("Error al realizar la solicitud");
      handleClickOpen();
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

  if (!isEmpresa()) {
    return <Typography variant="h6">Esta funcionalidad solo está disponible para empresas</Typography>;
  }

  return (
    <>
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            marginTop: 8,
            marginBottom: 8,
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >

          <Typography variant="h4" align="center" sx={{ my: 3, color: "#332f2d" }}>
            Modificar mueble
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: "100%" }}>
            <TextField
              id="nombre"
              label="Nombre"
              name="nombre"
              type="text"
              value={datos.nombre}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <TextField
              id="precio"
              label="Precio base"
              name="precio_base"
              type="number"
              value={datos.precio_base}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <TextField
              id="descripcion"
              label="Descripción"
              name="descripcion"
              type="text"
              value={datos.descripcion}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              margin="normal"
            />

            <div style={{ marginTop: '16px', marginBottom: '8px' }}>
              <label style={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>
                Fecha de entrega
              </label>
              <DatePicker
                selected={
                  datos.fecha_entrega ? new Date(datos.fecha_entrega) : null
                }
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy" // Formato de la fecha
                placeholderText="Fecha de entrega:"
                className="custom-datepicker"
                style={customDatePickerStyle}
                locale="es"
                minDate={new Date()} // Deshabilitar fechas pasadas
              />
            </div>

            <Box sx={{ my: 2 }}>
              <MDBSwitch
                id="flexSwitchCheckDefault"
                label="¿El mueble requiere de montaje?"
                name="requiere_montar"
                onChange={handleSwitchChange} // Actualiza el estado de en_stock
                checked={
                  datos.requiere_montar === "true" ||
                  datos.requiere_montar === true
                } // Para que sea un booleano
              />
            </Box>

            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: "#da6429",
                '&:hover': {
                  backgroundColor: "#c55a24",
                }
              }}
            >
              Seleccionar Imagen (opcional)
              <VisuallyHiddenInput type="file" accept="image/*" onChange={handleImagenChange} />
            </Button>

            {imagenPreview ? (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Vista previa:
                </Typography>
                <img
                  src={imagenPreview}
                  alt="Vista previa"
                  style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                />
              </Box>
            ) : !imagenEliminada && imagenExistente ? (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Imagen actual:
                </Typography>
                <img
                  src={`${backendUrl}${imagenExistente}`}
                  alt="Imagen actual"
                  style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                  onError={(e) => {
                    console.error("Error al cargar la imagen:", e);
                    e.target.src = defaultImage; // Cargar imagen por defecto si falla
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Si no seleccionas una imagen, se usará una predeterminada.
                </Typography>
                <img
                  src={defaultImage}
                  alt="Imagen actual"
                  style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain" }}
                  onError={(e) => {
                    console.error("Error al cargar la imagen:", e);
                  }}
                />
              </Box>
            )}

            {(imagenPreview || (!imagenEliminada && imagenExistente)) && (
              <Button
                variant="contained"
                onClick={handleEliminarImagen}
                sx={{
                  mt: 2,
                  mb: 3,
                  backgroundColor: "#da6429",
                  '&:hover': {
                    backgroundColor: "#c55a24",
                  }
                }}
              >
                Eliminar imagen
              </Button>
            )}

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, color: "#332f2d" }}>
                Componentes del mueble
              </Typography>

              <FormControl fullWidth>
                <InputLabel id="lblComponentes">Seleccionar componente</InputLabel>
                <Select
                  labelId="lblComponentes"
                  id="lstComponentes"
                  value={componenteSel}
                  label="Componente a seleccionar"
                  onChange={handleChangeSel}
                >
                  <MenuItem value="">- Seleccione un componente -</MenuItem>
                  {componentes.map((componente) => (
                    <MenuItem
                      key={componente.id_componente}
                      value={componente.id_componente}
                    >
                      {componente.nombre} - {componente.precio} €
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#da6429" }}
                  onClick={() => agregarComponente()}
                  disabled={!componenteSel} // Deshabilitar si no hay componente seleccionado
                >
                  Agregar componente
                </Button>
              </Box>

              {datos.id_componente_componentes.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table aria-label="simple table">
                    <TableHead sx={{ backgroundColor: "#e2d0c6" }}>
                      <TableRow>
                        <TableCell align="center">NOMBRE</TableCell>
                        <TableCell align="center">PRECIO</TableCell>
                        <TableCell align="center">CANTIDAD</TableCell>
                        <TableCell align="center">ELIMINAR</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {datos.id_componente_componentes
                        .filter((row) => row.mueble_componentes.cantidad > 0)
                        .map((row) => (
                          <TableRow
                            key={row.id_componente}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell align="center">{row.nombre}</TableCell>
                            <TableCell align="center">
                              {row.precio + " €"}
                            </TableCell>
                            <TableCell align="center">
                              {row.mueble_componentes.cantidad}
                            </TableCell>
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
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}>
                  No hay componentes seleccionados.
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              sx={{ mt: 3, mb: 2, backgroundColor: "#da6429", "&:hover": { backgroundColor: "#c55a24", } }}
              type="submit"
              fullWidth
            >
              Guardar mueble
            </Button>
          </Box>
        </Paper>
      </Container>

      <style>{`
        .custom-datepicker {
          width: 100%;
          padding: 16.5px 14px;
          font-size: 1rem;
          border-radius: 4px;
          border: 1px solid rgba(0, 0, 0, 0.23);
          font-family: "Roboto", "Helvetica", "Arial", sans-serif;
          box-sizing: border-box;
          margin-bottom: 10px;
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
          <Button onClick={handleClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ModificarMueble;
