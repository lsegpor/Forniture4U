import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useEffect, useState } from "react";
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

/**
 * Componente que muestra una lista de todos los componentes.
 * @component
 */
function ListadoComponentes() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const Navigate = useNavigate();

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

      <Box sx={{ mx: 10 }}>
        <TableContainer component={Paper} sx={{ my: 2 }} id="table-container">
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
              {rows.map((row) => (
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
