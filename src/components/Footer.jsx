import { MDBFooter, MDBContainer, MDBRow, MDBCol, MDBIcon } from "mdb-react-ui-kit";
import { useMediaQuery, useTheme } from "@mui/material";

/**
 * Componente que muestra el pie de página con información completa y redes sociales.
 * @component
 */
function Footer() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <>
      <MDBFooter
        className="text-center text-lg-start"
        style={{
          backgroundColor: "#e2d0c6",
          color: "#332f2d",
          marginTop: "auto" // Para sticky footer si es necesario
        }}
      >
        <section
          className="p-4"
          style={{
            padding: isMobile ? "2rem 1rem" : isTablet ? "2.5rem 1.5rem" : "3rem 2rem"
          }}
        >
          <MDBContainer fluid>
            <MDBRow>
              {/* Información de la empresa */}
              <MDBCol
                lg="3"
                md="6"
                xs="12"
                className={`mb-4 ${isMobile ? 'text-center' : 'text-lg-start'}`}
                style={{
                  marginBottom: isMobile ? "2rem" : "1rem"
                }}
              >
                <h5
                  className="text-uppercase fw-bold mb-3"
                  style={{
                    fontSize: isMobile ? "1.2rem" : isTablet ? "1.3rem" : "1.5rem",
                    marginBottom: isMobile ? "1rem" : "1.5rem"
                  }}
                >
                  Forniture4U
                </h5>
                <p
                  style={{
                    fontSize: isMobile ? "0.9rem" : "1rem",
                    lineHeight: isMobile ? "1.4" : "1.6",
                    marginBottom: isMobile ? "1rem" : "0"
                  }}
                >
                  Tu tienda de confianza para muebles de calidad. Diseños únicos
                  y materiales premium para transformar tu hogar.
                </p>
              </MDBCol>

              {/* Enlaces útiles */}
              <MDBCol
                lg="2"
                md="6"
                xs="6"
                className={`mb-4 ${isMobile ? 'text-center' : 'text-lg-start'}`}
                style={{
                  marginBottom: isMobile ? "2rem" : "1rem"
                }}
              >
                <h6
                  className="text-uppercase fw-bold mb-3"
                  style={{
                    fontSize: isMobile ? "1rem" : isTablet ? "1.1rem" : "1.2rem",
                    marginBottom: isMobile ? "1rem" : "1.5rem"
                  }}
                >
                  Enlaces
                </h6>
                <div style={{ lineHeight: isMobile ? "2" : "1.8" }}>
                  <p style={{ marginBottom: isMobile ? "0.5rem" : "0.75rem" }}>
                    <a
                      href="#!"
                      className="text-reset text-decoration-none"
                      style={{
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        transition: "color 0.3s ease",
                      }}
                      onMouseEnter={(e) => e.target.style.color = "#da6429"}
                      onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                    >
                      Productos
                    </a>
                  </p>
                  <p style={{ marginBottom: isMobile ? "0.5rem" : "0.75rem" }}>
                    <a
                      href="#!"
                      className="text-reset text-decoration-none"
                      style={{
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        transition: "color 0.3s ease",
                      }}
                      onMouseEnter={(e) => e.target.style.color = "#da6429"}
                      onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                    >
                      Catálogo
                    </a>
                  </p>
                  <p style={{ marginBottom: isMobile ? "0.5rem" : "0.75rem" }}>
                    <a
                      href="#!"
                      className="text-reset text-decoration-none"
                      style={{
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        transition: "color 0.3s ease",
                      }}
                      onMouseEnter={(e) => e.target.style.color = "#da6429"}
                      onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                    >
                      Ofertas
                    </a>
                  </p>
                  <p style={{ marginBottom: isMobile ? "0.5rem" : "0.75rem" }}>
                    <a
                      href="#!"
                      className="text-reset text-decoration-none"
                      style={{
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
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
                lg="2"
                md="6"
                xs="6"
                className={`mb-4 ${isMobile ? 'text-center' : 'text-lg-start'}`}
                style={{
                  marginBottom: isMobile ? "2rem" : "1rem"
                }}
              >
                <h6
                  className="text-uppercase fw-bold mb-3"
                  style={{
                    fontSize: isMobile ? "1rem" : isTablet ? "1.1rem" : "1.2rem",
                    marginBottom: isMobile ? "1rem" : "1.5rem"
                  }}
                >
                  Soporte
                </h6>
                <div style={{ lineHeight: isMobile ? "2" : "1.8" }}>
                  <p style={{ marginBottom: isMobile ? "0.5rem" : "0.75rem" }}>
                    <a
                      href="#!"
                      className="text-reset text-decoration-none"
                      style={{
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        transition: "color 0.3s ease",
                      }}
                      onMouseEnter={(e) => e.target.style.color = "#da6429"}
                      onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                    >
                      Centro de ayuda
                    </a>
                  </p>
                  <p style={{ marginBottom: isMobile ? "0.5rem" : "0.75rem" }}>
                    <a
                      href="#!"
                      className="text-reset text-decoration-none"
                      style={{
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        transition: "color 0.3s ease",
                      }}
                      onMouseEnter={(e) => e.target.style.color = "#da6429"}
                      onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                    >
                      Envíos y devoluciones
                    </a>
                  </p>
                  <p style={{ marginBottom: isMobile ? "0.5rem" : "0.75rem" }}>
                    <a
                      href="#!"
                      className="text-reset text-decoration-none"
                      style={{
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                        transition: "color 0.3s ease",
                      }}
                      onMouseEnter={(e) => e.target.style.color = "#da6429"}
                      onMouseLeave={(e) => e.target.style.color = "#332f2d"}
                    >
                      Garantía
                    </a>
                  </p>
                  <p style={{ marginBottom: isMobile ? "0.5rem" : "0.75rem" }}>
                    <a
                      href="#!"
                      className="text-reset text-decoration-none"
                      style={{
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
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
                xs="12"
                className={`mb-4 ${isMobile ? 'text-center' : 'text-lg-start'}`}
                style={{
                  marginBottom: isMobile ? "2rem" : "1rem"
                }}
              >
                <h6
                  className="text-uppercase fw-bold mb-3"
                  style={{
                    fontSize: isMobile ? "1rem" : isTablet ? "1.1rem" : "1.2rem",
                    marginBottom: isMobile ? "1rem" : "1.5rem"
                  }}
                >
                  Contacto
                </h6>
                <div style={{ lineHeight: isMobile ? "1.8" : "1.6" }}>
                  <p
                    style={{
                      marginBottom: isMobile ? "0.75rem" : "0.5rem",
                      fontSize: isMobile ? "0.85rem" : "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isMobile ? "center" : "flex-start"
                    }}
                  >
                    <MDBIcon
                      icon="home"
                      className="me-2"
                      style={{
                        fontSize: isMobile ? "0.9rem" : "1rem",
                        minWidth: "1.2rem"
                      }}
                    />
                    Av. Principal 123, Ciudad
                  </p>
                  <p
                    style={{
                      marginBottom: isMobile ? "0.75rem" : "0.5rem",
                      fontSize: isMobile ? "0.85rem" : "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isMobile ? "center" : "flex-start"
                    }}
                  >
                    <MDBIcon
                      icon="envelope"
                      className="me-2"
                      style={{
                        fontSize: isMobile ? "0.9rem" : "1rem",
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
                      marginBottom: isMobile ? "0.75rem" : "0.5rem",
                      fontSize: isMobile ? "0.85rem" : "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isMobile ? "center" : "flex-start"
                    }}
                  >
                    <MDBIcon
                      icon="phone"
                      className="me-2"
                      style={{
                        fontSize: isMobile ? "0.9rem" : "1rem",
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
                      marginBottom: isMobile ? "0.75rem" : "0.5rem",
                      fontSize: isMobile ? "0.85rem" : "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isMobile ? "center" : "flex-start"
                    }}
                  >
                    <MDBIcon
                      icon="clock"
                      className="me-2"
                      style={{
                        fontSize: isMobile ? "0.9rem" : "1rem",
                        minWidth: "1.2rem"
                      }}
                    />
                    Lun - Vie: 9:00 - 18:00
                  </p>
                </div>
              </MDBCol>

              {/* Redes sociales */}
              <MDBCol
                lg="2"
                md="6"
                xs="12"
                className={`mb-4 ${isMobile ? 'text-center' : 'text-lg-start'}`}
                style={{
                  marginBottom: isMobile ? "1rem" : "1rem"
                }}
              >
                <h6
                  className="text-uppercase fw-bold mb-3"
                  style={{
                    fontSize: isMobile ? "1rem" : isTablet ? "1.1rem" : "1.2rem",
                    marginBottom: isMobile ? "1rem" : "1.5rem"
                  }}
                >
                  Síguenos
                </h6>
                <div
                  className={isMobile ? "d-flex justify-content-center flex-wrap" : "d-flex flex-column"}
                  style={{
                    gap: isMobile ? "1rem" : "0.5rem"
                  }}
                >
                  <div
                    className="d-flex align-items-center"
                    style={{
                      marginBottom: isMobile ? "0" : "0.75rem",
                      justifyContent: isMobile ? "center" : "flex-start"
                    }}
                  >
                    <a
                      href="#!"
                      className="me-2 text-reset"
                      style={{
                        fontSize: isMobile ? "1.5rem" : "1.2rem",
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
                    {!isMobile && (
                      <span
                        className="small"
                        style={{ fontSize: "0.8rem" }}
                      >
                        @forniture4u
                      </span>
                    )}
                  </div>

                  <div
                    className="d-flex align-items-center"
                    style={{
                      marginBottom: isMobile ? "0" : "0.75rem",
                      justifyContent: isMobile ? "center" : "flex-start"
                    }}
                  >
                    <a
                      href="#!"
                      className="me-2 text-reset"
                      style={{
                        fontSize: isMobile ? "1.5rem" : "1.2rem",
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
                    {!isMobile && (
                      <span
                        className="small"
                        style={{ fontSize: "0.8rem" }}
                      >
                        @forniture4u_oficial
                      </span>
                    )}
                  </div>

                  <div
                    className="d-flex align-items-center"
                    style={{
                      marginBottom: isMobile ? "0" : "0.75rem",
                      justifyContent: isMobile ? "center" : "flex-start"
                    }}
                  >
                    <a
                      href="#!"
                      className="me-2 text-reset"
                      style={{
                        fontSize: isMobile ? "1.5rem" : "1.2rem",
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
                    {!isMobile && (
                      <span
                        className="small"
                        style={{ fontSize: "0.8rem" }}
                      >
                        @forniture4u
                      </span>
                    )}
                  </div>

                  <div
                    className="d-flex align-items-center"
                    style={{
                      marginBottom: isMobile ? "0" : "0.75rem",
                      justifyContent: isMobile ? "center" : "flex-start"
                    }}
                  >
                    <a
                      href="https://wa.me/34900123456"
                      className="me-2 text-reset"
                      style={{
                        fontSize: isMobile ? "1.5rem" : "1.2rem",
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
                    {!isMobile && (
                      <span
                        className="small"
                        style={{ fontSize: "0.8rem" }}
                      >
                        +34 900 123 456
                      </span>
                    )}
                  </div>
                </div>
              </MDBCol>
            </MDBRow>
          </MDBContainer>
        </section>

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
    </>
  );
}

export default Footer;