import { Box, Typography, TextField } from "@mui/material";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import FormControl from "@mui/material/FormControl";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useNavigate } from "react-router";
import { apiUrl } from "../config";
import InfoIcon from "@mui/icons-material/Info";
import dayjs from "dayjs";
import useUserStore from "../stores/useUserStore";

// Registrar el idioma español
registerLocale("es", es);

/**
 * Componente que muestra una lista de muebles filtrados por fecha de entrega.
 * @component
 */
function ListadoMueblesFecha() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [muebles, setMuebles] = useState([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const isEmpresa = useUserStore((state) => state.isEmpresa());
  const user = useUserStore((state) => state.user);

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
   * Elimina un mueble por su ID.
   * @param {number} id_mueble - ID del mueble a eliminar.
   */
  const handleDelete = async (id_mueble) => {
    try {
      const response = await fetch(apiUrl + `/mueble/${id_mueble}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMuebles((prevRows) =>
          prevRows.filter((row) => row.id_mueble !== id_mueble)
        );
        setMessage(`Mueble con ID ${id_mueble} eliminado correctamente`);
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

  useEffect(() => {
    if (fechaSeleccionada) {
      fetchMuebles(fechaSeleccionada);
    }
  }, [fechaSeleccionada]);

  /**
   * Obtiene los muebles filtrados por fecha de entrega.
   * @param {string} fecha - Fecha de entrega en formato YYYY-MM-DD.
   */
  const fetchMuebles = async (fecha) => {
    try {
      const response = await fetch(apiUrl + `/mueble/fechaentrega/${fecha}`);
      const data = await response.json();
      setMuebles(data);
    } catch (error) {
      console.error("Error al obtener muebles:", error);
    }
  };

  return (
    <>
      <Typography variant="h4" align="center" sx={{ m: 4, color: "#332f2d" }}>
        Listado de muebles previos a fecha de entrega seleccionada
      </Typography>

      <Box sx={{ maxWidth: 400, mx: "auto", mb: 4, textAlign: "center" }}>
        <FormControl fullWidth>
          <DatePicker
            value={fechaSeleccionada}
            onChange={(newValue) => setFechaSeleccionada(dayjs(newValue).format("YYYY-MM-DD"))}
            renderInput={(params) => <TextField {...params} fullWidth />}
            dateFormat="dd/MM/yyyy"
            placeholderText="Fecha de entrega:"
            className="border rounded-lg py-2 px-3 w-100"
            calendarClassName="custom-calendar"
            dayClassName={(date) =>
              muebles.fecha_entrega === date.toISOString().split("T")[0]
                ? "selected-day"
                : "day"
            }
            locale="es"
          />
        </FormControl>
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
      </Box>
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
                {isEmpresa && (
                  <>
                    <TableCell align="center">ELIMINAR</TableCell>
                    <TableCell align="center">EDITAR</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {muebles.map((row) => (
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
      </Box>

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

export default ListadoMueblesFecha;
