import { Box, TextField, Button, Typography, Stack } from "@mui/material";
import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid2";
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
import Paper from "@mui/material/Paper";
import DeleteIcon from "@mui/icons-material/Delete";
import { apiUrl } from "../config";

// Registrar el idioma español
registerLocale("es", es);

function ModificarMueble() {
  const params = useParams();

  console.log("ID del mueble a modificar:", params.id_mueble);

  const [datos, setDatos] = useState({
    id_mueble: params.id_mueble,
    nombre: "",
    precio_base: "",
    fecha_entrega: "",
    requiere_montar: false,
    id_componente_componentes: [],
  });

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [componentes, setComponentes] = useState([]);
  const [componenteSel, setComponenteSel] = useState(null);

  useEffect(() => {
    async function getMuebleById() {
      try {
        let response = await fetch(apiUrl + "/mueble/" + datos.id_mueble);

        if (response.ok) {
          let data = await response.json();
          console.log("Datos recibidos de la API:", data);
          setDatos(data.datos);
        } else if (response.status === 404) {
          setMessage(`El mueble no se pudo encontrar`);
          handleClickOpen();
        }

        let response2 = await fetch("http://localhost:3000/api/componentes");

        if (response2.ok) {
          let data = await response2.json();
          setComponentes(data.datos);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    }

    getMuebleById();
  }, [datos.id_mueble, navigate]);

  const handleChange = (e) => {
    setDatos({
      ...datos,
      [e.target.name]: e.target.value,
    });
  };

  const handleDateChange = (date) => {
    setDatos({
      ...datos,
      fecha_entrega: date ? date.toISOString().split("T")[0] : "", // Guardamos en formato yyyy-MM-dd
    });
  };

  const handleSwitchChange = (e) => {
    const { name, type, checked, value } = e.target;

    setDatos((prevDatos) => ({
      ...prevDatos,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    navigate(-1);
  };

  const handleChangeSel = (event) => {
    setComponenteSel(event.target.value);
  };

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
          muebleComponentes: {
            ...updatedComponentes[index].muebleComponentes,
            cantidad: updatedComponentes[index].muebleComponentes.cantidad + 1,
          },
        };
      } else {
        // Si no existe, lo agregamos con cantidad 1
        updatedComponentes = [
          ...prevDatos.id_componente_componentes,
          { ...componente, muebleComponentes: { cantidad: 1 } },
        ];
      }

      return {
        ...prevDatos,
        id_componente_componentes: updatedComponentes,
      };
    });
  };

  const handleDelete = (id_componente) => {
    setDatos((prevDatos) => {
      const updatedComponentes = prevDatos.id_componente_componentes
        .map((componente) => {
          if (componente.id_componente === id_componente) {
            return {
              ...componente,
              muebleComponentes: {
                ...componente.muebleComponentes,
                cantidad: componente.muebleComponentes.cantidad - 1,
              },
            };
          }
          return componente;
        })
        .filter(Boolean); // Filtramos los `null` (componentes eliminados)

      return {
        ...prevDatos,
        id_componente_componentes: updatedComponentes,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Asegurar que cada componente tiene una cantidad válida
    const componentesConCantidad = datos.id_componente_componentes.map(
      (componente) => ({
        ...componente,
        cantidad: componente.muebleComponentes.cantidad, // Si no tiene cantidad, poner 1
      })
    );

    try {
      const response = await fetch(apiUrl + "/mueble/" + datos.id_mueble, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mueble: {
            id_mueble: datos.id_mueble,
            nombre: datos.nombre,
            precio_base: datos.precio_base,
            fecha_entrega: datos.fecha_entrega,
            requiere_montar: datos.requiere_montar,
          },
          componentes: componentesConCantidad,
        }),
      });

      if (response.ok) {
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

  return (
    <>
      <Typography variant="h4" align="center" sx={{ my: 3, color: "#332f2d" }}>
        Modificar mueble
      </Typography>
      <Grid
        container
        spacing={2}
        sx={{ alignItems: "center", justifyContent: "center", mb: 4 }}
      >
        <Grid size={{ lg: 4 }}>
          <Stack
            component="form"
            spacing={2}
            onSubmit={handleSubmit}
            sx={{ mx: 2 }}
          >
            <TextField
              id="nombre"
              label="Nombre"
              name="nombre"
              type="text"
              value={datos.nombre}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <TextField
              id="precio"
              label="Precio base"
              name="precio_base"
              type="number"
              value={datos.precio_base}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <DatePicker
              selected={
                datos.fecha_entrega ? new Date(datos.fecha_entrega) : null
              }
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy" // Formato de la fecha
              placeholderText="Fecha de entrega:"
              className="border rounded-lg py-2 px-3 w-100"
              calendarClassName="custom-calendar"
              dayClassName={(date) =>
                datos.fecha_entrega === date.toISOString().split("T")[0]
                  ? "selected-day"
                  : "day"
              }
              locale="es"
            />
            <style>{`
              .selected-day {
                background-color: #da6429 !important;
                color: white !important;
              }
              .day:hover {
                background-color: #f0814f !important;
                color: white !important;
              }
            `}</style>
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
            <Box sx={{ maxWidth: 500 }}>
              <FormControl fullWidth>
                <InputLabel id="lblComponentes">Componentes</InputLabel>
                <Select
                  labelId="lblComponentes"
                  id="lstComponentes"
                  value={componenteSel}
                  label="Componente a seleccionar"
                  onChange={handleChangeSel}
                >
                  {componentes.map((componente) => (
                    <MenuItem
                      key={componente.id_componente}
                      value={componente.id_componente}
                    >
                      {componente.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#da6429" }}
                  onClick={() => agregarComponente()}
                >
                  Agregar componente
                </Button>
              </Box>
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
                    .filter((row) => row.muebleComponentes.cantidad > 0)
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
                          {row.muebleComponentes.cantidad}
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
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                sx={{ mt: 2, backgroundColor: "#da6429" }}
                type="submit"
              >
                Aceptar
              </Button>
            </Box>
          </Stack>
        </Grid>
      </Grid>
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
