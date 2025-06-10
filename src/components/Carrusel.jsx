import {
  MDBCarousel,
  MDBCarouselItem,
  MDBBtn,
  MDBContainer,
} from "mdb-react-ui-kit";
import { useMediaQuery, useTheme } from "@mui/material";
import foto1 from "../assets/ikea1.jpeg";
import foto2 from "../assets/ikea2.jpeg";
import foto3 from "../assets/ikea3.jpeg";

/**
 * Componente Carrusel que muestra un carrusel de imágenes con descripciones.
 * @returns {JSX.Element} El componente Carrusel.
 */
function Carrusel() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <>
      <MDBContainer
        className="my-4"
        style={{
          maxWidth: isMobile ? "95%" : isTablet ? "80%" : "70%",
          margin: "0 auto",
          padding: isMobile ? "0 0.5rem" : "0 1rem"
        }}
      >
        <MDBCarousel
          fade
          showIndicators
          showControls
          style={{
            borderRadius: isMobile ? "8px" : "12px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}
        >
          <MDBCarouselItem className="active">
            <img
              src={foto1}
              alt="Bienvenidos a Forniture4U"
              className="d-block w-100"
              style={{
                height: isMobile ? "250px" : isTablet ? "350px" : "400px",
                objectFit: "cover"
              }}
            />
            <div
              className={isMobile ? "carousel-caption d-block" : "carousel-caption d-none d-md-block"}
              style={{
                ...captionStyle,
                padding: isMobile ? "8px 12px" : isTablet ? "12px 16px" : "15px 20px",
                borderRadius: isMobile ? "4px" : "6px",
                bottom: isMobile ? "10px" : "20px",
                left: isMobile ? "5%" : "10%",
                right: isMobile ? "5%" : "10%",
                fontSize: isMobile ? "0.85rem" : isTablet ? "0.95rem" : "1rem"
              }}
            >
              <h5 style={{
                fontSize: isMobile ? "1.1rem" : isTablet ? "1.3rem" : "1.5rem",
                marginBottom: isMobile ? "0.3rem" : "0.5rem",
                fontWeight: "bold"
              }}>
                Bienvenidos a Forniture4U
              </h5>
              <p style={{
                margin: 0,
                fontSize: isMobile ? "0.8rem" : isTablet ? "0.9rem" : "1rem",
                lineHeight: isMobile ? "1.2" : "1.4"
              }}>
                Los mejores muebles a tu disposición
              </p>
            </div>
          </MDBCarouselItem>

          <MDBCarouselItem>
            <img
              src={foto2}
              alt="Estilo y Comodidad"
              className="d-block w-100"
              style={{
                height: isMobile ? "250px" : isTablet ? "350px" : "400px",
                objectFit: "cover"
              }}
            />
            <div
              className={isMobile ? "carousel-caption d-block" : "carousel-caption d-none d-md-block"}
              style={{
                ...captionStyle,
                padding: isMobile ? "8px 12px" : isTablet ? "12px 16px" : "15px 20px",
                borderRadius: isMobile ? "4px" : "6px",
                bottom: isMobile ? "10px" : "20px",
                left: isMobile ? "5%" : "10%",
                right: isMobile ? "5%" : "10%",
                fontSize: isMobile ? "0.85rem" : isTablet ? "0.95rem" : "1rem"
              }}
            >
              <h5 style={{
                fontSize: isMobile ? "1.1rem" : isTablet ? "1.3rem" : "1.5rem",
                marginBottom: isMobile ? "0.3rem" : "0.5rem",
                fontWeight: "bold"
              }}>
                Estilo y Comodidad
              </h5>
              <p style={{
                margin: 0,
                fontSize: isMobile ? "0.8rem" : isTablet ? "0.9rem" : "1rem",
                lineHeight: isMobile ? "1.2" : "1.4"
              }}>
                Encuentra muebles únicos para tu hogar
              </p>
            </div>
          </MDBCarouselItem>

          <MDBCarouselItem>
            <img
              src={foto3}
              alt="Calidad Garantizada"
              className="d-block w-100"
              style={{
                height: isMobile ? "250px" : isTablet ? "350px" : "400px",
                objectFit: "cover"
              }}
            />
            <div
              className={isMobile ? "carousel-caption d-block" : "carousel-caption d-none d-md-block"}
              style={{
                ...captionStyle,
                padding: isMobile ? "8px 12px" : isTablet ? "12px 16px" : "15px 20px",
                borderRadius: isMobile ? "4px" : "6px",
                bottom: isMobile ? "10px" : "20px",
                left: isMobile ? "5%" : "10%",
                right: isMobile ? "5%" : "10%",
                fontSize: isMobile ? "0.85rem" : isTablet ? "0.95rem" : "1rem"
              }}
            >
              <h5 style={{
                fontSize: isMobile ? "1.1rem" : isTablet ? "1.3rem" : "1.5rem",
                marginBottom: isMobile ? "0.3rem" : "0.5rem",
                fontWeight: "bold"
              }}>
                Calidad Garantizada
              </h5>
              <p style={{
                margin: 0,
                fontSize: isMobile ? "0.8rem" : isTablet ? "0.9rem" : "1rem",
                lineHeight: isMobile ? "1.2" : "1.4"
              }}>
                Comodidad y durabilidad en cada producto
              </p>
            </div>
          </MDBCarouselItem>
        </MDBCarousel>

        {/* Espacio para el texto descriptivo */}
        <MDBContainer
          className="my-5 text-center"
          style={{
            padding: isMobile ? "2rem 1rem" : isTablet ? "3rem 1.5rem" : "3rem 2rem"
          }}
        >
          <h2 style={{
            fontSize: isMobile ? "1.6rem" : isTablet ? "1.8rem" : "2rem",
            marginBottom: isMobile ? "1rem" : "1.5rem",
            color: "#332f2d",
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontWeight: "bold"
          }}>
            ¿Por qué elegirnos?
          </h2>

          <p style={{
            fontSize: isMobile ? "0.95rem" : isTablet ? "1rem" : "1.1rem",
            lineHeight: isMobile ? "1.5" : "1.6",
            color: "#4f4f4f",
            marginBottom: isMobile ? "1.5rem" : "2rem",
            maxWidth: isMobile ? "100%" : isTablet ? "90%" : "80%",
            margin: "0 auto"
          }}>
            En Forniture4U, ofrecemos una amplia gama de muebles modernos y
            funcionales. Nuestra misión es brindarte productos de la más alta
            calidad que se adapten a tus necesidades y estilo.
          </p>

          <MDBBtn
            href="/listadomuebles"
            style={{
              backgroundColor: "#da6429",
              border: "none",
              padding: isMobile ? "0.6rem 1.5rem" : isTablet ? "0.75rem 2rem" : "0.8rem 2.5rem",
              fontSize: isMobile ? "0.9rem" : isTablet ? "1rem" : "1.1rem",
              fontWeight: "500",
              borderRadius: "6px",
              boxShadow: "0 2px 8px rgba(218, 100, 41, 0.3)",
              transition: "all 0.3s ease",
              textTransform: "none"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#c55a24";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(218, 100, 41, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#da6429";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(218, 100, 41, 0.3)";
            }}
          >
            {isMobile ? "Ver Muebles" : "Explora nuestros muebles"}
          </MDBBtn>
        </MDBContainer>
      </MDBContainer>

      {/* Estilos adicionales responsive */}
      <style>{`
        @media (max-width: 768px) {
          .carousel-control-prev,
          .carousel-control-next {
            width: 8% !important;
          }
          
          .carousel-control-prev-icon,
          .carousel-control-next-icon {
            width: 15px !important;
            height: 15px !important;
          }
          
          .carousel-indicators {
            bottom: 5px !important;
          }
          
          .carousel-indicators [data-bs-target] {
            width: 8px !important;
            height: 8px !important;
            margin: 0 2px !important;
          }
        }

        @media (max-width: 576px) {
          .carousel-control-prev,
          .carousel-control-next {
            width: 10% !important;
          }
          
          .carousel-control-prev-icon,
          .carousel-control-next-icon {
            width: 12px !important;
            height: 12px !important;
          }
        }

        /* Mejoras de accesibilidad para móvil */
        @media (hover: none) {
          .carousel-control-prev:hover,
          .carousel-control-next:hover {
            opacity: 0.9 !important;
          }
        }

        /* Transiciones suaves para el carrusel */
        .carousel-item {
          transition: transform 0.6s ease-in-out !important;
        }

        .carousel-fade .carousel-item {
          opacity: 0;
          transition-property: opacity !important;
          transform: none !important;
        }

        .carousel-fade .carousel-item.active {
          opacity: 1 !important;
        }

        .carousel-fade .carousel-item-next.carousel-item-start,
        .carousel-fade .carousel-item-prev.carousel-item-end {
          opacity: 1 !important;
        }
      `}</style>
    </>
  );
}

// Estilo mejorado para las leyendas del carrusel
const captionStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.7)", // Fondo más oscuro para mejor legibilidad
  color: "white",
  borderRadius: "6px",
  backdropFilter: "blur(5px)", // Efecto de desenfoque para modernidad
  border: "1px solid rgba(255, 255, 255, 0.1)", // Sutil borde para definición
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)", // Sombra de texto para legibilidad
};

export default Carrusel;