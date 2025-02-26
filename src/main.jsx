import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home";
import PaginaError from "./pages/PaginaError";
import AltaComponente from "./components/AltaComponente";
import ListadoComponentes from "./components/ListadoComponentes";
import ModificarComponente from "./components/ModificarComponente";
import AltaMueble from "./components/AltaMueble";
import ListadoMuebles from "./components/ListadoMuebles";
import ModificarMueble from "./components/ModificarMueble";
import ListadoComponentesMateriales from "./components/ListadoComponentesMateriales";
import BuscarComponente from "./components/BuscarComponente";
import BuscarMueble from "./components/BuscarMueble";
import ListadoMueblesFecha from "./components/ListadoMueblesFecha";
import MuebleComponentesChart from "./components/MuebleComponentesChart";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
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
        path: "listadomueblesfecha",
        element: <ListadoMueblesFecha />,
      },
      {
        path: "grafica",
        element: <MuebleComponentesChart />,
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
