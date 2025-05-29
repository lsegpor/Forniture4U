import { Box, TextField, Button, Typography, Container, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
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
    cantidad: "",
    material: "",
    descripcion: "",
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

  return (
    <>
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            marginTop: 8,
            marginBottom: 8,
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >

          <Typography variant="h4" align="center" sx={{ my: 3, color: "#332f2d" }}>
            Modificar componente
          </Typography>

          <Box
            component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}
          >
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
              label="Precio"
              name="precio"
              type="number"
              value={datos.precio}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <div style={{ marginTop: "16px", marginBottom: "8px" }}>
              <label style={{ color: "rgba(0, 0, 0, 0.6", fontSize: "0.75rem", marginBottom: "4px", display: "block" }}>Fecha de importación</label>
              <DatePicker
                selected={
                  datos.fecha_importacion
                    ? new Date(datos.fecha_importacion)
                    : null
                }
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy" // Formato de la fecha
                placeholderText="Fecha de importación:"
                className="custom-datepicker"
                style={customDatePickerStyle}
                minDate={new Date()} // Deshabilitar fechas pasadas
                locale="es"
              />
            </div>

            <TextField
              id="cantidad"
              label="Cantidad"
              name="cantidad"
              type="number"
              value={datos.cantidad}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <TextField
              id="material"
              label="Material"
              name="material"
              type="text"
              value={datos.material}
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

            <Button
              variant="contained"
              type="submit"
              fullWidth
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: "#da6429",
                "&:hover": {
                  backgroundColor: "#c55a24"
                }
              }}
            >
              Guardar Componente
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Estilos personalizados para el datepicker */}
      <style>{`
        .custom-datepicker {
          width: 100%;
          padding: 16.5px 14px;
          font-size: 1rem;
          border-radius: 4px;
          border: 1px solid rgba(0, 0, 0, 0.23);
          font-family: "Roboto", "Helvetica", "Arial", sans-serif;
          box-sizing: border-box;
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

export default ModificarComponente;
