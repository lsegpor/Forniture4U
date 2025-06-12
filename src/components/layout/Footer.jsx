import { MDBFooter, MDBContainer, MDBRow, MDBCol, MDBIcon } from "mdb-react-ui-kit";
import { useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";

/**
 * Componente que muestra el pie de página con información completa y redes sociales.
 * @component
 */
function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Estados para controlar los dropdowns
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <>
      <MDBFooter
        className="text-center text-lg-start"
        style={{
          backgroundColor: "#e2d0c6",
          color: "#332f2d",
          marginTop: "auto"
        }}
      >
        {/* Layout para móvil y tablet */}
        {(isMobile || isTablet) && (
          <section
            className="p-4"
            style={{
              padding: isMobile ? "2rem 1rem" : "2.5rem 1.5rem"
            }}
          >
            <MDBContainer fluid>
              {/* Primera fila: Enlaces y Soporte */}
              <MDBRow className="mb-4 g-2">
                <MDBCol xs={6} sm={6} className="text-center">
                  <div
                    className="dropdown-trigger"
                    onClick={() => toggleDropdown('enlaces')}
                    style={{
                      cursor: "pointer",
                      padding: isMobile ? "0.75rem 0.5rem" : "1rem",
                      backgroundColor: activeDropdown === 'enlaces' ? 'rgba(218, 100, 41, 0.1)' : 'transparent',
                      borderRadius: "8px",
                      transition: "background-color 0.3s ease",
                      minHeight: "60px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column"
                    }}
                  >
                    <h6
                      className="text-uppercase fw-bold mb-0"
                      style={{
                        fontSize: isMobile ? "0.9rem" : "1.1rem"
                      }}
                    >
                      Enlaces <MDBIcon icon={activeDropdown === 'enlaces' ? "chevron-up" : "chevron-down"} className="ms-1" size="sm" />
                    </h6>
                  </div>

                  {activeDropdown === 'enlaces' && (
                    <div
                      className="dropdown-content"
                      style={{
                        marginTop: "0.5rem",
                        padding: "1rem 0.5rem",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        animation: "slideDown 0.3s ease"
                      }}
                    >
                      <div style={{ lineHeight: "2" }}>
                        <p style={{ marginBottom: "0.5rem" }}>
                          <a
                            href="#!"
                            className="text-reset text-decoration-none"
                            style={{
                              fontSize: isMobile ? "0.8rem" : "0.9rem",
                              transition: "color 0.3s ease",
                            }}
                            onMouseEnter={(e) => e.target.style.color = "#da6429"}
                            onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                          >
                            Productos
                          </a>
                        </p>
                        <p style={{ marginBottom: "0.5rem" }}>
                          <a
                            href="#!"
                            className="text-reset text-decoration-none"
                            style={{
                              fontSize: isMobile ? "0.8rem" : "0.9rem",
                              transition: "color 0.3s ease",
                            }}
                            onMouseEnter={(e) => e.target.style.color = "#da6429"}
                            onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                          >
                            Catálogo
                          </a>
                        </p>
                        <p style={{ marginBottom: "0.5rem" }}>
                          <a
                            href="#!"
                            className="text-reset text-decoration-none"
                            style={{
                              fontSize: isMobile ? "0.8rem" : "0.9rem",
                              transition: "color 0.3s ease",
                            }}
                            onMouseEnter={(e) => e.target.style.color = "#da6429"}
                            onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                          >
                            Ofertas
                          </a>
                        </p>
                        <p style={{ marginBottom: "0.5rem" }}>
                          <a
                            href="#!"
                            className="text-reset text-decoration-none"
                            style={{
                              fontSize: isMobile ? "0.8rem" : "0.9rem",
                              transition: "color 0.3s ease",
                            }}
                            onMouseEnter={(e) => e.target.style.color = "#da6429"}
                            onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                          >
                            Contacto
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                </MDBCol>

                <MDBCol xs={6} sm={6} className="text-center">
                  <div
                    className="dropdown-trigger"
                    onClick={() => toggleDropdown('soporte')}
                    style={{
                      cursor: "pointer",
                      padding: isMobile ? "0.75rem 0.5rem" : "1rem",
                      backgroundColor: activeDropdown === 'soporte' ? 'rgba(218, 100, 41, 0.1)' : 'transparent',
                      borderRadius: "8px",
                      transition: "background-color 0.3s ease",
                      minHeight: "60px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column"
                    }}
                  >
                    <h6
                      className="text-uppercase fw-bold mb-0"
                      style={{
                        fontSize: isMobile ? "0.9rem" : "1.1rem"
                      }}
                    >
                      Soporte <MDBIcon icon={activeDropdown === 'soporte' ? "chevron-up" : "chevron-down"} className="ms-1" size="sm" />
                    </h6>
                  </div>

                  {activeDropdown === 'soporte' && (
                    <div
                      className="dropdown-content"
                      style={{
                        marginTop: "0.5rem",
                        padding: "1rem 0.5rem",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        animation: "slideDown 0.3s ease"
                      }}
                    >
                      <div style={{ lineHeight: "2" }}>
                        <p style={{ marginBottom: "0.5rem" }}>
                          <a
                            href="#!"
                            className="text-reset text-decoration-none"
                            style={{
                              fontSize: isMobile ? "0.8rem" : "0.9rem",
                              transition: "color 0.3s ease",
                            }}
                            onMouseEnter={(e) => e.target.style.color = "#da6429"}
                            onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                          >
                            Centro de ayuda
                          </a>
                        </p>
                        <p style={{ marginBottom: "0.5rem" }}>
                          <a
                            href="#!"
                            className="text-reset text-decoration-none"
                            style={{
                              fontSize: isMobile ? "0.8rem" : "0.9rem",
                              transition: "color 0.3s ease",
                            }}
                            onMouseEnter={(e) => e.target.style.color = "#da6429"}
                            onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                          >
                            Envíos y devoluciones
                          </a>
                        </p>
                        <p style={{ marginBottom: "0.5rem" }}>
                          <a
                            href="#!"
                            className="text-reset text-decoration-none"
                            style={{
                              fontSize: isMobile ? "0.8rem" : "0.9rem",
                              transition: "color 0.3s ease",
                            }}
                            onMouseEnter={(e) => e.target.style.color = "#da6429"}
                            onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                          >
                            Garantía
                          </a>
                        </p>
                        <p style={{ marginBottom: "0.5rem" }}>
                          <a
                            href="#!"
                            className="text-reset text-decoration-none"
                            style={{
                              fontSize: isMobile ? "0.8rem" : "0.9rem",
                              transition: "color 0.3s ease",
                            }}
                            onMouseEnter={(e) => e.target.style.color = "#da6429"}
                            onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                          >
                            FAQs
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                </MDBCol>
              </MDBRow>

              {/* Segunda fila: Contacto y Síguenos */}
              <MDBRow className="g-2">
                <MDBCol xs={6} sm={6} className="text-center">
                  <div
                    className="dropdown-trigger"
                    onClick={() => toggleDropdown('contacto')}
                    style={{
                      cursor: "pointer",
                      padding: isMobile ? "0.75rem 0.5rem" : "1rem",
                      backgroundColor: activeDropdown === 'contacto' ? 'rgba(218, 100, 41, 0.1)' : 'transparent',
                      borderRadius: "8px",
                      transition: "background-color 0.3s ease",
                      minHeight: "60px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column"
                    }}
                  >
                    <h6
                      className="text-uppercase fw-bold mb-0"
                      style={{
                        fontSize: isMobile ? "0.9rem" : "1.1rem"
                      }}
                    >
                      Contacto <MDBIcon icon={activeDropdown === 'contacto' ? "chevron-up" : "chevron-down"} className="ms-1" size="sm" />
                    </h6>
                  </div>

                  {activeDropdown === 'contacto' && (
                    <div
                      className="dropdown-content"
                      style={{
                        marginTop: "0.5rem",
                        padding: "1rem 0.5rem",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        animation: "slideDown 0.3s ease"
                      }}
                    >
                      <div style={{ lineHeight: "1.8" }}>
                        <p
                          style={{
                            marginBottom: "0.75rem",
                            fontSize: isMobile ? "0.75rem" : "0.9rem",
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            textAlign: "left"
                          }}
                        >
                          <MDBIcon
                            icon="home"
                            className="me-2 mt-1"
                            style={{
                              fontSize: isMobile ? "0.8rem" : "1rem",
                              minWidth: "1rem",
                              flexShrink: 0
                            }}
                          />
                          <span>Av. Principal 123, Ciudad</span>
                        </p>
                        <p
                          style={{
                            marginBottom: "0.75rem",
                            fontSize: isMobile ? "0.75rem" : "0.9rem",
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            textAlign: "left"
                          }}
                        >
                          <MDBIcon
                            icon="envelope"
                            className="me-2 mt-1"
                            style={{
                              fontSize: isMobile ? "0.8rem" : "1rem",
                              minWidth: "1rem",
                              flexShrink: 0
                            }}
                          />
                          <a
                            href="mailto:info@forniture4u.com"
                            className="text-reset text-decoration-none"
                            style={{
                              transition: "color 0.3s ease",
                              wordBreak: "break-all"
                            }}
                            onMouseEnter={(e) => e.target.style.color = "#da6429"}
                            onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                          >
                            info@forniture4u.com
                          </a>
                        </p>
                        <p
                          style={{
                            marginBottom: "0.75rem",
                            fontSize: isMobile ? "0.75rem" : "0.9rem",
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            textAlign: "left"
                          }}
                        >
                          <MDBIcon
                            icon="phone"
                            className="me-2 mt-1"
                            style={{
                              fontSize: isMobile ? "0.8rem" : "1rem",
                              minWidth: "1rem",
                              flexShrink: 0
                            }}
                          />
                          <a
                            href="tel:+34900123456"
                            className="text-reset text-decoration-none"
                            style={{ transition: "color 0.3s ease" }}
                            onMouseEnter={(e) => e.target.style.color = "#da6429"}
                            onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                          >
                            +34 900 123 456
                          </a>
                        </p>
                        <p
                          style={{
                            marginBottom: "0.75rem",
                            fontSize: isMobile ? "0.75rem" : "0.9rem",
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            textAlign: "left"
                          }}
                        >
                          <MDBIcon
                            icon="clock"
                            className="me-2 mt-1"
                            style={{
                              fontSize: isMobile ? "0.8rem" : "1rem",
                              minWidth: "1rem",
                              flexShrink: 0
                            }}
                          />
                          <span>Lun - Vie: 9:00 - 18:00</span>
                        </p>
                      </div>
                    </div>
                  )}
                </MDBCol>

                <MDBCol xs={6} sm={6} className="text-center">
                  <div
                    className="dropdown-trigger"
                    onClick={() => toggleDropdown('siguenos')}
                    style={{
                      cursor: "pointer",
                      padding: isMobile ? "0.75rem 0.5rem" : "1rem",
                      backgroundColor: activeDropdown === 'siguenos' ? 'rgba(218, 100, 41, 0.1)' : 'transparent',
                      borderRadius: "8px",
                      transition: "background-color 0.3s ease",
                      minHeight: "60px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column"
                    }}
                  >
                    <h6
                      className="text-uppercase fw-bold mb-0"
                      style={{
                        fontSize: isMobile ? "0.9rem" : "1.1rem"
                      }}
                    >
                      Síguenos <MDBIcon icon={activeDropdown === 'siguenos' ? "chevron-up" : "chevron-down"} className="ms-1" size="sm" />
                    </h6>
                  </div>

                  {activeDropdown === 'siguenos' && (
                    <div
                      className="dropdown-content"
                      style={{
                        marginTop: "0.5rem",
                        padding: "1rem 0.5rem",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        animation: "slideDown 0.3s ease"
                      }}
                    >
                      <div
                        className="d-flex justify-content-center flex-wrap"
                        style={{ gap: isMobile ? "0.75rem" : "1rem" }}
                      >
                        <a
                          href="#!"
                          className="text-reset"
                          style={{
                            fontSize: isMobile ? "1.25rem" : "1.5rem",
                            transition: "color 0.3s ease, transform 0.3s ease"
                          }}
                          title="Facebook"
                          onMouseEnter={(e) => {
                            e.target.style.color = "#1877f2";
                            e.target.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = "#332f2d";
                            e.target.style.transform = "scale(1)";
                          }}
                        >
                          <MDBIcon fab icon="facebook-f" />
                        </a>

                        <a
                          href="#!"
                          className="text-reset"
                          style={{
                            fontSize: isMobile ? "1.25rem" : "1.5rem",
                            transition: "color 0.3s ease, transform 0.3s ease"
                          }}
                          title="Instagram"
                          onMouseEnter={(e) => {
                            e.target.style.color = "#E4405F";
                            e.target.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = "#332f2d";
                            e.target.style.transform = "scale(1)";
                          }}
                        >
                          <MDBIcon fab icon="instagram" />
                        </a>

                        <a
                          href="#!"
                          className="text-reset"
                          style={{
                            fontSize: isMobile ? "1.25rem" : "1.5rem",
                            transition: "color 0.3s ease, transform 0.3s ease"
                          }}
                          title="Twitter"
                          onMouseEnter={(e) => {
                            e.target.style.color = "#1DA1F2";
                            e.target.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = "#332f2d";
                            e.target.style.transform = "scale(1)";
                          }}
                        >
                          <MDBIcon fab icon="twitter" />
                        </a>

                        <a
                          href="https://wa.me/34900123456"
                          className="text-reset"
                          style={{
                            fontSize: isMobile ? "1.25rem" : "1.5rem",
                            transition: "color 0.3s ease, transform 0.3s ease"
                          }}
                          title="WhatsApp"
                          target="_blank"
                          rel="noopener noreferrer"
                          onMouseEnter={(e) => {
                            e.target.style.color = "#25D366";
                            e.target.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = "#332f2d";
                            e.target.style.transform = "scale(1)";
                          }}
                        >
                          <MDBIcon fab icon="whatsapp" />
                        </a>
                      </div>
                    </div>
                  )}
                </MDBCol>
              </MDBRow>
            </MDBContainer>
          </section>
        )}

        {/* Layout para desktop - original */}
        {!isMobile && !isTablet && (
          <section
            className="pt-4 pb-0 mt-2"
            style={{
              padding: "3rem 2rem"
            }}
          >
            <MDBContainer fluid>
              <MDBRow>
                {/* Enlaces útiles */}
                <MDBCol
                  lg="3"
                  md="6"
                  xs="6"
                  className="mb-4 text-center"
                >
                  <h6
                    className="text-uppercase fw-bold mb-3"
                    style={{
                      fontSize: "1.2rem",
                      marginBottom: "1.5rem"
                    }}
                  >
                    Enlaces
                  </h6>
                  <div style={{ lineHeight: "1.8" }}>
                    <p style={{ marginBottom: "0.75rem" }}>
                      <a
                        href="#!"
                        className="text-reset text-decoration-none"
                        style={{
                          fontSize: "0.9rem",
                          transition: "color 0.3s ease",
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#da6429"}
                        onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                      >
                        Productos
                      </a>
                    </p>
                    <p style={{ marginBottom: "0.75rem" }}>
                      <a
                        href="#!"
                        className="text-reset text-decoration-none"
                        style={{
                          fontSize: "0.9rem",
                          transition: "color 0.3s ease",
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#da6429"}
                        onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                      >
                        Catálogo
                      </a>
                    </p>
                    <p style={{ marginBottom: "0.75rem" }}>
                      <a
                        href="#!"
                        className="text-reset text-decoration-none"
                        style={{
                          fontSize: "0.9rem",
                          transition: "color 0.3s ease",
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#da6429"}
                        onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                      >
                        Ofertas
                      </a>
                    </p>
                    <p style={{ marginBottom: "0.75rem" }}>
                      <a
                        href="#!"
                        className="text-reset text-decoration-none"
                        style={{
                          fontSize: "0.9rem",
                          transition: "color 0.3s ease",
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#da6429"}
                        onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                      >
                        Contacto
                      </a>
                    </p>
                  </div>
                </MDBCol>

                {/* Atención al cliente */}
                <MDBCol
                  lg="3"
                  md="6"
                  xs="6"
                  className="mb-4 text-center"
                >
                  <h6
                    className="text-uppercase fw-bold mb-3"
                    style={{
                      fontSize: "1.2rem",
                      marginBottom: "1.5rem"
                    }}
                  >
                    Soporte
                  </h6>
                  <div style={{ lineHeight: "1.8" }}>
                    <p style={{ marginBottom: "0.75rem" }}>
                      <a
                        href="#!"
                        className="text-reset text-decoration-none"
                        style={{
                          fontSize: "0.9rem",
                          transition: "color 0.3s ease",
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#da6429"}
                        onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                      >
                        Centro de ayuda
                      </a>
                    </p>
                    <p style={{ marginBottom: "0.75rem" }}>
                      <a
                        href="#!"
                        className="text-reset text-decoration-none"
                        style={{
                          fontSize: "0.9rem",
                          transition: "color 0.3s ease",
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#da6429"}
                        onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                      >
                        Envíos y devoluciones
                      </a>
                    </p>
                    <p style={{ marginBottom: "0.75rem" }}>
                      <a
                        href="#!"
                        className="text-reset text-decoration-none"
                        style={{
                          fontSize: "0.9rem",
                          transition: "color 0.3s ease",
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#da6429"}
                        onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                      >
                        Garantía
                      </a>
                    </p>
                    <p style={{ marginBottom: "0.75rem" }}>
                      <a
                        href="#!"
                        className="text-reset text-decoration-none"
                        style={{
                          fontSize: "0.9rem",
                          transition: "color 0.3s ease",
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#da6429"}
                        onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                      >
                        FAQs
                      </a>
                    </p>
                  </div>
                </MDBCol>

                {/* Información de contacto */}
                <MDBCol
                  lg="3"
                  md="6"
                  xs="6"
                  className="mb-4 text-center"
                >
                  <h6
                    className="text-uppercase fw-bold mb-3"
                    style={{
                      fontSize: "1.2rem",
                      marginBottom: "1.5rem"
                    }}
                  >
                    Contacto
                  </h6>
                  <div style={{ lineHeight: "2" }}>
                    <p
                      style={{
                        marginBottom: "0.75rem",
                        fontSize: "0.9rem"
                      }}
                    >
                      <MDBIcon
                        icon="home"
                        className="me-2"
                        style={{
                          fontSize: "1rem",
                          minWidth: "1.2rem"
                        }}
                      />
                      Av. Principal 123, Ciudad
                    </p>
                    <p
                      style={{
                        marginBottom: "0.75rem",
                        fontSize: "0.9rem"
                      }}
                    >
                      <MDBIcon
                        icon="envelope"
                        className="me-2"
                        style={{
                          fontSize: "1rem",
                          minWidth: "1.2rem"
                        }}
                      />
                      <a
                        href="mailto:info@forniture4u.com"
                        className="text-reset text-decoration-none"
                        style={{ transition: "color 0.3s ease" }}
                        onMouseEnter={(e) => e.target.style.color = "#da6429"}
                        onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                      >
                        info@forniture4u.com
                      </a>
                    </p>
                    <p
                      style={{
                        marginBottom: "0.75rem",
                        fontSize: "0.9rem"
                      }}
                    >
                      <MDBIcon
                        icon="phone"
                        className="me-2"
                        style={{
                          fontSize: "1rem",
                          minWidth: "1.2rem"
                        }}
                      />
                      <a
                        href="tel:+34900123456"
                        className="text-reset text-decoration-none"
                        style={{ transition: "color 0.3s ease" }}
                        onMouseEnter={(e) => e.target.style.color = "#da6429"}
                        onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                      >
                        +34 900 123 456
                      </a>
                    </p>
                    <p
                      style={{
                        marginBottom: "0.75rem",
                        fontSize: "0.9rem"
                      }}
                    >
                      <MDBIcon
                        icon="clock"
                        className="me-2"
                        style={{
                          fontSize: "1rem",
                          minWidth: "1.2rem"
                        }}
                      />
                      Lun - Vie: 9:00 - 18:00
                    </p>
                  </div>
                </MDBCol>

                {/* Redes sociales */}
                <MDBCol
                  lg="3"
                  md="6"
                  xs="12"
                  className="mb-4 text-center"
                >
                  <h6
                    className="text-uppercase fw-bold mb-3"
                    style={{
                      fontSize: "1.2rem",
                      marginBottom: "1.5rem"
                    }}
                  >
                    Síguenos
                  </h6>
                  <div style={{ lineHeight: "1.5" }}>
                    <div
                      className="d-flex align-items-center"
                      style={{
                        marginBottom: "0.75rem",
                        justifyContent: "center"
                      }}
                    >
                      <a
                        href="#!"
                        className="me-2 text-reset"
                        style={{
                          fontSize: "1.2rem",
                          transition: "color 0.3s ease, transform 0.3s ease"
                        }}
                        title="Facebook"
                        onMouseEnter={(e) => {
                          e.target.style.color = "#1877f2";
                          e.target.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = "#332f2d";
                          e.target.style.transform = "scale(1)";
                        }}
                      >
                        <MDBIcon fab icon="facebook-f" />
                      </a>
                      <span
                        className="small"
                        style={{ fontSize: "0.8rem" }}
                      >
                        @forniture4u
                      </span>
                    </div>

                    <div
                      className="d-flex align-items-center"
                      style={{
                        marginBottom: "0.75rem",
                        justifyContent: "center"
                      }}
                    >
                      <a
                        href="#!"
                        className="me-2 text-reset"
                        style={{
                          fontSize: "1.2rem",
                          transition: "color 0.3s ease, transform 0.3s ease"
                        }}
                        title="Instagram"
                        onMouseEnter={(e) => {
                          e.target.style.color = "#E4405F";
                          e.target.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = "#332f2d";
                          e.target.style.transform = "scale(1)";
                        }}
                      >
                        <MDBIcon fab icon="instagram" />
                      </a>
                      <span
                        className="small"
                        style={{ fontSize: "0.8rem" }}
                      >
                        @forniture4u_oficial
                      </span>
                    </div>

                    <div
                      className="d-flex align-items-center"
                      style={{
                        marginBottom: "0.75rem",
                        justifyContent: "center"
                      }}
                    >
                      <a
                        href="#!"
                        className="me-2 text-reset"
                        style={{
                          fontSize: "1.2rem",
                          transition: "color 0.3s ease, transform 0.3s ease"
                        }}
                        title="Twitter"
                        onMouseEnter={(e) => {
                          e.target.style.color = "#1DA1F2";
                          e.target.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = "#332f2d";
                          e.target.style.transform = "scale(1)";
                        }}
                      >
                        <MDBIcon fab icon="twitter" />
                      </a>
                      <span
                        className="small"
                        style={{ fontSize: "0.8rem" }}
                      >
                        @forniture4u
                      </span>
                    </div>

                    <div
                      className="d-flex align-items-center"
                      style={{
                        marginBottom: "0.75rem",
                        justifyContent: "center"
                      }}
                    >
                      <a
                        href="https://wa.me/34900123456"
                        className="me-2 text-reset"
                        style={{
                          fontSize: "1.2rem",
                          transition: "color 0.3s ease, transform 0.3s ease"
                        }}
                        title="WhatsApp"
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={(e) => {
                          e.target.style.color = "#25D366";
                          e.target.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = "#332f2d";
                          e.target.style.transform = "scale(1)";
                        }}
                      >
                        <MDBIcon fab icon="whatsapp" />
                      </a>
                      <span
                        className="small"
                        style={{ fontSize: "0.8rem" }}
                      >
                        +34 900 123 456
                      </span>
                    </div>
                  </div>
                </MDBCol>
              </MDBRow>
            </MDBContainer>
          </section>
        )}

        {/* Línea divisoria y copyright */}
        <div
          className="text-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            padding: isMobile ? "1.5rem 1rem" : "1rem 2rem",
            fontSize: isMobile ? "0.8rem" : "0.9rem",
            lineHeight: isMobile ? "1.6" : "1.4"
          }}
        >
          <div style={{
            display: isMobile ? "block" : "inline",
            marginBottom: isMobile ? "0.5rem" : "0"
          }}>
            © {new Date().getFullYear()} Forniture4U - Todos los derechos reservados
          </div>
          {isMobile && <br />}
          {!isMobile && " | "}
          <a
            className="text-reset fw-bold text-decoration-none"
            href="#!"
            style={{
              transition: "color 0.3s ease",
              display: isMobile ? "inline-block" : "inline",
              margin: isMobile ? "0 0.5rem" : "0"
            }}
            onMouseEnter={(e) => e.target.style.color = "#da6429"}
            onMouseLeave={(e) => e.target.style.color = "#332f2d"}
          >
            Política de Privacidad
          </a>
          {!isMobile && " | "}
          {isMobile && " • "}
          <a
            className="text-reset fw-bold text-decoration-none"
            href="#!"
            style={{
              transition: "color 0.3s ease",
              display: isMobile ? "inline-block" : "inline",
              margin: isMobile ? "0 0.5rem" : "0"
            }}
            onMouseEnter={(e) => e.target.style.color = "#da6429"}
            onMouseLeave={(e) => e.target.style.color = "#332f2d"}
          >
            Términos de Uso
          </a>
        </div>
      </MDBFooter>

      {/* Estilos CSS para las animaciones */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-trigger:hover {
          background-color: rgba(218, 100, 41, 0.05) !important;
        }

        .dropdown-content {
          border-left: 3px solid #da6429;
        }

        @media (max-width: 991px) {
          .dropdown-trigger {
            border: 1px solid rgba(218, 100, 41, 0.2);
          }
        }
      `}</style>
    </>
  );
}

export default Footer;