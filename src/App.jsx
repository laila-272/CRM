import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Layout from "./Components/Layout/Layout.jsx";
import PotentialClients from "./Components/CRMPages/PotentialClients.jsx";
import CustomerDetails from "./Components/CRMPages/CustomerDetails.jsx";
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

import Reservations from "./Components/Bookings/Reservations.jsx";
import Appointments from "./Components/Bookings/Appointments.jsx";
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
import StockMove from "./Components/InventoryPages/StockMove.jsx";
import Warehouses from "./Components/InventoryPages/Warehouses";
import StockAlerts from "./Components/InventoryPages/Alerts.jsx";

import Projects from "./Components/ProjectsPages/Projects.jsx";
import ProjectDetails from "./Components/ProjectsPages/ProjectDetails.jsx";
import Execution from "./Components/ProjectsPages/Execution.jsx";
import ProjectSettings from "./Components/ProjectsPages/ProjectSettings.jsx";

import Marketing from "./Components/Support/Marketing.jsx";
import Support from "./Components/Support/Support.jsx";

import SubTemplates from "./Components/SettingsPages/SubscribtionTemplates.jsx";
import SubsPlan from "./Components/SettingsPages/SubscribtionPlan.jsx";
import UsersPermissions from "./Components/SettingsPages/UsersPermissions.jsx";
import GeneralSettings from "./Components/SettingsPages/Settings.jsx";
import TeamRoles from "./Components/SettingsPages/Teamroles.jsx";
import RoleMembers from "./Components/SettingsPages/Rolemembers.jsx";

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
import Archive from "./Components/Archive/Archive.jsx";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { CustomersProvider } from "./context/CustomersContext.jsx";

// ------------------------------------
// Authentication Guard
// ------------------------------------

function RequireAuth({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ------------------------------------
// Permission Guard
// ------------------------------------

function PermissionGuard({ children, permission, anyPermissions }) {
  const { user, loadingPermissions, hasPermission, hasAnyPermission } =
    useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loadingPermissions) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>جاري تحميل الصلاحيات...</p>
      </div>
    );
  }

  const allowed = permission
    ? hasPermission(permission)
    : anyPermissions
      ? hasAnyPermission(anyPermissions)
      : true;

  if (!allowed) {
    return (
      <div
        dir="rtl"
        className="flex min-h-[70vh] flex-col items-center justify-center gap-3 p-6 text-center"
      >
        <h2 className="text-xl font-bold text-gray-800">غير مسموح بالدخول</h2>

        <p className="text-sm text-gray-500">
          ليس لديك الصلاحيات المطلوبة لعرض هذه الصفحة.
        </p>
      </div>
    );
  }

  return children;
}

// Helper to protect a page with one permission
function protect(element, permission) {
  return <PermissionGuard permission={permission}>{element}</PermissionGuard>;
}

// Helper to protect a page with any of multiple permissions
function protectAny(element, permissions) {
  return (
    <PermissionGuard anyPermissions={permissions}>{element}</PermissionGuard>
  );
}

// ------------------------------------
// Router
// ------------------------------------

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },

      // Dashboard
      {
        path: "dashboard",
        element: protect(<Dashboard />, "dashboard.view"),
      },

      // CRM
      {
        path: "potential-clients",
        element: protect(<PotentialClients />, "leads.view"),
      },
      {
        path: "customer-details/:id",
        element: protect(<CustomerDetails />, "lead.view"),
      },
      {
        path: "contacts",
        element: protect(<Contacts />, "customers.view"),
      },
      {
        path: "contacts/:id",
        element: protect(<ContactDetails />, "customer.view"),
      },
      {
        path: "deals",
        element: protect(<Deals />, "deals.view"),
      },
      {
        path: "deals/:id",
        element: protect(<DealDetails />, "deal.view"),
      },
      {
        path: "contracts",
        element: protect(<Contracts />, "contracts.view"),
      },
      {
        path: "contracts/:id",
        element: protect(<Contractdetails />, "contract.view"),
      },
      {
        path: "brokers",
        element: protect(<Brokers />, "partners.view"),
      },
      {
        path: "commissions",
        element: protect(<Commissions />, "commissions.view"),
      },
      {
        path: "tasks",
        element: protect(<Tasks />, "tasks.view"),
      },
      {
        path: "reports",
        element: <Reports />,
      },
      {
        path: "calender",
        element: protect(<Calendar />, "appointments.view"),
      },
      {
        path: "forms",
        element: <FormBuilder />,
      },
      {
        path: "settings",
        element: protect(<Settings />, "company.settings.view"),
      },

      // Bookings
      {
        path: "reservations",
        element: <Reservations />,
      },
      {
        path: "appointments",
        element: protect(<Appointments />, "appointments.view"),
      },
      {
        path: "resources",
        element: <Resources />,
      },
      {
        path: "resources/:id",
        element: <ResourceProfile />,
      },
      {
        path: "scheduling-settings",
        element: <SchedulingSettings />,
      },
      {
        path: "resDetails",
        element: <ReservationsDetails />,
      },

      // Inventory
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "suppliers",
        element: protect(<Suppliers />, "vendors.view"),
      },
      {
        path: "inventory",
        element: <Inventory />,
      },
      {
        path: "stockmovements",
        element: <StockMove />,
      },
      {
        path: "warehouses",
        element: <Warehouses />,
      },
      {
        path: "stock-alerts",
        element: <StockAlerts />,
      },

      // Projects
      {
        path: "projects",
        element: <Projects />,
      },
      {
        path: "projects/:id",
        element: <ProjectDetails />,
      },
      {
        path: "execution",
        element: <Execution />,
      },
      {
        path: "projects-settings",
        element: <ProjectSettings />,
      },

      // Support & Marketing
      {
        path: "marketing",
        element: <Marketing />,
      },
      {
        path: "support",
        element: <Support />,
      },

      // Settings & Team
      {
        path: "subscriptions-templates",
        element: <SubTemplates />,
      },
      {
        path: "subscription-plans",
        element: <SubsPlan />,
      },
      {
        path: "roles",
        element: protect(<TeamRoles />, "team.view"),
      },
      {
        path: "roles/:roleId/members",
        element: protect(<RoleMembers />, "members.view"),
      },
      {
        path: "roles/:roleId/permissions",
        element: protect(<UsersPermissions />, "team.permissions"),
      },
      {
        path: "general-settings",
        element: protect(<GeneralSettings />, "company.settings.view"),
      },

      // Sales
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "sales-orders",
        element: <SalesOrders />,
      },
      {
        path: "sales-reports",
        element: <SalesReports />,
      },
      {
        path: "sales-settings",
        element: <SalesSettings />,
      },

      // Accounting
      {
        path: "accounting/accounts",
        element: <Accounts />,
      },
      {
        path: "accounting/invoices",
        element: protect(<Invoices />, "invoices.view"),
      },
      {
        path: "accounting/expenses",
        element: protect(<Expenses />, "expenses.view"),
      },
      {
        path: "accounting/banks",
        element: <Banks />,
      },
      {
        path: "accounting/journal-entries",
        element: <JournalEntries />,
      },
      {
        path: "accounting/reports",
        element: <FinancialReports />,
      },
      {
        path: "accounting/settings",
        element: <AccountingSettings />,
      },

      // HR
      {
        path: "employees",
        element: <Employees />,
      },
      {
        path: "employees/:id",
        element: <EmployeeDetails />,
      },
      {
        path: "recruitment",
        element: <Recruitment />,
      },
      {
        path: "performance",
        element: <Performance />,
      },
      {
        path: "employee-reports",
        element: <EmployeeReports />,
      },
      {
        path: "attendance",
        element: <Attendance />,
      },
      {
        path: "payroll",
        element: <Payroll />,
      },
      {
        path: "salaryslips",
        element: <SalarySlip />,
      },
      {
        path: "employee-affairs",
        element: <EmployeeAffairs />,
      },
      {
        path: "announcements",
        element: <Announcements />,
      },
      {
        path: "documents",
        element: <Documents />,
      },
      {
        path: "hr-settings",
        element: <HRSettings />,
      },

      // Archive
      {
        path: "archive",
        element: protectAny(<Archive />, [
          "customer.trash",
          "leads.trash",
          "deal.trash",
          "contracts.trash",
          "tasks.trash",
          "appointments.trash",
          "invoices.trash",
          "expenses.trash",
          "vendors.trash",
        ]),
      },
    ],
  },

  // Authentication Pages
  {
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <CustomersProvider>
        <RouterProvider router={router} />
      </CustomersProvider>
    </AuthProvider>
  );
}

export default App;
