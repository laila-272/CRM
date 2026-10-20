
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Layout from "./Components/Layout/Layout.jsx";
import PotentialClients from "./Components/Pages/PotentialClients.jsx";
import CustomerDetails from "./Components/Pages/CustomerDetails.jsx";
import { CustomersProvider } from "./context/CustomersContext.jsx";
import Deals from "./Components/Pages/Deals.jsx";
import DealDetails from "./Components/Pages/Dealdetails.jsx";
import Contracts from "./Components/Pages/Contracts.jsx";
import Contractdetails from "./Components/Pages/Contractdetails.jsx";
import Brokers from "./Components/Pages/Brokers.jsx";
import Commissions from "./Components/Pages/Commissions.jsx";
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
      {
        path: "deals",
        element: <Deals />,
      },
      {
        path: "deals/:id",
        element: <DealDetails />,
      },
      {
        path: "contracts",
        element: <Contracts />,
      },
      {
        path: "contracts/:id",
        element: <Contractdetails />,
      },
      {
        path: "brokers",
        element: <Brokers />,
      },
      {
        path: "commissions",
        element: <Commissions />,
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
