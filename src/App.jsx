import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Layout from "./Components/Layout/Layout.jsx";
import PotentialClients from "./Components/CRMPages/PotentialClients.jsx";
import CustomerDetails from "./Components/CRMPages/CustomerDetails.jsx";
import { CustomersProvider } from "./context/CustomersContext.jsx";
import Deals from "./Components/CRMPages/Deals.jsx";
import DealDetails from "./Components/CRMPages/Dealdetails.jsx";
import Contracts from "./Components/CRMPages/Contracts.jsx";
import Contractdetails from "./Components/CRMPages/Contractdetails.jsx";
import Brokers from "./Components/CRMPages/Brokers.jsx";
import Commissions from "./Components/CRMPages/Commissions.jsx";
import Tasks from "./Components/CRMPages/Tasks.jsx";
import Reports from "./Components/CRMPages/Reports.jsx";
import Calendar from "./Components/CRMPages/Calender.jsx";
import FormBuilder from "./Components/CRMPages/Formbuilder.jsx";
import Settings from "./Components/CRMPages/Settings.jsx";
import AppointmentModal from "./Components/Bookings/Appointmentmodal.jsx";
import Reservations from "./Components/Bookings/Reservations.jsx";
import Appointments from "./Components/Bookings/Appointments.jsx";
import ResourceModal from "./Components/Bookings/Resourcemodal.jsx";
import ResourceProfile from "./Components/Bookings/Resourceprofile.jsx";
import Resources from "./Components/Bookings/Resources.jsx";
import SchedulingSettings from "./Components/Bookings/Schedulingsettings.jsx";
import ReservationsDetails from "./Components/Bookings/ReservationsDetails.jsx";
import Products from "./Components/InventoryPages/Products.jsx";
import Suppliers from "./Components/InventoryPages/Suppliers.jsx";
import Inventory from "./Components/InventoryPages/Inventory.jsx";
import Projects from "./Components/ProjectsPages/Projects.jsx";
import ProjectDetails from "./Components/ProjectsPages/ProjectDetails.jsx";
import Execution from "./Components/ProjectsPages/Execution.jsx";
import ProjectSettings from "./Components/ProjectsPages/ProjectSettings.jsx";

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
      { path: "reservations", element: <Reservations /> },
      { path: "appointments", element: <Appointments /> },
      { path: "resources", element: <Resources /> },
      { path: "resources/:id", element: <ResourceProfile /> },
      { path: "scheduling-settings", element: <SchedulingSettings /> },
      { path: "resDetails", element: <ReservationsDetails /> },
      { path: "products", element: <Products /> },
      { path: "suppliers", element: <Suppliers /> },
      { path: "inventory", element: <Inventory /> },
      { path: "projects", element: <Projects /> },
      { path: "projects/:id", element: <ProjectDetails /> },
      { path: "execution", element: <Execution /> },
      { path: "projects-settings", element: <ProjectSettings /> },
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
