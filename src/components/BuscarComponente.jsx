import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useNavigate } from "react-router";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import { apiUrl } from "../config";

function BuscarComponente() {
  const [nombre, setNombre] = useState(""); // Estado para el nombre a buscar
  const [componentes, setComponentes] = useState([]); // Estado para almacenar los resultados de la búsqueda
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const Navigate = useNavigate();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

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

  // Función para manejar la búsqueda
  const handleSearch = async () => {
    try {
      const response = await fetch(
        apiUrl + `/componentes/buscar?nombre=${nombre}`
      );
      const data = await response.json();

      if (response.ok) {
        setComponentes(data); // Actualizar el estado con los resultados de la búsqueda
      } else {
        setComponentes([]); // Limpiar los resultados
      }
    } catch (error) {
      console.error("Error al obtener componentes:", error);
      setComponentes([]); // Limpiar los resultados en caso de error
    }
  };

  return (
    <>
      <Typography variant="h4" align="center" sx={{ m: 4, color: "#332f2d" }}>
        Buscar componentes
      </Typography>

      <Box sx={{ maxWidth: 600, mx: "auto", mb: 4 }}>
        <Grid
          container
          spacing={2}
          alignItems="center"
          sx={{ justifyContent: "center" }}
        >
          <Grid item xs={8}>
            <TextField
              label="Nombre del Componente"
              fullWidth
              value={nombre}
              onChange={(e) => setNombre(e.target.value)} // Actualizar el valor del input
              variant="outlined"
            />
          </Grid>
          <Grid item xs={4}>
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ height: "100%", backgroundColor: "#da6429" }}
            >
              Buscar
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mx: 10 }}>
        <TableContainer component={Paper} sx={{ my: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead sx={{ backgroundColor: "#e2d0c6" }}>
              <TableRow>
                <TableCell align="center">IDCOMPONENTE</TableCell>
                <TableCell align="center">NOMBRE</TableCell>
                <TableCell align="center">PRECIO</TableCell>
                <TableCell align="center">FECHA DE IMPORTACIÓN</TableCell>
                <TableCell align="center">EN STOCK</TableCell>
                <TableCell align="center">MATERIAL</TableCell>
                <TableCell align="center">ELIMINAR</TableCell>
                <TableCell align="center">EDITAR</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {componentes.map((row) => (
                <TableRow
                  key={row.id_componente}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="center">{row.id_componente}</TableCell>
                  <TableCell align="center">{row.nombre}</TableCell>
                  <TableCell align="center">{row.precio + "€"}</TableCell>
                  <TableCell align="center">{row.fecha_importacion}</TableCell>
                  <TableCell align="center">
                    {row.en_stock ? "Sí" : "No"}
                  </TableCell>
                  <TableCell align="center">{row.material}</TableCell>
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

export default BuscarComponente;
