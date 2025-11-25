"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Home,
  Settings,
  FileText,
  CreditCard,
  UserCheck,
  Database,
  Sun,
  Moon,
} from "lucide-react";
import ServicesManagement from "@/components/admin/services-management";
import OrdersManagement from "@/components/admin/orders-management";
import SettingsManagement from "@/components/admin/settings-management";
import CustomersManagement from "@/components/admin/customers-management";
import PaymentsManagement from "@/components/admin/payments-management";
import DataManagement from "@/components/admin/data-management";

interface DashboardStats {
  totalOrdersToday: number;
  totalCustomers: number;
  monthlyRevenue: number;
  completedOrders: number;
}

interface RecentOrder {
  id: string;
  invoiceNumber: string;
  customerName: string;
  serviceName: string;
  totalCost: number;
  status: string;
  orderDate: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrdersToday: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    completedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    fetchDashboardData();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, ordersResponse] = await Promise.all([
        fetch("/api/admin/dashboard/stats"),
        fetch("/api/admin/orders/recent"),
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  const handleNavigation = (tabId: string) => {
    if (tabId === "reports") {
      window.location.href = "/admin/reports";
    } else {
      setActiveTab(tabId);
      setSidebarOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "In Process":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
      case "Canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const menuItems = [
    { id: "overview", label: "Ringkasan", icon: Home },
    { id: "orders", label: "Pesanan", icon: Package },
    { id: "customers", label: "Pelanggan", icon: Users },
    { id: "services", label: "Layanan", icon: FileText },
    { id: "payments", label: "Pembayaran", icon: CreditCard },
    { id: "reports", label: "Laporan", icon: TrendingUp },
    { id: "data-management", label: "Manajemen Data", icon: Database },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 dark:border-teal-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-300">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            <h1 className="text-xl font-bold text-teal-600 dark:text-teal-400">
              Sentul-Laundry
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-r-2 border-teal-600 dark:border-teal-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Dashboard Admin
              </h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={toggleDarkMode}
                >
                  {darkMode ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
                <Badge
                  variant="outline"
                  className="text-teal-600 dark:text-teal-400 border-teal-300 dark:border-teal-600"
                >
                  Admin
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pesanan Hari Ini
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground text-gray-500 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                      {stats.totalOrdersToday}
                    </div>
                    <p className="text-xs text-muted-foreground text-gray-500 dark:text-gray-400">
                      Total pesanan hari ini
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Pelanggan
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground text-gray-500 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.totalCustomers}
                    </div>
                    <p className="text-xs text-muted-foreground text-gray-500 dark:text-gray-400">
                      Pelanggan terdaftar
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pendapatan Bulan Ini
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground text-gray-500 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      Rp {stats.monthlyRevenue.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground text-gray-500 dark:text-gray-400">
                      Total pendapatan
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pesanan Selesai
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground text-gray-500 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.completedOrders}
                    </div>
                    <p className="text-xs text-muted-foreground text-gray-500 dark:text-gray-400">
                      Pesanan selesai
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Pesanan Terbaru
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    5 pesanan terakhir yang masuk
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {order.invoiceNumber}
                            </span>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {order.customerName} - {order.serviceName}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-teal-600 dark:text-teal-400">
                            Rp {order.totalCost.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other Tabs */}
            <TabsContent value="customers">
              <CustomersManagement />
            </TabsContent>

            <TabsContent value="services">
              <ServicesManagement />
            </TabsContent>

            <TabsContent value="orders">
              <OrdersManagement />
            </TabsContent>

            <TabsContent value="payments">
              <PaymentsManagement />
            </TabsContent>

            <TabsContent value="data-management">
              <DataManagement />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsManagement />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
