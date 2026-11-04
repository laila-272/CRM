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

import AuthLayout from "./Components/AuthPages/Authlayout.jsx";
import Register from "./Components/AuthPages/Register.jsx";
import Login from "./Components/AuthPages/Login.jsx";
import Products from "./Components/InventoryPages/Products.jsx";
import Suppliers from "./Components/InventoryPages/Suppliers.jsx";
import Inventory from "./Components/InventoryPages/Inventory.jsx";
import Projects from "./Components/ProjectsPages/Projects.jsx";
import ProjectDetails from "./Components/ProjectsPages/ProjectDetails.jsx";
import Execution from "./Components/ProjectsPages/Execution.jsx";
import ProjectSettings from "./Components/ProjectsPages/ProjectSettings.jsx";

import Marketing from "./Components/Support/Marketing.jsx";
import Support from "./Components/Support/Support.jsx";
import StockMove from "./Components/InventoryPages/StockMove.jsx";
import Warehouses from "./Components/InventoryPages/Warehouses";
import StockAlerts from "./Components/InventoryPages/Alerts.jsx";
import SubTemplates from "./Components/SettingsPages/SubscribtionTemplates.jsx";
import SubsPlan from "./Components/SettingsPages/SubscribtionPlan.jsx";
import UsersPermissions from "./Components/SettingsPages/UsersPermissions.jsx";
import GeneralSettings from "./Components/SettingsPages/Settings.jsx";
import Orders from "./Components/SalesPages/Orders.jsx";
import SalesOrders from "./Components/SalesPages/Salesorders.jsx";
import SalesReports from "./Components/SalesPages/Salesreports.jsx";
import SalesSettings from "./Components/SalesPages/Salessettings.jsx";
import Dashboard from "./Components/Dashboard/Dashboard.jsx";
import Accounts from "./Components/AccountingPages/Accounts.jsx";
import Invoices from "./Components/AccountingPages/Invoices.jsx";
import Expenses from "./Components/AccountingPages/Expenses.jsx";
import Banks from "./Components/AccountingPages/Banks.jsx";
import JournalEntries from "./Components/AccountingPages/Journalentries.jsx";
import FinancialReports from "./Components/AccountingPages/Financialreport.jsx";
import AccountingSettings from "./Components/AccountingPages/Accountingsettings.jsx";
import Employees from "./Components/HRPages/Employees.jsx";
import EmployeeDetails from "./Components/HRPages/Employeedetails.jsx";
import Recruitment from "./Components/HRPages/Recruitment.jsx";
import Performance from "./Components/HRPages/Performance.jsx";
import EmployeeReports from "./Components/HRPages/Employeereports.jsx";
import Attendance from "./Components/HRPages/Attendance.jsx";
import Payroll from "./Components/HRPages/Payroll.jsx";
import SalarySlip from "./Components/HRPages/Salaryslip.jsx";
import EmployeeAffairs from "./Components/HRPages/Employeeaffairs.jsx";
import Announcements from "./Components/HRPages/Announcements.jsx";
import Documents from "./Components/HRPages/Documents.jsx";
import HRSettings from "./Components/HRPages/Hrsettings.jsx";
import Contacts from "./Components/CRMPages/Contacts.jsx";
import ContactDetails from "./Components/CRMPages/Contactdetails.jsx";
const router = createBrowserRouter([
    { element: <AuthLayout />, children: [
       { index: true, element: <Login /> },
       { path: 'login', element: <Login  /> },
       { path: 'register', element: <Register  /> },
   ]},
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/potential-clients" replace /> },
      { path: "potential-clients", element: <PotentialClients /> },
      { path: "customer-details/:id", element: <CustomerDetails /> },
      { path: "deals", element: <Deals /> },
      { path: "deals/:id", element: <DealDetails /> },
      { path: "contracts", element: <Contracts /> },
      { path: "contracts/:id", element: <Contractdetails /> },
      { path: "brokers", element: <Brokers /> },
      { path: "commissions", element: <Commissions /> },
      { path: "tasks", element: <Tasks /> },
      { path: "reports", element: <Reports /> },
      { path: "calender", element: <Calendar /> },
      { path: "forms", element: <FormBuilder /> },
      { path: "settings", element: <Settings /> },
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
      { path: "marketing", element: <Marketing /> },
      { path: "support", element: <Support /> },
      { path: "stockmovements", element: <StockMove /> },
      { path: "warehouses", element: <Warehouses /> },
      { path: "stock-alerts", element: <StockAlerts /> },
      { path: "subscriptions-templates", element: <SubTemplates /> },
      { path: "subscription-plans", element: <SubsPlan /> },
      { path: "users-permissions", element: <UsersPermissions /> },
      { path: "general-settings", element: <GeneralSettings /> },
      { path: "orders", element: <Orders /> },
      { path: "sales-orders", element: <SalesOrders /> },
      { path: "sales-reports", element: <SalesReports /> },
      { path: "sales-settings", element: <SalesSettings /> },
      { path: "accounting/accounts", element: <Accounts /> },
      { path: "accounting/invoices", element: <Invoices /> },
      { path: "accounting/expenses", element: <Expenses /> },
      { path: "accounting/banks", element: <Banks /> },
      { path: "accounting/journal-entries", element: <JournalEntries /> },
      { path: "accounting/reports", element: <FinancialReports /> },
      { path: "accounting/settings", element: <AccountingSettings /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "employees", element: <Employees /> },
      { path: "employees/:id", element: <EmployeeDetails /> },
      { path: "recruitment", element: <Recruitment /> },
      { path: "performance", element: <Performance /> },
      { path: "employee-reports", element: <EmployeeReports /> },
      { path: "attendance", element: <Attendance /> },
      { path: "payroll", element: <Payroll /> },
      { path: "salaryslips", element: <SalarySlip /> },
      { path: "employee-affairs", element: <EmployeeAffairs /> },
      { path: "announcements", element: <Announcements /> },
      { path: "documents", element: <Documents /> },
      { path: "hr-settings", element: <HRSettings /> },
      { path: "contacts", element: <Contacts /> },
      { path: "contacts/:id", element: <ContactDetails /> },
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
