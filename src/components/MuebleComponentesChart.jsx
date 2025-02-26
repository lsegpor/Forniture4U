import { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import Button from "@mui/material/Button";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { apiUrl } from "../config";

/**
 * Componente que muestra una gráfica de barras con la cantidad de componentes por mueble.
 * @returns {JSX.Element} El componente de la gráfica de muebles y componentes.
 */
function MuebleComponentesChart() {
  const [muebleIds, setMuebleIds] = useState([]);
  const [datos, setDatos] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    async function getMuebleIds() {
      let response = await fetch(apiUrl + "/mueble");

      if (response.ok) {
        let data = await response.json();
        const ids = data.datos.map((mueble) => mueble.id_mueble); // Extrae solo los IDs
        setMuebleIds(ids);
      }
    }

    getMuebleIds();
  }, []);

  useEffect(() => {
    async function getMueblesById() {
      const mueblesData = await Promise.all(
        muebleIds.map(async (id) => {
          let response = await fetch(`${apiUrl}/mueble/${id}`);
          if (response.ok) {
            let data = await response.json();
            const cantidadTotal = data.datos.id_componente_componentes.reduce(
              (acc, comp) => acc + comp.muebleComponentes.cantidad,
              0
            );
            return {
              nombre: data.datos.nombre,
              cantidadComponentes: cantidadTotal,
            };
          }
          return null;
        })
      );
      setDatos(mueblesData.filter((mueble) => mueble !== null));
    }
    if (muebleIds.length > 0) {
      getMueblesById();
    }
  }, [muebleIds]);

  /**
   * Exporta la gráfica a un archivo PDF.
   */
  const exportarPDF = async () => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 180;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.text("Gráfica de Muebles y Componentes", 15, 20);
    pdf.addImage(imgData, "PNG", 15, 30, imgWidth, imgHeight);
    pdf.save("grafica_muebles.pdf");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "600px",
      }}
    >
      <div
        ref={chartRef}
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          width: "100%",
          maxWidth: "1200px",
          height: "500px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={datos}
            margin={{ top: 50, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="cantidadComponentes"
              fill="#da6429"
              name="Cantidad de Componentes"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Button
        variant="contained"
        sx={{ backgroundColor: "#da6429" }}
        onClick={exportarPDF}
      >
        Impresión a PDF
      </Button>
    </div>
  );
}

export default MuebleComponentesChart;
