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
import { apiUrl } from "../../config";
import useUserStore from "../../stores/useUserStore";

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

  const isEmpresa = useUserStore((state) => state.isEmpresa);

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

  if (!isEmpresa()) {
    return (
      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            mt: 4,
            px: 2
          }}
        >
          Esta funcionalidad solo está disponible para empresas
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          px: { xs: 1, sm: 2, md: 3 }, // Padding responsive
          py: { xs: 1, sm: 2 }
        }}
      >
        <Paper
          elevation={3}
          sx={{
            marginTop: { xs: 2, sm: 4, md: 8 }, // Margen superior responsive
            marginBottom: { xs: 2, sm: 4, md: 8 },
            padding: { xs: 2, sm: 3, md: 4 }, // Padding responsive
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: { xs: 'auto', sm: 'auto' },
            width: '100%',
            maxWidth: '100%'
          }}
        >

          <Typography
            variant="h4"
            align="center"
            sx={{
              m: { xs: 2, sm: 3, md: 4 }, // Margen responsive
              color: "#332f2d",
              fontFamily: '"Georgia", "Times New Roman", serif',
              fontWeight: 'bold',
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }, // Tamaño de fuente responsive
              lineHeight: 1.2,
              px: 1 // Padding horizontal para evitar overflow
            }}
          >
            Modificar componente
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              width: '100%',
              maxWidth: '100%'
            }}
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
              size="medium"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }
              }}
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
              size="medium"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }
              }}
            />

            <Box sx={{ marginTop: 2, marginBottom: 1 }}>
              <Typography
                component="label"
                sx={{
                  color: 'rgba(0, 0, 0, 0.6)',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  marginBottom: 1,
                  display: 'block'
                }}
              >
                Fecha de importación
              </Typography>
              <DatePicker
                selected={datos.fecha_importacion ? new Date(datos.fecha_importacion) : null}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecciona una fecha"
                locale="es"
                className="custom-datepicker"
                minDate={new Date()} // Deshabilitar fechas pasadas
                popperProps={{
                  strategy: "fixed",
                  modifiers: [
                    {
                      name: "preventOverflow",
                      options: {
                        boundary: "viewport",
                      },
                    },
                  ],
                }}
              />
            </Box>

            <TextField
              id="cantidad"
              label="Cantidad"
              name="cantidad"
              type="number"
              value={datos.cantidad}
              onChange={handleChange}
              fullWidth
              margin="normal"
              size="medium"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }
              }}
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
              size="medium"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }
              }}
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
              size="medium"
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }
              }}
            />

            <Button
              variant="contained"
              type="submit"
              fullWidth
              sx={{
                mt: { xs: 2, sm: 3 },
                mb: 2,
                backgroundColor: "#da6429",
                height: { xs: '48px', sm: '56px' }, // Altura responsive del botón
                fontSize: { xs: '0.9rem', sm: '1rem' },
                '&:hover': {
                  backgroundColor: "#c55a24",
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
          padding: 12px 14px;
          font-size: 0.9rem;
          border-radius: 4px;
          border: 1px solid rgba(0, 0, 0, 0.23);
          font-family: "Roboto", "Helvetica", "Arial", sans-serif;
          box-sizing: border-box;
          min-height: 48px;
        }
        
        @media (min-width: 600px) {
          .custom-datepicker {
            padding: 16.5px 14px;
            font-size: 1rem;
            min-height: 56px;
          }
        }
        
        .react-datepicker-wrapper {
          width: 100%;
          display: block;
        }
        
        .react-datepicker__input-container {
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
        
        /* Responsive datepicker */
        .react-datepicker {
          font-size: 0.9rem !important;
        }
        
        @media (min-width: 600px) {
          .react-datepicker {
            font-size: 1rem !important;
          }
        }
        
        .react-datepicker__header {
          padding-top: 8px !important;
        }
        
        @media (min-width: 600px) {
          .react-datepicker__header {
            padding-top: 10px !important;
          }
        }
        
        .react-datepicker__month {
          margin: 0.3rem !important;
        }
        
        @media (min-width: 600px) {
          .react-datepicker__month {
            margin: 0.4rem !important;
          }
        }
        
        .react-datepicker__day-name, .react-datepicker__day {
          width: 1.8rem !important;
          line-height: 1.8rem !important;
          margin: 0.1rem !important;
          font-size: 0.8rem !important;
        }
        
        @media (min-width: 600px) {
          .react-datepicker__day-name, .react-datepicker__day {
            width: 2rem !important;
            line-height: 2rem !important;
            margin: 0.2rem !important;
            font-size: 0.9rem !important;
          }
        }
        
        /* Mejorar la visibilidad en móviles */
        .react-datepicker__triangle {
          display: none !important;
        }
        
        @media (max-width: 599px) {
          .react-datepicker-popper {
            transform: none !important;
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            z-index: 9999 !important;
          }
          
          .react-datepicker {
            border: 2px solid #da6429 !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
          }
        }
      `}</style>

      {/* Diálogo de confirmación responsive */}
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
          Estado de alta
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
              color: "#da6429",
              fontSize: { xs: '0.9rem', sm: '1rem' },
              minWidth: { xs: '80px', sm: '100px' }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ModificarComponente;
