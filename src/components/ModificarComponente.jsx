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
import { apiUrl } from "../config";

// Registrar el idioma español
registerLocale("es", es);

/**
 * Componente para modificar un componente existente.
 * @returns {JSX.Element} El componente de modificación de componente.
 */
function ModificarComponente() {
  const params = useParams();

  const [datos, setDatos] = useState({
    id_componente: params.id_componente,
    nombre: "",
    precio: "",
    fecha_importacion: "",
    en_stock: "",
    material: "",
  });

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function getComponenteById() {
      let response = await fetch(
        apiUrl + "/componentes/" + datos.id_componente
      );

      if (response.ok) {
        let data = await response.json();
        console.log("Datos recibidos de la API:", data);
        setDatos(data.datos);
      } else if (response.status === 404) {
        setMessage(`El componente no se pudo encontrar`);
        handleClickOpen();
      }
    }

    getComponenteById();
  }, [params.id_componente, datos.id_componente, navigate]);

  /**
   * Maneja el envío del formulario.
   * @param {Event} e - El evento de envío del formulario.
   */
  const handleSubmit = async (e) => {
    // No hacemos submit
    e.preventDefault();
    // Enviamos los datos con fetch
    try {
      const response = await fetch(
        apiUrl + "/componentes/" + datos.id_componente,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datos),
        }
      );

      if (response.ok) {
        setMessage(`Componente modificado correctamente`);
        handleClickOpen();
      } else {
        setMessage(`Error al modificar el componente`);
        handleClickOpen();
      }
    } catch (error) {
      console.log("Error", error);
      setMessage("Error al realizar la solicitud");
      handleClickOpen();
    }
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
   * Maneja el cambio de la fecha de importación.
   * @param {Date} date - La nueva fecha de importación.
   */
  const handleDateChange = (date) => {
    setDatos({
      ...datos,
      fecha_importacion: date ? date.toISOString().split("T")[0] : "", // Guardamos en formato yyyy-MM-dd
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

  return (
    <>
      <Typography variant="h4" align="center" sx={{ my: 3, color: "#332f2d" }}>
        Modificar componente
      </Typography>
      <Grid
        container
        spacing={2}
        sx={{ alignItems: "center", justifyContent: "center" }}
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
              label="Precio"
              name="precio"
              type="number"
              value={datos.precio}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
            <DatePicker
              selected={
                datos.fecha_importacion
                  ? new Date(datos.fecha_importacion)
                  : null
              }
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy" // Formato de la fecha
              placeholderText="Fecha de importación:"
              className="border rounded-lg py-2 px-3 w-100"
              calendarClassName="custom-calendar"
              dayClassName={(date) =>
                datos.fecha_importacion === date.toISOString().split("T")[0]
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
              label="¿Se encuentra disponible en stock?"
              name="en_stock"
              onChange={handleSwitchChange} // Actualiza el estado de en_stock
              checked={Boolean(datos.en_stock)}
            />
            <TextField
              id="material"
              label="Material"
              name="material"
              type="text"
              value={datos.material}
              onChange={handleChange}
              sx={{ mt: 2 }}
            />
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

export default ModificarComponente;
