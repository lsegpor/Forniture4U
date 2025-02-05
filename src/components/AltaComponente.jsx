import { Box, TextField, Button, Typography, Stack } from "@mui/material";
import { useState } from "react";
import Grid from "@mui/material/Grid2";
import { useNavigate } from "react-router";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { MDBSwitch } from "mdb-react-ui-kit";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { apiUrl } from '../config';

// Registrar el idioma español
registerLocale("es", es);

function AltaComponente() {
  const [datos, setDatos] = useState({
    nombre: "",
    precio: "",
    fecha_importacion: "",
    en_stock: false,
    material: "",
  });

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    navigate("/");
  };

  const handleSubmit = async (e) => {
    // No hacemos submit
    e.preventDefault();
    // Enviamos los datos con fetch
    try {
      const response = await fetch(apiUrl + "/componentes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      if (response.ok) {
        setMessage(`Componente creado correctamente`);
      } else {
        setMessage(`Error al crear el componente`);
      }
      handleClickOpen();
    } catch (error) {
      console.log("Error", error);
      setMessage("Error al realizar la solicitud");
      handleClickOpen();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Para el Switch, actualizamos con el valor booleano
    if (type === "checkbox") {
      setDatos({
        ...datos,
        [name]: checked, // El estado en_stock será un booleano
      });
    } else {
      setDatos({
        ...datos,
        [name]: value, // Para los demás campos, solo actualizamos el valor
      });
    }
  };

  const handleDateChange = (date) => {
    setDatos({
      ...datos,
      fecha_importacion: date ? date.toISOString().split("T")[0] : "", // Guardamos en formato yyyy-MM-dd
    });
  };

  return (
    <>
      <Typography variant="h4" align="center" sx={{ my: 3, color: "#332f2d" }}>
        Alta de componente
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
              selected={datos.fecha_importacion ? new Date(datos.fecha_importacion) : null}
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
              onChange={(e) => handleChange(e)} // Actualiza el estado de en_stock
              checked={datos.en_stock === "true" || datos.en_stock === true} // Para que sea un booleano
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

export default AltaComponente;
