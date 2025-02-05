import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarToggler,
  MDBIcon,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBCollapse,
  MDBInputGroup,
  MDBBtn,
} from "mdb-react-ui-kit";
import { useState } from "react";
import logo from "../assets/logo.jpg";
import { Link } from "react-router";
import { useNavigate } from "react-router";

function Menu() {
  const [openBasic, setOpenBasic] = useState(false);
  const [nombreMueble, setNombreMueble] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (nombreMueble.trim() !== "") {
      navigate(`/buscarmueble/${nombreMueble}`);
    }
  };

  return (
    <MDBNavbar expand="lg" sticky light style={{ backgroundColor: "#e2d0c6" }}>
      <MDBContainer fluid>
        <MDBNavbarBrand href="/" style={{ fontSize: "2rem", color: "#332f2d" }}>
          <img
            src={logo}
            height="80"
            alt=""
            loading="lazy"
            style={{
              marginLeft: "5px",
              marginRight: "15px",
              backgroundColor: "white",
              borderRadius: "50%",
              padding: "5px",
            }}
          />
          Forniture4U
        </MDBNavbarBrand>

        <MDBNavbarToggler
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
          onClick={() => setOpenBasic(!openBasic)}
        >
          <MDBIcon icon="bars" fas />
        </MDBNavbarToggler>

        <MDBCollapse navbar open={openBasic}>
          <MDBNavbarNav className="mr-auto mb-2 mb-lg-0">
            <MDBNavbarItem>
              <MDBDropdown>
                <MDBDropdownToggle
                  tag="a"
                  className="nav-link"
                  role="button"
                  style={{ fontSize: "1.2rem" }}
                >
                  Muebles
                </MDBDropdownToggle>
                <MDBDropdownMenu>
                  <Link to="/altamueble" style={{ color: "#4f4f4f" }}>
                    <MDBDropdownItem link>Alta de muebles</MDBDropdownItem>
                  </Link>
                  <Link to="/listadomuebles" style={{ color: "#4f4f4f" }}>
                    <MDBDropdownItem link>Listado de muebles</MDBDropdownItem>
                  </Link>
                  <Link to="/listadomueblesfecha" style={{ color: "#4f4f4f" }}>
                    <MDBDropdownItem link>Listado de muebles por fecha</MDBDropdownItem>
                  </Link>
                </MDBDropdownMenu>
              </MDBDropdown>
            </MDBNavbarItem>
            <MDBNavbarItem>
              <MDBDropdown>
                <MDBDropdownToggle
                  tag="a"
                  className="nav-link"
                  role="button"
                  style={{ fontSize: "1.2rem" }}
                >
                  Componentes
                </MDBDropdownToggle>
                <MDBDropdownMenu>
                  <Link to="/altacomponente" style={{ color: "#4f4f4f" }}>
                    <MDBDropdownItem link>Alta de componentes</MDBDropdownItem>
                  </Link>
                  <Link to="/listadocomponentes" style={{ color: "#4f4f4f" }}>
                    <MDBDropdownItem link>
                      Listado de componentes
                    </MDBDropdownItem>
                  </Link>
                  <Link
                    to="/listadocomponentesmateriales"
                    style={{ color: "#4f4f4f" }}
                  >
                    <MDBDropdownItem link>
                      Listado de componentes por material
                    </MDBDropdownItem>
                  </Link>
                  <Link to="/buscarcomponente" style={{ color: "#4f4f4f" }}>
                    <MDBDropdownItem link>Buscar componentes</MDBDropdownItem>
                  </Link>
                </MDBDropdownMenu>
              </MDBDropdown>
            </MDBNavbarItem>
          </MDBNavbarNav>
        </MDBCollapse>
        <MDBInputGroup tag="form" className="d-flex w-auto">
          <input
            className="form-control"
            placeholder="Nombre de un mueble"
            aria-label="Search"
            type="Search"
            value={nombreMueble}
            onChange={(e) => setNombreMueble(e.target.value)}
          />
          <MDBBtn style={{ backgroundColor: "#da6429" }} onClick={handleSearch}>
            Buscar
          </MDBBtn>
        </MDBInputGroup>
      </MDBContainer>
    </MDBNavbar>
  );
}

export default Menu;
