import { MDBFooter } from "mdb-react-ui-kit";

/**
 * Componente que muestra el pie de página.
 * @component
 */
function Footer() {
  return (
    <>
      <MDBFooter
        className="text-center py-3"
        style={{ backgroundColor: "#e2d0c6" }}
      >
        © {new Date().getFullYear()} Forniture4U - Todos los derechos reservados
      </MDBFooter>
    </>
  );
}

export default Footer;
