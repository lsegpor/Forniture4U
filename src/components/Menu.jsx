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
import { Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Button, useMediaQuery, useTheme } from "@mui/material";
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.down('xl'));

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

  // Cerrar menú móvil al hacer clic en un enlace
  const handleNavLinkClick = () => {
    setOpenBasic(false);
    setActiveDropdown(null);
  };

  return (
    <>
      <MDBNavbar
        expand="lg"
        sticky
        light
        style={{
          backgroundColor: "#e2d0c6",
          minHeight: isMobile ? "70px" : "80px"
        }}
      >
        <MDBContainer fluid>
          <MDBNavbarBrand
            href="/"
            style={{
              fontSize: isMobile ? "1.5rem" : isTablet ? "1.8rem" : "2rem",
              color: "#332f2d",
              display: "flex",
              alignItems: "center"
            }}
          >
            <img
              src={logo}
              height={isMobile ? "50" : "70"}
              alt="Logo"
              loading="lazy"
              style={{
                marginLeft: "5px",
                marginRight: isMobile ? "10px" : "15px",
                backgroundColor: "white",
                borderRadius: "50%",
                padding: "5px",
              }}
            />
            {!isMobile && "Forniture4U"}
            {isMobile && "F4U"}
          </MDBNavbarBrand>

          <MDBNavbarToggler
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
            onClick={() => setOpenBasic(!openBasic)}
            style={{
              border: "none",
              fontSize: isMobile ? "1rem" : "1.2rem"
            }}
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
                  style={{
                    fontSize: isMobile ? "1rem" : "1.2rem",
                    color: "#4f4f4f",
                    padding: isMobile ? "0.5rem 1rem" : "0.5rem 1rem"
                  }}
                >
                  Muebles <MDBIcon icon="caret-down" className="ms-1" size="xs" />
                </a>
                {activeDropdown === 'muebles' && (
                  <div
                    className="custom-dropdown-menu"
                    style={{
                      minWidth: isMobile ? "200px" : "250px",
                      fontSize: isMobile ? "0.9rem" : "1rem"
                    }}
                  >
                    {isEmpresa && (
                      <NavLink
                        to="/altamueble"
                        className="custom-dropdown-item"
                        onClick={handleNavLinkClick}
                        style={{
                          padding: isMobile ? "0.5rem 1rem" : "0.75rem 1rem"
                        }}
                      >
                        Alta de muebles
                      </NavLink>
                    )}
                    <NavLink
                      to="/listadomuebles"
                      className="custom-dropdown-item"
                      onClick={handleNavLinkClick}
                      style={{
                        padding: isMobile ? "0.5rem 1rem" : "0.75rem 1rem"
                      }}
                    >
                      Listado de muebles
                    </NavLink>
                    <NavLink
                      to="/listadoavanzadomuebles"
                      className="custom-dropdown-item"
                      onClick={handleNavLinkClick}
                      style={{
                        padding: isMobile ? "0.5rem 1rem" : "0.75rem 1rem"
                      }}
                    >
                      Listado avanzado de muebles
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
                  style={{
                    fontSize: isMobile ? "1rem" : "1.2rem",
                    color: "#4f4f4f",
                    padding: isMobile ? "0.5rem 1rem" : "0.5rem 1rem"
                  }}
                >
                  Componentes <MDBIcon icon="caret-down" className="ms-1" size="xs" />
                </a>
                {activeDropdown === 'componentes' && (
                  <div
                    className="custom-dropdown-menu"
                    style={{
                      minWidth: isMobile ? "250px" : "300px",
                      fontSize: isMobile ? "0.9rem" : "1rem"
                    }}
                  >
                    {isEmpresa && (
                      <NavLink
                        to="/altacomponente"
                        className="custom-dropdown-item"
                        onClick={handleNavLinkClick}
                        style={{
                          padding: isMobile ? "0.5rem 1rem" : "0.75rem 1rem"
                        }}
                      >
                        Alta de componentes
                      </NavLink>
                    )}
                    <NavLink
                      to="/listadocomponentes"
                      className="custom-dropdown-item"
                      onClick={handleNavLinkClick}
                      style={{
                        padding: isMobile ? "0.5rem 1rem" : "0.75rem 1rem"
                      }}
                    >
                      Listado de componentes
                    </NavLink>
                    <NavLink
                      to="/listadocomponentesmateriales"
                      className="custom-dropdown-item"
                      onClick={handleNavLinkClick}
                      style={{
                        padding: isMobile ? "0.5rem 1rem" : "0.75rem 1rem"
                      }}
                    >
                      Listado por material
                    </NavLink>
                    <NavLink
                      to="/buscarcomponente"
                      className="custom-dropdown-item"
                      onClick={handleNavLinkClick}
                      style={{
                        padding: isMobile ? "0.5rem 1rem" : "0.75rem 1rem"
                      }}
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
                    onClick={handleNavLinkClick}
                    style={{
                      fontSize: isMobile ? "1rem" : "1.2rem",
                      color: "#4f4f4f",
                      padding: isMobile ? "0.5rem 1rem" : "0.5rem 1rem"
                    }}
                  >
                    Gráfica
                  </NavLink>
                </MDBNavbarItem>
              )}
            </MDBNavbarNav>
          </MDBCollapse>

          {/* Sección derecha del navbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "0.5rem" : "1rem",
              flexWrap: isMobile ? "wrap" : "nowrap"
            }}
          >
            {/* Usuario/Login */}
            {isLoggedIn ? (
              <div className="custom-dropdown">
                <button
                  className="btn btn-sm dropdown-toggle"
                  onClick={() => toggleDropdown('user')}
                  style={{
                    backgroundColor: "#da6429",
                    marginRight: isMobile ? "5px" : "15px",
                    padding: isMobile ? "0.3rem 0.6rem" : "0.4rem 0.8rem",
                    color: "white",
                    fontSize: isMobile ? "0.8rem" : "0.9rem",
                    border: "none",
                    borderRadius: "4px",
                    maxWidth: isMobile ? "120px" : "auto",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  <MDBIcon icon="user-circle" className="me-1" />
                  {isMobile ? getUserDisplayName().substring(0, 8) + (getUserDisplayName().length > 8 ? "..." : "") : getUserDisplayName()}
                </button>
                {activeDropdown === 'user' && (
                  <div
                    className="custom-dropdown-menu user-menu"
                    style={{
                      right: isMobile ? "0" : "auto",
                      left: isMobile ? "auto" : "0",
                      minWidth: isMobile ? "150px" : "180px",
                      fontSize: isMobile ? "0.9rem" : "1rem"
                    }}
                  >
                    <a
                      href="#"
                      className="custom-dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveDropdown(null);
                        handleProfile();
                      }}
                      style={{
                        padding: isMobile ? "0.5rem 1rem" : "0.75rem 1rem"
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
                      style={{
                        padding: isMobile ? "0.5rem 1rem" : "0.75rem 1rem"
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
                  marginRight: isMobile ? "5px" : "15px",
                  padding: isMobile ? "0.3rem 0.6rem" : "0.4rem 0.8rem",
                  fontSize: isMobile ? "0.8rem" : "0.9rem"
                }}
                onClick={handleLogin}
              >
                <MDBIcon icon="user" className="me-1" />
                Login
              </MDBBtn>
            )}

            {/* Barra de búsqueda */}
            <MDBInputGroup
              tag="form"
              className="d-flex"
              style={{
                width: isMobile ? "100%" : "auto",
                minWidth: isMobile ? "200px" : "250px",
                maxWidth: isMobile ? "300px" : "400px",
                order: isMobile ? "3" : "initial",
                marginTop: isMobile ? "0.5rem" : "0"
              }}
            >
              <input
                className="form-control"
                placeholder={isMobile ? "Buscar mueble..." : "Nombre de un mueble"}
                aria-label="Search"
                type="Search"
                value={nombreMueble}
                onChange={(e) => setNombreMueble(e.target.value)}
                style={{
                  fontSize: isMobile ? "0.85rem" : "0.9rem",
                  padding: isMobile ? "0.4rem 0.6rem" : "0.5rem 0.75rem"
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <MDBBtn
                style={{
                  backgroundColor: "#da6429",
                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                  padding: isMobile ? "0.4rem 0.6rem" : "0.5rem 0.75rem"
                }}
                onClick={handleSearch}
              >
                {isMobile ? <MDBIcon icon="search" /> : "Buscar"}
              </MDBBtn>
            </MDBInputGroup>
          </div>
        </MDBContainer>
      </MDBNavbar>

      {/* Diálogo responsive */}
      <Dialog
        open={open}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        fullWidth
        maxWidth="sm"
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 2, sm: 4 },
            width: { xs: 'calc(100% - 32px)', sm: 'auto' },
            maxWidth: { xs: 'calc(100% - 32px)', sm: '600px' }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Estado de operación
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-slide-description"
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
          <Button
            onClick={handleClose}
            sx={{
              color: "#da6429",
              fontSize: { xs: '0.9rem', sm: '1rem' },
              minWidth: { xs: '80px', sm: '100px' }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Estilos CSS adicionales para responsividad */}
      <style>{`
        @media (max-width: 991px) {
          .custom-dropdown-menu {
            position: static !important;
            transform: none !important;
            box-shadow: none !important;
            border: none !important;
            background-color: rgba(218, 100, 41, 0.1) !important;
            margin-left: 1rem !important;
            border-radius: 0 !important;
          }
          
          .custom-dropdown-item {
            border-bottom: 1px solid rgba(0,0,0,0.1) !important;
          }
          
          .navbar-collapse {
            border-top: 1px solid rgba(0,0,0,0.1);
            margin-top: 0.5rem;
            padding-top: 0.5rem;
          }
        }

        @media (max-width: 576px) {
          .navbar-brand {
            font-size: 1.2rem !important;
          }
          
          .nav-link {
            font-size: 0.9rem !important;
          }
          
          .custom-dropdown-item {
            font-size: 0.85rem !important;
            padding: 0.4rem 0.8rem !important;
          }
        }

        /* Mejoras para el menú móvil */
        @media (max-width: 991px) {
          .navbar-nav {
            width: 100%;
          }
          
          .custom-dropdown {
            width: 100%;
          }
          
          .nav-link {
            border-bottom: 1px solid rgba(0,0,0,0.05);
            margin: 0;
            padding: 0.75rem 1rem !important;
          }
          
          .nav-link:hover {
            background-color: rgba(218, 100, 41, 0.1);
          }
        }
      `}</style>
    </>
  );
}

export default Menu;