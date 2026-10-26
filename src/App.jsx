
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
import Tasks from "./Components/Pages/Tasks.jsx";
import Reports from "./Components/Pages/Reports.jsx";
import Calendar from "./Components/Pages/Calender.jsx";
import FormBuilder from "./Components/Pages/Formbuilder.jsx";
import Settings from "./Components/Pages/Settings.jsx";
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
      {
        path: "tasks",
        element: <Tasks />,
      },
      {
        path: "reports",
        element: <Reports />,
      },
      {
        path: "calender",
        element: <Calendar />,
      },
      {
        path: "forms",
        element: <FormBuilder />,
      },
      {
        path: "settings",
        element: <Settings />,
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
