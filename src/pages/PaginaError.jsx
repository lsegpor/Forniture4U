import Menu from "../components/Menu";
import { Typography } from "@mui/material";
import { Button } from "@mui/material";
import Box from "@mui/material/Box";

function Home() {
  return (
    <>
      <Menu />
      <Typography variant="h3" align="center" sx={{ mt: 4, color: "black" }}>
        No hemos encontrado la página que buscas
      </Typography>

      <Box textAlign="center" mt={2}>
        <Button variant="contained" href="/" sx={{ mt: 4, backgroundColor: "black", color: "white" }}>
          Ir a la página principal
        </Button>
      </Box>
    </>
  );
}
export default Home;
