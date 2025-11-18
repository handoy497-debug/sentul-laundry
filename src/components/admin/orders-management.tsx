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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Package,
  User,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  RefreshCw,
} from "lucide-react";

interface Order {
  id: string;
  invoiceNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  service: {
    serviceName: string;
  };
  weight: number;
  totalCost: number;
  status: string;
  orderDate: string;
  pickupDate?: string;
  deliveryDate?: string;
  payments: Array<{
    id: string;
    paymentMethod: string;
    amount: number;
    status: string;
    paymentDate?: string;
  }>;
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      const url =
        filterStatus === "all"
          ? "/api/admin/orders"
          : `/api/admin/orders?status=${filterStatus}`;

      const response = await fetch(url);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchOrders();
      } else {
        alert("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Process":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Delivered":
        return "bg-emerald-100 text-emerald-800";
      case "Canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getNextStatusOptions = (currentStatus: string) => {
    const statusFlow = {
      Pending: ["In Process", "Canceled"],
      "In Process": ["Completed", "Canceled"],
      Completed: ["Delivered"],
      Delivered: [],
      Canceled: ["Pending"],
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || [];
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Daftar Pesanan</h3>
          <p className="text-sm text-gray-600">Kelola semua pesanan laundry</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Process">In Process</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Layanan</TableHead>
                <TableHead>Berat</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <span className="font-mono text-sm font-medium">
                      {order.invoiceNumber}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-sm text-gray-600">
                        {order.customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-teal-600" />
                      <span>{order.service.serviceName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span>{order.weight} kg</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">
                        Rp {order.totalCost.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewOrderDetails(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {getNextStatusOptions(order.status).length > 0 && (
                        <Select
                          onValueChange={(value) =>
                            updateOrderStatus(order.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Update" />
                          </SelectTrigger>
                          <SelectContent>
                            {getNextStatusOptions(order.status).map(
                              (status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Pesanan</DialogTitle>
            <DialogDescription>Informasi lengkap pesanan</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Informasi Pesanan</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invoice:</span>
                      <span className="font-medium">
                        {selectedOrder.invoiceNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal Pesanan:</span>
                      <span>
                        {new Date(selectedOrder.orderDate).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedOrder.pickupDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal Pickup:</span>
                        <span>
                          {new Date(
                            selectedOrder.pickupDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedOrder.deliveryDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal Delivery:</span>
                        <span>
                          {new Date(
                            selectedOrder.deliveryDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Informasi Pelanggan</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{selectedOrder.customer.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{selectedOrder.customer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {selectedOrder.customer.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Detail Layanan</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-600">Layanan:</span>
                    <p className="font-medium">
                      {selectedOrder.service.serviceName}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Berat:</span>
                    <p className="font-medium">{selectedOrder.weight} kg</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Biaya:</span>
                    <p className="font-semibold text-green-600">
                      Rp {selectedOrder.totalCost.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Informasi Pembayaran</h4>
                {selectedOrder.payments.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-3">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-gray-600">Metode:</span>
                        <p className="font-medium">{payment.paymentMethod}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Jumlah:</span>
                        <p className="font-medium">
                          Rp {payment.amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-600">Tanggal:</span>
                        <p className="font-medium">
                          {payment.paymentDate
                            ? new Date(payment.paymentDate).toLocaleDateString()
                            : "Belum dibayar"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
