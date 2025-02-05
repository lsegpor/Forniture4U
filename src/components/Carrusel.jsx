import {
  MDBCarousel,
  MDBCarouselItem,
  MDBBtn,
  MDBContainer,
} from "mdb-react-ui-kit";
import foto1 from "../assets/ikea1.jpeg";
import foto2 from "../assets/ikea2.jpeg";
import foto3 from "../assets/ikea3.jpeg";

function Carrusel() {
  return (
    <>
      <MDBContainer className="my-4" style={{ maxWidth: "50%", margin: "0 auto" }}>
        <MDBCarousel fade showIndicators showControls >
          <MDBCarouselItem className="active">
            <img
              src={foto1}
              alt="First slide"
              className="d-block w-100"
            />
            <div className="carousel-caption d-none d-md-block" style={captionStyle}>
              <h5>Bienvenidos a Forniture4U</h5>
              <p>Los mejores muebles a tu disposición</p>
            </div>
          </MDBCarouselItem>
          <MDBCarouselItem>
            <img
              src={foto2}
              alt="Second slide"
              className="d-block w-100"
            />
            <div className="carousel-caption d-none d-md-block" style={captionStyle}>
              <h5>Estilo y Comodidad</h5>
              <p>Encuentra muebles únicos para tu hogar</p>
            </div>
          </MDBCarouselItem>
          <MDBCarouselItem>
            <img
              src={foto3}
              alt="Third slide"
              className="d-block w-100"
            />
            <div className="carousel-caption d-none d-md-block" style={captionStyle}>
              <h5>Calidad Garantizada</h5>
              <p>Comodidad y durabilidad en cada producto</p>
            </div>
          </MDBCarouselItem>
        </MDBCarousel>

        {/* Espacio para el texto descriptivo */}
        <MDBContainer className="my-5 text-center">
          <h2>¿Por qué elegirnos?</h2>
          <p>
            En Forniture4U, ofrecemos una amplia gama de muebles modernos y
            funcionales. Nuestra misión es brindarte productos de la más alta
            calidad que se adapten a tus necesidades y estilo.
          </p>
          <MDBBtn href="/listadomuebles" style={{ backgroundColor: "#da6429" }}>
            Explora nuestros muebles
          </MDBBtn>
        </MDBContainer>
      </MDBContainer>
    </>
  );
}

const captionStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente
    color: "white", // Texto blanco
    padding: "15px",
    borderRadius: "5px",
  };

export default Carrusel;
