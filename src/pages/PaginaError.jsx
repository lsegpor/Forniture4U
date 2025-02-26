import Menu from "../components/Menu";
import { Typography } from "@mui/material";
import { Button } from "@mui/material";
import Box from "@mui/material/Box";

/**
 * Página de error que se muestra cuando no se encuentra la página solicitada.
 * @returns {JSX.Element} El componente de la página de error.
 */
function PaginaError() {
  return (
    <>
      {/* Menú de navegación */}
      <Menu />
      {/* Mensaje de error */}
      <Typography variant="h3" align="center" sx={{ mt: 4, color: "black" }}>
        No hemos encontrado la página que buscas
      </Typography>
      {/* Botón para regresar a la página principal */}
      <Box textAlign="center" mt={2}>
        <Button variant="contained" href="/" sx={{ mt: 4, backgroundColor: "black", color: "white" }}>
          Ir a la página principal
        </Button>
      </Box>
    </>
  );
}

export default PaginaError;
