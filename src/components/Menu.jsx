import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarToggler,
  MDBIcon,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBCollapse,
  MDBInputGroup,
  MDBBtn,
} from "mdb-react-ui-kit";
import { useState, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Button } from "@mui/material";
import logo from "../assets/logo.jpg";
import { NavLink } from "react-router-dom"
import { useNavigate } from "react-router-dom";
import useUserStore from "../stores/useUserStore";
import useCarritoStore from "../stores/useCarritoStore";
import { apiUrl } from "../config";
import "../style/Menu.css";

/**
 * Componente del menú de navegación.
 * @returns {JSX.Element} El componente del menú de navegación.
 */
function Menu() {
  const [openBasic, setOpenBasic] = useState(false);
  const [nombreMueble, setNombreMueble] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Obtener función de logout del carrito
  const { handleLogout: carritoLogout } = useCarritoStore();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    navigate("/");
  };

  const isLoggedIn = useUserStore((state) => state.isLoggedIn());
  const isUsuario = useUserStore((state) => state.isUsuario());
  const isEmpresa = useUserStore((state) => state.isEmpresa());
  const clearUser = useUserStore((state) => state.clearUser);
  const user = useUserStore((state) => state.user);

  const getUserDisplayName = () => {
    if (!user) return "Usuario";

    if (isUsuario && user.nombre) {
      return user.nombre;
    } else if (isEmpresa) {
      if (user.nombre_empresa) {
        return user.nombre_empresa;
      } else if (user.nombre_personal) {
        return user.nombre_personal;
      }
    }

    return "Usuario";
  };

  const handleProfile = () => {
    if (isUsuario) {
      navigate('/perfilusuario');
    } else if (isEmpresa) {
      navigate('/perfilempresa');
    }
  };

  /**
   * Maneja la búsqueda de un mueble por nombre.
   */
  const handleSearch = () => {
    if (nombreMueble.trim() !== "") {
      navigate(`/buscarmueble/${nombreMueble}`);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await fetch(`${apiUrl}/usuario/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      carritoLogout();
      clearUser();

      setMessage(`Sesión cerrada correctamente.`);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);

      carritoLogout();
      clearUser();

      setMessage(`Error al cerrar sesión.`);
    } finally {
      handleClickOpen();
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest('.custom-dropdown')) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (dropdown) => {
    if (activeDropdown === dropdown) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdown);
    }
  };

  return (
    <>
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
              {/* Dropdown personalizado para Muebles */}
              <MDBNavbarItem className="custom-dropdown">
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDropdown('muebles');
                  }}
                  style={{ fontSize: "1.2rem", color: "#4f4f4f" }}
                >
                  Muebles <MDBIcon icon="caret-down" className="ms-1" size="xs" />
                </a>
                {activeDropdown === 'muebles' && (
                  <div className="custom-dropdown-menu">
                    {isEmpresa && (
                      <NavLink
                        to="/altamueble"
                        className="custom-dropdown-item"
                        onClick={() => setActiveDropdown(null)}
                      >
                        Alta de muebles
                      </NavLink>
                    )}
                    <NavLink
                      to="/listadomuebles"
                      className="custom-dropdown-item"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Listado de muebles
                    </NavLink>
                    <NavLink
                      to="/listadomueblesfecha"
                      className="custom-dropdown-item"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Listado de muebles por fecha
                    </NavLink>
                  </div>
                )}
              </MDBNavbarItem>

              {/* Dropdown personalizado para Componentes */}
              <MDBNavbarItem className="custom-dropdown">
                <a
                  href="#"
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleDropdown('componentes');
                  }}
                  style={{ fontSize: "1.2rem", color: "#4f4f4f" }}
                >
                  Componentes <MDBIcon icon="caret-down" className="ms-1" size="xs" />
                </a>
                {activeDropdown === 'componentes' && (
                  <div className="custom-dropdown-menu">
                    {isEmpresa && (
                      <NavLink
                        to="/altacomponente"
                        className="custom-dropdown-item"
                        onClick={() => setActiveDropdown(null)}
                      >
                        Alta de componentes
                      </NavLink>
                    )}
                    <NavLink
                      to="/listadocomponentes"
                      className="custom-dropdown-item"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Listado de componentes
                    </NavLink>
                    <NavLink
                      to="/listadocomponentesmateriales"
                      className="custom-dropdown-item"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Listado de componentes por material
                    </NavLink>
                    <NavLink
                      to="/buscarcomponente"
                      className="custom-dropdown-item"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Buscar componentes
                    </NavLink>
                  </div>
                )}
              </MDBNavbarItem>

              {/* Gráfica solo visible para empresas */}
              {isEmpresa && (
                <MDBNavbarItem>
                  <NavLink
                    to="/grafica"
                    className="nav-link"
                    style={{ fontSize: "1.2rem", color: "#4f4f4f" }}
                  >
                    Gráfica
                  </NavLink>
                </MDBNavbarItem>
              )}
            </MDBNavbarNav>
          </MDBCollapse>

          {isLoggedIn ? (
            <div className="custom-dropdown">
              <button
                className="btn btn-sm dropdown-toggle"
                onClick={() => toggleDropdown('user')}
                style={{
                  backgroundColor: "#da6429",
                  marginRight: "15px",
                  padding: "0.4rem 0.8rem",
                  color: "white"
                }}
              >
                <MDBIcon icon="user-circle" className="me-1" />
                {getUserDisplayName()}
              </button>
              {activeDropdown === 'user' && (
                <div className="custom-dropdown-menu user-menu">
                  <a
                    href="#"
                    className="custom-dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveDropdown(null);
                      handleProfile();
                    }}
                  >
                    <MDBIcon icon="user" className="me-2" />
                    Mi perfil
                  </a>
                  <a
                    href="#"
                    className="custom-dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveDropdown(null);
                      handleLogout();
                    }}
                  >
                    <MDBIcon icon="sign-out-alt" className="me-2" />
                    Cerrar sesión
                  </a>
                </div>
              )}
            </div>
          ) : (
            <MDBBtn
              size="sm"
              style={{
                backgroundColor: "#da6429",
                marginRight: "15px",
                padding: "0.4rem 0.8rem"
              }}
              onClick={handleLogin}
            >
              <MDBIcon icon="user" className="me-1" />
              Login
            </MDBBtn>
          )}

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
      <Dialog
        open={open}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Estado de alta</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            sx={{ color: "#da6429" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Menu;
