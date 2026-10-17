
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Layout from "./Components/Layout/Layout.jsx";
import PotentialClients from "./Components/Pages/PotentialClients.jsx";
import CustomerDetails from "./Components/Pages/CustomerDetails.jsx";
import { CustomersProvider } from "./context/CustomersContext.jsx";
import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/potential-clients" replace />,
      },
      {
        path: "potential-clients",
        element: <PotentialClients />,
      },
      {
        path: "customer-details/:id",
        element: <CustomerDetails />,
      },
    ],
  },
]);

function App() {
  return (
    <CustomersProvider>
      <RouterProvider router={router} />
    </CustomersProvider>
  );
}

export default App;
;
