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
import logo from "../../assets/logo.jpg";
import { NavLink } from "react-router-dom"
import { useNavigate } from "react-router-dom";
import useUserStore from "../../stores/useUserStore";
import useCarritoStore from "../../stores/useCarritoStore";
import { apiUrl } from "../../config";
import "../../style/Menu.css";

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
          minHeight: isMobile ? "120px" : "80px"
        }}
      >
        <MDBContainer fluid>
          {/* Layout para móvil - 2 filas */}
          {isMobile && (
            <>
              {/* Primera fila: Logo, Login, Menu toggle */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                marginBottom: "10px"
              }}>
                <MDBNavbarBrand
                  href="/"
                  style={{
                    fontSize: "1.5rem",
                    color: "#332f2d",
                    display: "flex",
                    alignItems: "center",
                    flex: "0 0 auto"
                  }}
                >
                  <img
                    src={logo}
                    height="50"
                    alt="Logo"
                    loading="lazy"
                    style={{
                      marginLeft: "5px",
                      marginRight: "10px",
                      backgroundColor: "white",
                      borderRadius: "50%",
                      padding: "5px",
                    }}
                  />
                  Forniture4U
                </MDBNavbarBrand>

                {/* Login button centrado */}
                <div style={{ flex: "1", display: "flex", justifyContent: "center" }}>
                  {isLoggedIn ? (
                    <div className="custom-dropdown">
                      <button
                        className="btn btn-sm dropdown-toggle"
                        onClick={() => toggleDropdown('user')}
                        style={{
                          backgroundColor: "#da6429",
                          padding: "0.3rem 0.6rem",
                          color: "white",
                          fontSize: "0.8rem",
                          border: "none",
                          borderRadius: "4px",
                          maxWidth: "120px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        <MDBIcon icon="user-circle" className="me-1" />
                        {getUserDisplayName().substring(0, 8) + (getUserDisplayName().length > 8 ? "..." : "")}
                      </button>
                      {activeDropdown === 'user' && (
                        <div
                          className="custom-dropdown-menu user-menu"
                          style={{
                            right: "0",
                            minWidth: "150px",
                            fontSize: "0.9rem",
                            position: "absolute",
                            zIndex: 1000
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
                            style={{ padding: "0.5rem 1rem" }}
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
                            style={{ padding: "0.5rem 1rem" }}
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
                        padding: "0.3rem 0.6rem",
                        fontSize: "0.8rem"
                      }}
                      onClick={handleLogin}
                    >
                      <MDBIcon icon="user" className="me-1" />
                      Login
                    </MDBBtn>
                  )}
                </div>

                <MDBNavbarToggler
                  aria-controls="navbarSupportedContent"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                  onClick={() => setOpenBasic(!openBasic)}
                  style={{
                    border: "none",
                    fontSize: "1rem",
                    flex: "0 0 auto"
                  }}
                >
                  <MDBIcon icon="bars" fas />
                </MDBNavbarToggler>
              </div>

              {/* Segunda fila: Barra de búsqueda centrada */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                width: "100%"
              }}>
                <MDBInputGroup
                  tag="form"
                  className="d-flex"
                  style={{
                    width: "90%",
                    maxWidth: "300px"
                  }}
                >
                  <input
                    className="form-control"
                    placeholder="Buscar mueble..."
                    aria-label="Search"
                    type="Search"
                    value={nombreMueble}
                    onChange={(e) => setNombreMueble(e.target.value)}
                    style={{
                      fontSize: "0.85rem",
                      padding: "0.4rem 0.6rem"
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
                      fontSize: "0.8rem",
                      padding: "0.4rem 0.6rem"
                    }}
                    onClick={handleSearch}
                  >
                    <MDBIcon icon="search" />
                  </MDBBtn>
                </MDBInputGroup>
              </div>
            </>
          )}

          {/* Layout para tablet - una sola fila: Logo, Login, Búsqueda, Menu */}
          {isTablet && !isMobile && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%"
            }}>
              <MDBNavbarBrand
                href="/"
                style={{
                  fontSize: "1.8rem",
                  color: "#332f2d",
                  display: "flex",
                  alignItems: "center",
                  flex: "0 0 auto"
                }}
              >
                <img
                  src={logo}
                  height="70"
                  alt="Logo"
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
                style={{
                  border: "none",
                  fontSize: "1.2rem"
                }}
              >
                <MDBIcon icon="bars" fas />
              </MDBNavbarToggler>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem"
                }}
              >

                {/* Login */}
                {isLoggedIn ? (
                  <div className="custom-dropdown">
                    <button
                      className="btn btn-sm dropdown-toggle"
                      onClick={() => toggleDropdown('user')}
                      style={{
                        backgroundColor: "#da6429",
                        padding: "0.4rem 0.8rem",
                        color: "white",
                        fontSize: "0.9rem",
                        border: "none",
                        borderRadius: "4px"
                      }}
                    >
                      <MDBIcon icon="user-circle" className="me-1" />
                      {getUserDisplayName()}
                    </button>
                    {activeDropdown === 'user' && (
                      <div
                        className="custom-dropdown-menu user-menu"
                        style={{
                          right: "0",
                          minWidth: "180px",
                          fontSize: "1rem",
                          position: "absolute",
                          zIndex: 1000
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
                          style={{ padding: "0.75rem 1rem" }}
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
                          style={{ padding: "0.75rem 1rem" }}
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
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.9rem"
                    }}
                    onClick={handleLogin}
                  >
                    <MDBIcon icon="user" className="me-1" />
                    Login
                  </MDBBtn>
                )}

                {/* Búsqueda */}
                <MDBInputGroup
                  tag="form"
                  className="d-flex"
                  style={{
                    minWidth: "250px",
                    maxWidth: "300px"
                  }}
                >
                  <input
                    className="form-control"
                    placeholder="Nombre de un mueble"
                    aria-label="Search"
                    type="Search"
                    value={nombreMueble}
                    onChange={(e) => setNombreMueble(e.target.value)}
                    style={{
                      fontSize: "0.9rem",
                      padding: "0.5rem 0.75rem"
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
                      fontSize: "0.9rem",
                      padding: "0.5rem 0.75rem"
                    }}
                    onClick={handleSearch}
                  >
                    Buscar
                  </MDBBtn>
                </MDBInputGroup>
              </div>
            </div>
          )}

          {/* Layout para desktop */}
          {!isMobile && !isTablet && (
            <>
              <MDBNavbarBrand
                href="/"
                style={{
                  fontSize: "2rem",
                  color: "#332f2d",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <img
                  src={logo}
                  height="70"
                  alt="Logo"
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
                style={{
                  border: "none",
                  fontSize: "1.2rem"
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
                        fontSize: "1.2rem",
                        color: "#4f4f4f",
                        padding: "0.5rem 1rem"
                      }}
                    >
                      Muebles <MDBIcon icon="caret-down" className="ms-1" size="xs" />
                    </a>
                    {activeDropdown === 'muebles' && (
                      <div
                        className="custom-dropdown-menu"
                        style={{
                          minWidth: "250px",
                          fontSize: "1rem"
                        }}
                      >
                        {isEmpresa && (
                          <NavLink
                            to="/altamueble"
                            className="custom-dropdown-item"
                            onClick={handleNavLinkClick}
                            style={{ padding: "0.75rem 1rem" }}
                          >
                            Alta de muebles
                          </NavLink>
                        )}
                        <NavLink
                          to="/listadomuebles"
                          className="custom-dropdown-item"
                          onClick={handleNavLinkClick}
                          style={{ padding: "0.75rem 1rem" }}
                        >
                          Listado de muebles
                        </NavLink>
                        <NavLink
                          to="/listadoavanzadomuebles"
                          className="custom-dropdown-item"
                          onClick={handleNavLinkClick}
                          style={{ padding: "0.75rem 1rem" }}
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
                        fontSize: "1.2rem",
                        color: "#4f4f4f",
                        padding: "0.5rem 1rem"
                      }}
                    >
                      Componentes <MDBIcon icon="caret-down" className="ms-1" size="xs" />
                    </a>
                    {activeDropdown === 'componentes' && (
                      <div
                        className="custom-dropdown-menu"
                        style={{
                          minWidth: "300px",
                          fontSize: "1rem"
                        }}
                      >
                        {isEmpresa && (
                          <NavLink
                            to="/altacomponente"
                            className="custom-dropdown-item"
                            onClick={handleNavLinkClick}
                            style={{ padding: "0.75rem 1rem" }}
                          >
                            Alta de componentes
                          </NavLink>
                        )}
                        <NavLink
                          to="/listadocomponentes"
                          className="custom-dropdown-item"
                          onClick={handleNavLinkClick}
                          style={{ padding: "0.75rem 1rem" }}
                        >
                          Listado de componentes
                        </NavLink>
                        <NavLink
                          to="/listadocomponentesmateriales"
                          className="custom-dropdown-item"
                          onClick={handleNavLinkClick}
                          style={{ padding: "0.75rem 1rem" }}
                        >
                          Listado por material
                        </NavLink>
                        <NavLink
                          to="/buscarcomponente"
                          className="custom-dropdown-item"
                          onClick={handleNavLinkClick}
                          style={{ padding: "0.75rem 1rem" }}
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
                          fontSize: "1.2rem",
                          color: "#4f4f4f",
                          padding: "0.5rem 1rem"
                        }}
                      >
                        Gráfica
                      </NavLink>
                    </MDBNavbarItem>
                  )}
                </MDBNavbarNav>
              </MDBCollapse>

              {/* Sección derecha del navbar para desktop */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem"
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
                        marginRight: "15px",
                        padding: "0.4rem 0.5rem",
                        color: "white",
                        fontSize: "0.8rem",
                        border: "none",
                        minWidth: "140px"
                      }}
                    >
                      <MDBIcon icon="user-circle" className="me-2" />
                      {getUserDisplayName()}
                    </button>
                    {activeDropdown === 'user' && (
                      <div
                        className="custom-dropdown-menu user-menu"
                        style={{
                          left: "0",
                          minWidth: "180px",
                          fontSize: "1rem"
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
                          style={{ padding: "0.75rem 1rem" }}
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
                          style={{ padding: "0.75rem 1rem" }}
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
                      padding: "0.4rem 0.5rem",
                      fontSize: "0.8rem",
                      minWidth: "120px"
                    }}
                    onClick={handleLogin}
                  >
                    <MDBIcon icon="user" className="me-2" />
                    Login
                  </MDBBtn>
                )}

                {/* Barra de búsqueda */}
                <MDBInputGroup
                  tag="form"
                  className="d-flex"
                  style={{
                    minWidth: "250px",
                    maxWidth: "400px"
                  }}
                >
                  <input
                    className="form-control"
                    placeholder="Nombre de un mueble"
                    aria-label="Search"
                    type="Search"
                    value={nombreMueble}
                    onChange={(e) => setNombreMueble(e.target.value)}
                    style={{
                      fontSize: "0.9rem",
                      padding: "0.5rem 0.75rem"
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
                      fontSize: "0.9rem",
                      padding: "0.5rem 0.75rem"
                    }}
                    onClick={handleSearch}
                  >
                    Buscar
                  </MDBBtn>
                </MDBInputGroup>
              </div>
            </>
          )}

          {/* Menu collapse para móvil y tablet */}
          {(isMobile || isTablet) && (
            <MDBCollapse navbar open={openBasic} style={{ width: "100%" }}>
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
          )}
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

        /* Dropdown de usuario posicionado correctamente */
        .custom-dropdown {
          position: relative;
        }

        .custom-dropdown-menu {
          position: absolute;
          top: 100%;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
        }

        .custom-dropdown-item {
          display: block;
          padding: 0.75rem 1rem;
          color: #333;
          text-decoration: none;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s;
        }

        .custom-dropdown-item:hover {
          background-color: #f8f9fa;
          color: #da6429;
        }

        .custom-dropdown-item:last-child {
          border-bottom: none;
        }

        /* Estilos específicos para desktop */
        @media (min-width: 992px) {
          .custom-dropdown-menu {
            position: absolute;
            top: 100%;
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
          }
        }
      `}
      </style>
    </>
  );
}

export default Menu;