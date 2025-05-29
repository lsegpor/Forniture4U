import { Outlet } from "react-router";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import { MDBContainer } from "mdb-react-ui-kit";
import Carrusel from "../components/Carrusel";
import { useLocation } from "react-router";
import { AuthListener } from "../hooks/useAuthListener";

/**
 * Componente principal de la página de inicio.
 * @returns {JSX.Element} El componente de la página de inicio.
 */
function Home() {
  const location = useLocation();

  return (
    <>
      <AuthListener />

      <MDBContainer fluid className="d-flex flex-column min-vh-100 p-0">
        <Menu />
        {location.pathname === "/" && <Carrusel />}
        <MDBContainer fluid className="flex-grow-1">
          <Outlet />
        </MDBContainer>
        <Footer />
      </MDBContainer>
    </>
  );
}

export default Home;
