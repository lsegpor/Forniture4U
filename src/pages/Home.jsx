import { Outlet } from "react-router";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import { MDBContainer } from "mdb-react-ui-kit";
import Carrusel from "../components/Carrusel";
import { useLocation } from "react-router";
import { AuthListener } from "../hooks/useAuthListener";
import { requestNotificationPermission } from "../utils/cartNotifications";
import { useEffect } from "react";

/**
 * Componente principal de la página de inicio.
 * @returns {JSX.Element} El componente de la página de inicio.
 */
function Home() {
  const location = useLocation();

  // Solicitar permisos para notificaciones al cargar la app
  useEffect(() => {
    requestNotificationPermission();
  }, []);

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
