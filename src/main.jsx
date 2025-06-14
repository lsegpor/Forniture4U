import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home";
import PaginaError from "./pages/PaginaError";
import AltaComponente from "./components/componentes/AltaComponente";
import ListadoComponentes from "./components/componentes/ListadoComponentes";
import ModificarComponente from "./components/componentes/ModificarComponente";
import AltaMueble from "./components/muebles/AltaMueble";
import ListadoMuebles from "./components/muebles/ListadoMuebles";
import ModificarMueble from "./components/muebles/ModificarMueble";
import ListadoComponentesMateriales from "./components/componentes/ListadoComponentesMateriales";
import BuscarComponente from "./components/componentes/BuscarComponente";
import BuscarMueble from "./components/muebles/BuscarMueble";
import ListadoAvanzadoMuebles from "./components/muebles/ListadoAvanzadoMuebles";
import MuebleComponentesChart from "./components/muebles/MuebleComponentesChart";
import UserCompanyLogin from "./components/auth/UserCompanyLogin";
import UserCompanyRegister from "./components/auth/UserCompanyRegister";
import DetalleMueble from "./components/muebles/DetalleMueble";
import PedidoPago from "./components/pedidos/PedidoPago";
import PerfilUsuario from "./components/user/PerfilUsuario";
import PerfilEmpresa from "./components/user/PerfilEmpresa";

//import "@fontsource/roboto/300.css";
//import "@fontsource/roboto/400.css";
//import "@fontsource/roboto/500.css";
//import "@fontsource/roboto/700.css";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

/**
 * @typedef {Object} RouteObject
 * @property {string} path - Ruta de la página.
 * @property {JSX.Element} element - Componente asociado a la ruta.
 * @property {JSX.Element} [errorElement] - Componente de error.
 * @property {RouteObject[]} [children] - Rutas anidadas.
 */

/**
 * Configuración de las rutas de la aplicación.
 * @type {RouteObject[]}
 */
let router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <PaginaError />,
    children: [
      {
        path: "altacomponente",
        element: <AltaComponente />,
      },
      {
        path: "listadocomponentes",
        element: <ListadoComponentes />,
      },
      {
        path: "modificarcomponente/:id_componente",
        element: <ModificarComponente />,
      },
      {
        path: "altamueble",
        element: <AltaMueble />,
      },
      {
        path: "listadomuebles",
        element: <ListadoMuebles />,
      },
      {
        path: "modificarmueble/:id_mueble",
        element: <ModificarMueble />,
      },
      {
        path: "listadocomponentesmateriales",
        element: <ListadoComponentesMateriales />,
      },
      {
        path: "buscarcomponente",
        element: <BuscarComponente />,
      },
      {
        path: "buscarmueble/:nombre",
        element: <BuscarMueble />,
      },
      {
        path: "listadoavanzadomuebles",
        element: <ListadoAvanzadoMuebles />,
      },
      {
        path: "grafica",
        element: <MuebleComponentesChart />,
      },
      {
        path: "login",
        element: <UserCompanyLogin />,
      },
      {
        path: "register",
        element: <UserCompanyRegister />,
      },
      {
        path: ":id_mueble",
        element: <DetalleMueble />,
      },
      {
        path: "pedidopago",
        element: <PedidoPago />,
      },
      {
        path: "perfilusuario",
        element: <PerfilUsuario />,
      },
      {
        path: "perfilempresa",
        element: <PerfilEmpresa />,
      },
    ],
  },
]);

/**
 * Renderiza la aplicación en el elemento con id "root".
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
