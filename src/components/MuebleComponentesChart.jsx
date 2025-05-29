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
import useUserStore from "../stores/useUserStore";

/**
 * Componente que muestra una gráfica de barras con la cantidad de componentes por mueble.
 * @returns {JSX.Element} El componente de la gráfica de muebles y componentes.
 */
function MuebleComponentesChart() {
  const [datos, setDatos] = useState([]);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  const { user, isEmpresa } = useUserStore();

  useEffect(() => {
    async function fetchData() {
      try {

        if (!isEmpresa()) {
          throw new Error("Esta funcionalidad solo está disponible para empresas.");
        }

        const empresaId = user.id_empresa;

        if (!empresaId) {
          throw new Error("No se pudo determinar el ID de la empresa.");
        }

        // Obtener todos los muebles
        const response = await fetch(apiUrl + "/mueble");

        if (!response.ok) {
          throw new Error(`Error al obtener muebles: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.ok || !data.datos) {
          throw new Error(data.mensaje || "Error al obtener datos de muebles");
        }

        // Filtrar los muebles para mostrar solo los de la empresa actual
        const mueblesFiltrados = data.datos.filter(
          mueble => mueble.id_empresa === parseInt(empresaId)
        );

        console.log(`Filtrando muebles para empresa ID ${empresaId}. Total: ${mueblesFiltrados.length} de ${data.datos.length}`);

        if (mueblesFiltrados.length === 0) {
          setDatos([]);
          return;
        }

        // Crear el array de datos para la gráfica
        const chartData = await Promise.all(
          mueblesFiltrados.map(async (mueble) => {
            try {
              // Obtener detalles del mueble individual si no están incluidos en la respuesta principal
              // Solo si no tienes los componentes en la respuesta inicial
              if (!mueble.id_componente_componentes) {
                const detailResponse = await fetch(`${apiUrl}/mueble/${mueble.id_mueble}`);

                if (!detailResponse.ok) {
                  console.error(`Error al obtener detalles del mueble ${mueble.id_mueble}`);
                  return null;
                }

                const detailData = await detailResponse.json();

                if (!detailData.ok || !detailData.datos) {
                  console.error(`Datos incorrectos para el mueble ${mueble.id_mueble}`);
                  return null;
                }

                mueble = detailData.datos;
              }

              // Verificar que la estructura de datos sea la esperada
              if (!mueble.id_componente_componentes) {
                console.log("Estructura de mueble:", mueble);
                return {
                  nombre: mueble.nombre,
                  cantidadComponentes: 0,
                  id: mueble.id_mueble
                };
              }

              // Calcular la cantidad total de componentes
              // Adapta esta parte según la estructura real de tus datos
              const cantidadTotal = mueble.id_componente_componentes.reduce(
                (acc, comp) => {
                  // Comprueba si la estructura es correcta
                  if (comp.mueble_componentes && comp.mueble_componentes.cantidad) {
                    return acc + comp.mueble_componentes.cantidad;
                  } else if (comp.cantidad) {
                    return acc + comp.cantidad;
                  } else if (comp.muebleComponentes && comp.muebleComponentes.cantidad) {
                    return acc + comp.muebleComponentes.cantidad;
                  }
                  console.log("Estructura de componente inesperada:", comp);
                  return acc;
                },
                0
              );

              return {
                nombre: mueble.nombre,
                cantidadComponentes: cantidadTotal,
                id: mueble.id_mueble
              };
            } catch (err) {
              console.error(`Error procesando mueble ${mueble.id_mueble}:`, err);
              return null;
            }
          })
        );

        // Filtrar elementos nulos y ordenar por cantidad de componentes
        const filteredData = chartData
          .filter(item => item !== null)
          .sort((a, b) => b.cantidadComponentes - a.cantidadComponentes);

        setDatos(filteredData);

        // Log para depuración
        console.log("Datos procesados para la gráfica:", filteredData);

      } catch (err) {
        console.error("Error al cargar los datos:", err);
        setError(err.message);
      }
    }

    fetchData();
  }, [user, isEmpresa]);

  /**
   * Exporta la gráfica a un archivo PDF.
   */
  const exportarPDF = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.text("Gráfica de Muebles y Componentes", 15, 20);
      pdf.addImage(imgData, "PNG", 15, 30, imgWidth, imgHeight);
      pdf.save("grafica_muebles.pdf");
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      alert("Error al exportar PDF. Consulta la consola para más detalles.");
    }
  };

  // Mostrar error si existe
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Mostrar mensaje si no hay datos
  if (datos.length === 0) {
    return <div>No hay datos disponibles para mostrar en la gráfica.</div>;
  }

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
