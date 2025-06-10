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
import { Box, Typography, IconButton, Container, useMediaQuery, useTheme } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { apiUrl } from "../config";
import useUserStore from "../stores/useUserStore";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Componente que muestra una gráfica de barras con la cantidad de componentes por mueble.
 * @returns {JSX.Element} El componente de la gráfica de muebles y componentes.
 */
function MuebleComponentesChart() {
  const [datos, setDatos] = useState([]);
  const [error, setError] = useState(null);
  const [fechaActual, setFechaActual] = useState(new Date()); // Mes actual
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const { user, isEmpresa } = useUserStore();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        if (!isEmpresa()) {
          throw new Error("Esta funcionalidad solo está disponible para empresas.");
        }

        const empresaId = user.id_empresa;

        if (!empresaId) {
          throw new Error("No se pudo determinar el ID de la empresa.");
        }

        // Obtener primer y último día del mes
        const inicioMes = startOfMonth(fechaActual);
        const finMes = endOfMonth(fechaActual);

        // Formatear fechas para la consulta
        const fechaInicioStr = format(inicioMes, "yyyy-MM-dd");
        const fechaFinStr = format(finMes, "yyyy-MM-dd");

        // Obtener estadísticas de pedidos del mes
        const response = await fetch(
          `${apiUrl}/pedidos/estadisticas/por-fecha?fecha_inicio=${fechaInicioStr}&fecha_fin=${fechaFinStr}`,
          {
            headers: {
              'Authorization': `Bearer ${user.token}` // Asegúrate de incluir el token
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Error al obtener pedidos: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.ok || !data.datos) {
          throw new Error(data.mensaje || "Error al obtener datos de pedidos");
        }

        // Crear un array con todos los días del mes
        const diasDelMes = eachDayOfInterval({
          start: inicioMes,
          end: finMes,
        });

        // Inicializar contador de pedidos por día
        const pedidosPorDia = {};
        diasDelMes.forEach((dia) => {
          const fechaStr = format(dia, "yyyy-MM-dd");
          pedidosPorDia[fechaStr] = 0;
        });

        // Contar pedidos por día desde los datos agrupados
        data.datos.forEach((registro) => {
          const fechaPedido = registro.fecha;
          if (pedidosPorDia.hasOwnProperty.call(pedidosPorDia, fechaPedido)) {
            pedidosPorDia[fechaPedido] = registro.cantidad_pedidos;
          }
        });

        // Convertir a formato para la gráfica
        const chartData = diasDelMes.map((dia) => {
          const fechaStr = format(dia, "yyyy-MM-dd");
          return {
            dia: format(dia, "d"), // Solo el número del día
            fecha: format(dia, "dd/MM", { locale: es }),
            fechaCompleta: fechaStr,
            cantidadPedidos: pedidosPorDia[fechaStr],
          };
        });

        setDatos(chartData);

      } catch (err) {
        console.error("Error al cargar los datos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [fechaActual, user, isEmpresa]);

  /**
   * Navega al mes anterior
   */
  const irMesAnterior = () => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
    setFechaActual(nuevaFecha);
  };

  /**
   * Navega al mes siguiente
   */
  const irMesSiguiente = () => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
    setFechaActual(nuevaFecha);
  };

  /**
   * Exporta la gráfica a un archivo PDF.
   */
  const exportarPDF = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: isMobile ? 1 : isTablet ? 1.5 : 2, // Escala progresiva
        useCORS: true,
        allowTaint: true
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF(isMobile ? "p" : "l", "mm", "a4"); // Portrait en móvil, Landscape en tablet/desktop
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth - 30; // Márgenes de 15mm a cada lado
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const mesAno = format(fechaActual, "MMMM yyyy", { locale: es });

      // Título responsive
      pdf.setFontSize(isMobile ? 14 : isTablet ? 15 : 16);
      pdf.text("Gráfica de Pedidos por Día", 15, 20);
      pdf.setFontSize(isMobile ? 12 : isTablet ? 13 : 14);
      pdf.text(`Mes: ${mesAno}`, 15, 28);

      // Verificar si la imagen cabe en la página
      const maxImgHeight = pageHeight - 50; // Dejar espacio para títulos y márgenes
      const finalImgHeight = Math.min(imgHeight, maxImgHeight);
      const finalImgWidth = (canvas.width * finalImgHeight) / canvas.height;

      pdf.addImage(imgData, "PNG", 15, 35, finalImgWidth, finalImgHeight);
      pdf.save(`pedidos_${format(fechaActual, "MM-yyyy")}.pdf`);
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      alert("Error al exportar PDF. Consulta la consola para más detalles.");
    }
  };

  /**
   * Tooltip personalizado responsive
   */
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: isMobile ? '8px' : isTablet ? '9px' : '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          fontSize: isMobile ? '12px' : isTablet ? '13px' : '14px',
          maxWidth: isMobile ? '200px' : isTablet ? '250px' : 'auto'
        }}>
          <p style={{
            margin: 0,
            fontWeight: 'bold',
            fontSize: isMobile ? '11px' : isTablet ? '12px' : '13px'
          }}>
            {`${format(parseISO(data.fechaCompleta), "dd 'de' MMMM 'de' yyyy", { locale: es })}`}
          </p>
          <p style={{
            margin: 0,
            color: '#da6429',
            fontSize: isMobile ? '11px' : isTablet ? '12px' : '13px'
          }}>
            {`Pedidos: ${data.cantidadPedidos}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Mostrar error si existe
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography
            color="error"
            sx={{
              fontSize: { xs: '0.9rem', sm: '1rem' },
              px: 1
            }}
          >
            Error: {error}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 2, sm: 3 },
        minHeight: { xs: 'auto', md: '700px' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* Título principal */}
      <Typography
        variant="h4"
        align="center"
        sx={{
          mb: { xs: 2, sm: 3, md: 4 },
          color: "#332f2d",
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontWeight: 'bold',
          fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
          px: 1
        }}
      >
        Estadísticas de Pedidos
      </Typography>

      {/* Selector de mes con navegación */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 1, sm: 2 },
        mb: { xs: 2, sm: 3 },
        backgroundColor: '#f5f5f5',
        padding: { xs: '8px 16px', sm: '10px 20px' },
        borderRadius: '25px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: 'fit-content',
        maxWidth: '100%'
      }}>
        <IconButton
          onClick={irMesAnterior}
          size={isMobile ? "small" : isTablet ? "medium" : "medium"}
          sx={{
            color: '#da6429',
            '&:hover': { backgroundColor: 'rgba(218, 100, 41, 0.1)' }
          }}
        >
          <ChevronLeft fontSize={isMobile ? "small" : isTablet ? "medium" : "medium"} />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            minWidth: { xs: '150px', sm: '180px', md: '200px' },
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#da6429',
            textTransform: 'capitalize',
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
          }}
        >
          {format(fechaActual, "MMMM yyyy", { locale: es })}
        </Typography>

        <IconButton
          onClick={irMesSiguiente}
          size={isMobile ? "small" : isTablet ? "medium" : "medium"}
          sx={{
            color: '#da6429',
            '&:hover': { backgroundColor: 'rgba(218, 100, 41, 0.1)' }
          }}
        >
          <ChevronRight fontSize={isMobile ? "small" : isTablet ? "medium" : "medium"} />
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Cargando datos...
          </Typography>
        </Box>
      ) : datos.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            No hay datos disponibles para este mes.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Gráfica responsive */}
          <Box
            ref={chartRef}
            sx={{
              backgroundColor: "#fff",
              padding: { xs: '10px', sm: '15px', md: '20px' },
              width: "100%",
              maxWidth: { xs: '100%', sm: '900px', md: '1200px' },
              height: { xs: '300px', sm: '400px', md: '500px' },
              display: "flex",
              justifyContent: "center",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              mb: { xs: 2, sm: 3 },
              overflow: 'hidden'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datos}
                margin={{
                  top: isMobile ? 10 : 20,
                  right: isMobile ? 10 : 30,
                  left: isMobile ? 5 : 20,
                  bottom: isMobile ? 20 : 5
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="dia"
                  fontSize={isMobile ? 10 : isTablet ? 11 : 12}
                  tick={{ fill: '#666' }}
                  interval={isMobile ? 2 : isTablet ? 1 : 0} // Progresivo: menos etiquetas en dispositivos pequeños
                  angle={isMobile ? -45 : isTablet ? -30 : 0}
                  textAnchor={isMobile ? 'end' : isTablet ? 'end' : 'middle'}
                  height={isMobile ? 50 : isTablet ? 40 : 30}
                />
                <YAxis
                  fontSize={isMobile ? 10 : isTablet ? 11 : 12}
                  tick={{ fill: '#666' }}
                  width={isMobile ? 40 : isTablet ? 50 : 60}
                />
                <Tooltip content={<CustomTooltip />} />
                {!isMobile && <Legend />}
                <Bar
                  dataKey="cantidadPedidos"
                  fill="#da6429"
                  name="Cantidad de Pedidos"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={isMobile ? 20 : isTablet ? 30 : 40}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Información adicional responsive */}
          <Box sx={{
            textAlign: 'center',
            mb: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 2 }
          }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                lineHeight: { xs: 1.4, sm: 1.2 }
              }}
            >
              {isMobile ? (
                <>
                  Días del mes: {datos.length}
                  <br />
                  Total pedidos: {datos.reduce((sum, item) => sum + item.cantidadPedidos, 0)}
                </>
              ) : (
                `Total de días en el mes: ${datos.length} | Total de pedidos: ${datos.reduce((sum, item) => sum + item.cantidadPedidos, 0)}`
              )}
            </Typography>
          </Box>

          {/* Botón de exportar responsive */}
          <Button
            variant="contained"
            fullWidth={isMobile}
            sx={{
              backgroundColor: "#da6429",
              maxWidth: { xs: '100%', sm: '200px' },
              height: { xs: '44px', sm: '48px' },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              '&:hover': {
                backgroundColor: "#c55a24"
              }
            }}
            onClick={exportarPDF}
          >
            Exportar a PDF
          </Button>
        </>
      )}
    </Container>
  );
}

export default MuebleComponentesChart;