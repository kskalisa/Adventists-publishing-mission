import { useState, useEffect } from "react";
import type { Screen } from "./types/navigation";
import {
  clearCurrentSession,
  getAuthToken,
  getCurrentUser,
  getSessionUser,
  roleDashboards,
  setStoredCurrentUser,
} from "./lib/api";
import {
  Customers,
  CustomerRequests,
  Dashboard,
  DailySummary,
  Inventory,
  InventoryManagerDashboard,
  Landing,
  Login,
  Register,
  PointOfSale,
  Reports,
  RequestAccess,
  Sales,
  SalesDashboard,
  SalesHistory,
  Users,
  CoordinatorDashboard,
  BudgetTrackingScreen,
  ProductionOrdersScreen,
  CustomerBookRequests,
  CustomerDashboard,
  CustomerNotifications,
  CustomerOrders,
  BrowseBooks,
  FulfillmentBoard,
  InventoryBookRequests,
  MyOrders,
  PlaceOrder,
  CustomerProfile,
} from "./pages";
import type { UserRole } from "./lib/api";

function getInitialScreen(): Screen {
  const hash = window.location.hash.replace("#", "") as Screen;
  return hash || "landing";
}

function App() {
  const [screen, setScreen] = useState<Screen>(getInitialScreen);
  const [currentUser, setCurrentUser] = useState(getCurrentUser);
  const [authChecked, setAuthChecked] = useState(!getAuthToken());

  useEffect(() => {
    const handleHashChange = () => setScreen(getInitialScreen());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const syncSession = () => {
      const token = getAuthToken();
      if (!token) {
        setCurrentUser(null);
        setAuthChecked(true);
        return;
      }
      setAuthChecked(false);
      getSessionUser()
        .then((user) => {
          setStoredCurrentUser(user);
          setCurrentUser(user);
        })
        .catch(() => {
          clearCurrentSession();
          setCurrentUser(null);
        })
        .finally(() => setAuthChecked(true));
    };

    syncSession();
    window.addEventListener("adventist-session-updated", syncSession);
    return () =>
      window.removeEventListener("adventist-session-updated", syncSession);
  }, []);

  useEffect(() => {
    // Keep signed-in users on screens their role can actually load.
    if (
      currentUser &&
      (screen === "login" ||
        screen === "landing" ||
        (isProtectedScreen(screen) && !canAccess(currentUser.role, screen)))
    ) {
      const target = roleDashboards[currentUser.role] ?? "dashboard";
      window.location.hash = target;
      setScreen(target as Screen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.role, screen]);

  const navigate = (next: Screen) => {
    window.location.hash = next;
    setScreen(next);
  };

  if (screen === "landing") return <Landing onNavigate={navigate} />;
  if (screen === "login") return <Login onNavigate={navigate} />;
  if (screen === "register") return <Register onNavigate={navigate} />;

  if (screen === "access") return <RequestAccess onNavigate={navigate} />;
  if (!authChecked && isProtectedScreen(screen)) return null;
  if (!currentUser) return <Login onNavigate={navigate} />;
  if (!canAccess(currentUser.role, screen)) return null;
  if (screen === "inventory")
    return <Inventory active={screen} onNavigate={navigate} />;
  if (screen === "sales")
    return <Sales active={screen} onNavigate={navigate} />;
  if (screen === "customers")
    return (
      <Customers
        active={screen}
        onNavigate={navigate}
        role={currentUser?.role === "SALES" ? "sales" : "admin"}
      />
    );
  if (screen === "customer-requests")
    return <CustomerRequests active={screen} onNavigate={navigate} />;
  if (screen === "reports")
    return <Reports active={screen} onNavigate={navigate} />;
  if (screen === "pos")
    return <PointOfSale active={screen} onNavigate={navigate} />;
  if (screen === "sales-dashboard")
    return <SalesDashboard active={screen} onNavigate={navigate} />;
  if (screen === "sales-history")
    return <SalesHistory active={screen} onNavigate={navigate} />;
  if (screen === "daily-summary")
    return <DailySummary active={screen} onNavigate={navigate} />;
  if (screen === "notifications")
    return <CustomerNotifications active={screen} onNavigate={navigate} />;
  if (screen === "sales-orders")
    return <CustomerOrders active={screen} onNavigate={navigate} />;
  if (screen === "sales-fulfillment")
    return <FulfillmentBoard active={screen} onNavigate={navigate} />;
  if (screen === "users")
    return <Users active={screen} onNavigate={navigate} />;
  if (screen === "customer-dashboard")
    return <CustomerDashboard active={screen} onNavigate={navigate} />;
  if (screen === "customer-orders")
    return <MyOrders active={screen} onNavigate={navigate} />;
  if (screen === "customer-browse-books")
    return <BrowseBooks active={screen} onNavigate={navigate} />;
  if (screen === "customer-place-order")
    return <PlaceOrder active={screen} onNavigate={navigate} />;
  if (screen === "customer-book-requests")
    return <CustomerBookRequests active={screen} onNavigate={navigate} />;
  if (screen === "customer-notifications")
    return <CustomerNotifications active={screen} onNavigate={navigate} />;
  if (screen === "customer-profile")
    return <CustomerProfile active={screen} onNavigate={navigate} />;
  if (screen === "inventory-manager-book-requests")
    return <InventoryBookRequests active={screen} onNavigate={navigate} />;
  if (screen === "coordinator-production")
    return (
      <ProductionOrdersScreen
        active={screen}
        onNavigate={navigate}
        role={currentUser.role === "ADMIN" ? "admin" : "coordinator"}
      />
    );
  if (screen === "coordinator-budget")
    return (
      <BudgetTrackingScreen
        active={screen}
        onNavigate={navigate}
        role={currentUser.role === "ADMIN" ? "admin" : "coordinator"}
      />
    );
  if (
    screen === "inventory-manager" ||
    screen === "inventory-manager-inventory" ||
    screen === "inventory-manager-adjustments" ||
    screen === "inventory-manager-reprint" ||
    screen === "inventory-manager-report" ||
    screen === "inventory-manager-profile"
  )
    return <InventoryManagerDashboard active={screen} onNavigate={navigate} />;
  if (
    screen === "coordinator" ||
    screen === "coordinator-reprint" ||
    screen === "coordinator-sales" ||
    screen === "coordinator-reports"
  )
    return <CoordinatorDashboard active={screen} onNavigate={navigate} />;

  return <Dashboard active={screen} onNavigate={navigate} />;
}

function isProtectedScreen(screen: Screen) {
  return !["landing", "login", "register", "access"].includes(screen);
}

function canAccess(role: UserRole, screen: Screen) {
  const allowed: Record<UserRole, Screen[]> = {
    ADMIN: [
      "dashboard",
      "inventory",
      "sales",
      "customer-requests",
      "users",
      "reports",
      "pos",
      "notifications",
      "coordinator-production",
      "coordinator-budget",
      "inventory-manager-book-requests",
    ],
    SALES: [
      "sales-dashboard",
      "pos",
      "customers",
      "sales-history",
      "sales-orders",
      "sales-fulfillment",
      "daily-summary",
      "notifications",
    ],
    INVENTORY_MANAGER: [
      "inventory-manager",
      "inventory-manager-inventory",
      "inventory-manager-adjustments",
      "inventory-manager-reprint",
      "inventory-manager-book-requests",
      "inventory-manager-report",
      "inventory-manager-profile",
      "notifications",
    ],
    COORDINATOR: [
      "coordinator",
      "coordinator-reprint",
      "coordinator-sales",
      "coordinator-production",
      "coordinator-budget",
      "coordinator-reports",
      "notifications",
    ],
    CUSTOMER: [
      "customer-dashboard",
      "customer-orders",
      "customer-browse-books",
      "customer-place-order",
      "customer-book-requests",
      "customer-notifications",
      "customer-profile",
      "notifications",
    ],
  };
  return allowed[role].includes(screen);
}

export default App;
