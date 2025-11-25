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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Phone,
  Clock,
  DollarSign,
  CheckCircle,
  Package,
  CreditCard,
  Upload,
  Search,
  Calendar,
  MapPin,
  User,
  ArrowLeft,
  Home,
  Sparkles,
  TrendingUp,
  Star,
  Droplets,
  Wind,
  Sun,
  Waves,
} from "lucide-react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";

interface Service {
  id: string;
  serviceName: string;
  description: string;
  basePricePerKg: number;
  estimatedTime: string;
  prices: Array<{
    pricePerKg: number;
    effectiveDate: string;
  }>;
}

interface Order {
  id: string;
  invoiceNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  service: Service;
  weight: number;
  totalCost: number;
  status: string;
  orderDate: string;
  payments?: Array<{
    id: string;
    paymentMethod: string;
    amount: number;
    status: string;
    paymentDate?: string;
    paymentProof?: string;
  }>;
}

interface AdminInfo {
  qrisImage?: string;
  bankAccount?: string;
}

export default function AppPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    serviceId: "",
    estimatedWeight: "",
    paymentMethod: "",
    promoCode: "",
  });
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("services");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [promoError, setPromoError] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
    });
    fetchServices();
    fetchAdminInfo();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminInfo = async () => {
    try {
      const response = await fetch("/api/admin/payment-info");
      const data = await response.json();
      setAdminInfo(data);
    } catch (error) {
      console.error("Error fetching admin info:", error);
    }
  };

  const validatePromoCode = async () => {
    if (!orderData.promoCode.trim()) {
      setPromoError("");
      setAppliedDiscount(null);
      return;
    }

    setValidatingPromo(true);
    setPromoError("");

    try {
      const response = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promoCode: orderData.promoCode }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedDiscount(data.discount);
        setPromoError("");
      } else {
        setPromoError(data.error || "Invalid promo code");
        setAppliedDiscount(null);
      }
    } catch (error) {
      console.error("Error validating promo code:", error);
      setPromoError("Failed to validate promo code");
      setAppliedDiscount(null);
    } finally {
      setValidatingPromo(false);
    }
  };

  const calculateTotalCost = () => {
    if (!orderData.serviceId || !orderData.estimatedWeight) return 0;

    const service = services.find((s) => s.id === orderData.serviceId);
    if (!service) return 0;

    const weight = parseFloat(orderData.estimatedWeight);
    if (isNaN(weight) || weight <= 0) return 0;

    let totalCost = weight * service.basePricePerKg;

    if (appliedDiscount) {
      const discountAmount =
        totalCost * (appliedDiscount.discountPercent / 100);
      totalCost = totalCost - discountAmount;
    }

    return totalCost;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const orderPayload = {
        ...orderData,
        discountId: appliedDiscount?.id || null,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        const order = await response.json();
        setCreatedOrder(order);
        if (order.appliedDiscount) {
          setAppliedDiscount(order.appliedDiscount);
        }
        setActiveTab("confirmation");
      } else {
        alert("Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order");
    }
  };

  const handleTrackOrder = async () => {
    if (!trackingNumber) return;

    try {
      const response = await fetch(
        `/api/orders/track?number=${trackingNumber}`
      );
      const data = await response.json();

      if (response.ok) {
        setTrackedOrder(data);
      } else {
        alert("Order not found");
        setTrackedOrder(null);
      }
    } catch (error) {
      console.error("Error tracking order:", error);
      alert("Failed to track order");
    }
  };

  const fetchOrderHistory = async (phone: string) => {
    try {
      const response = await fetch(`/api/orders/history?phone=${phone}`);
      const data = await response.json();

      if (response.ok) {
        setOrderHistory(data);
      } else {
        setOrderHistory([]);
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
      setOrderHistory([]);
    }
  };

  const uploadPaymentProof = async (orderId: string) => {
    if (!paymentProofFile) {
      alert("Pilih file bukti pembayaran terlebih dahulu");
      return;
    }

    setUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append("paymentProof", paymentProofFile);

      const response = await fetch(`/api/orders/${orderId}/payment-proof`, {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();

      if (response.ok) {
        alert("Bukti pembayaran berhasil diupload!");
        setPaymentProofFile(null);
        const fileInput = document.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        handleTrackOrder();
      } else {
        alert(
          `Gagal mengupload bukti pembayaran: ${
            responseData.error || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error uploading payment proof:", error);
      alert(
        "Gagal mengupload bukti pembayaran. Periksa koneksi internet Anda."
      );
    } finally {
      setUploadingProof(false);
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

  const getCurrentPrice = (service: Service) => {
    return service.prices.length > 0
      ? service.prices[0].pricePerKg
      : service.basePricePerKg;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background - Brighter Version */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-green-100 to-blue-100 opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-100 via-purple-100 to-indigo-100 opacity-50 animate-pulse"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-6000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-8000"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-10000"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-12000"></div>
      </div>

      {/* Decorative Elements - Brighter Version */}
      <div className="fixed top-20 left-10 text-yellow-500 opacity-40 animate-spin-slow">
        <Droplets className="h-16 w-16" />
      </div>
      <div className="fixed top-40 right-20 text-blue-500 opacity-40 animate-spin-slow animation-delay-2000">
        <Wind className="h-20 w-20" />
      </div>
      <div className="fixed bottom-20 left-20 text-orange-500 opacity-50 animate-pulse">
        <Sun className="h-24 w-24" />
      </div>
      <div className="fixed bottom-40 right-10 text-cyan-500 opacity-40 animate-bounce-slow">
        <Waves className="h-16 w-16" />
      </div>
      <div className="fixed top-1/3 right-1/3 text-pink-500 opacity-30 animate-spin-slow animation-delay-4000">
        <Sparkles className="h-14 w-14" />
      </div>

      {/* Header - Brighter Version */}
      <header className="bg-white/90 backdrop-blur-lg shadow-xl border-b border-white/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4" data-aos="fade-right">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-all hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Kembali</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="relative group">
                  <Package className="h-8 w-8 text-green-600 group-hover:rotate-12 transition-transform" />
                  <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-500 to-cyan-600 bg-clip-text text-transparent">
                  Sentul-Laundry
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4" data-aos="fade-left">
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-200 text-green-700 hover:bg-green-50 hover:scale-105 transition-all"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Beranda
                </Button>
              </Link>
              
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8" data-aos="fade-down">
          <h2 className="text-4xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-green-600 via-emerald-500 to-cyan-600 bg-clip-text text-transparent">
            Aplikasi Laundry
          </h2>
          <p className="text-gray-700 text-lg">
            Kelola pesanan laundry Anda dengan mudah
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList
            className="grid w-full grid-cols-5 bg-white/95 backdrop-blur-sm shadow-xl p-1 rounded-2xl border border-white/40"
            data-aos="zoom-in"
          >
            <TabsTrigger
              value="services"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl transition-all hover:scale-105"
            >
              Layanan
            </TabsTrigger>
            <TabsTrigger
              value="order"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl transition-all hover:scale-105"
            >
              Pesan
            </TabsTrigger>
            <TabsTrigger
              value="track"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl transition-all hover:scale-105"
            >
              Lacak
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl transition-all hover:scale-105"
            >
              Riwayat
            </TabsTrigger>
            <TabsTrigger
              value="confirmation"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl transition-all hover:scale-105"
            >
              Konfirmasi
            </TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6" id="services">
            <div className="text-center mb-8" data-aos="fade-up">
              <h3 className="text-3xl font-bold text-gray-800 mb-2">
                Layanan Laundry Kami
              </h3>
              <p className="text-gray-700">
                Pilih layanan yang sesuai dengan kebutuhan Anda
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12" data-aos="fade-up">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-700">Memuat layanan...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                  <Card
                    key={service.id}
                    className="hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden group bg-white/95 backdrop-blur-sm hover:scale-105"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400"></div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-green-700 flex items-center">
                        <Sparkles className="h-5 w-5 mr-2 text-yellow-500 animate-pulse" />
                        {service.serviceName}
                      </CardTitle>
                      <CardDescription className="text-gray-700">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            Rp {getCurrentPrice(service).toLocaleString()}/kg
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            {service.estimatedTime}
                          </span>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all transform group-hover:scale-105 shadow-lg"
                        onClick={() => {
                          setOrderData((prev) => ({
                            ...prev,
                            serviceId: service.id,
                          }));
                          setActiveTab("order");
                        }}
                      >
                        Pilih Layanan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Order Tab */}
          <TabsContent value="order" className="max-w-2xl mx-auto">
            <Card
              className="shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur-sm"
              data-aos="fade-up"
            >
              <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400"></div>
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Formulir Pemesanan
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Isi data lengkap untuk melakukan pemesanan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitOrder} className="space-y-6">
                  <div
                    className="grid md:grid-cols-2 gap-4"
                    data-aos="fade-right"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="customerName" className="text-green-700">
                        Nama Lengkap
                      </Label>
                      <Input
                        id="customerName"
                        value={orderData.customerName}
                        onChange={(e) =>
                          setOrderData((prev) => ({
                            ...prev,
                            customerName: e.target.value,
                          }))
                        }
                        required
                        className="border-green-200 focus:border-green-500 focus:ring-green-500 bg-white/70"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail" className="text-green-700">
                        Email
                      </Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={orderData.customerEmail}
                        onChange={(e) =>
                          setOrderData((prev) => ({
                            ...prev,
                            customerEmail: e.target.value,
                          }))
                        }
                        required
                        className="border-green-200 focus:border-green-500 focus:ring-green-500 bg-white/70"
                      />
                    </div>
                  </div>

                  <div
                    className="grid md:grid-cols-2 gap-4"
                    data-aos="fade-left"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone" className="text-green-700">
                        Nomor Telepon
                      </Label>
                      <Input
                        id="customerPhone"
                        value={orderData.customerPhone}
                        onChange={(e) =>
                          setOrderData((prev) => ({
                            ...prev,
                            customerPhone: e.target.value,
                          }))
                        }
                        required
                        className="border-green-200 focus:border-green-500 focus:ring-green-500 bg-white/70"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="estimatedWeight"
                        className="text-green-700"
                      >
                        Estimasi Berat (kg)
                      </Label>
                      <Input
                        id="estimatedWeight"
                        type="number"
                        step="0.1"
                        value={orderData.estimatedWeight}
                        onChange={(e) =>
                          setOrderData((prev) => ({
                            ...prev,
                            estimatedWeight: e.target.value,
                          }))
                        }
                        required
                        className="border-green-200 focus:border-green-500 focus:ring-green-500 bg-white/70"
                      />
                    </div>
                  </div>

                  <div className="space-y-2" data-aos="fade-up">
                    <Label htmlFor="customerAddress" className="text-green-700">
                      Alamat Lengkap
                    </Label>
                    <Textarea
                      id="customerAddress"
                      value={orderData.customerAddress}
                      onChange={(e) =>
                        setOrderData((prev) => ({
                          ...prev,
                          customerAddress: e.target.value,
                        }))
                      }
                      required
                      className="border-green-200 focus:border-green-500 focus:ring-green-500 bg-white/70"
                    />
                  </div>

                  <div
                    className="grid md:grid-cols-2 gap-4"
                    data-aos="fade-right"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="serviceId" className="text-green-700">
                        Layanan
                      </Label>
                      <Select
                        value={orderData.serviceId}
                        onValueChange={(value) =>
                          setOrderData((prev) => ({
                            ...prev,
                            serviceId: value,
                          }))
                        }
                      >
                        <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500 bg-white/70">
                          <SelectValue placeholder="Pilih layanan" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.serviceName} - Rp{" "}
                              {getCurrentPrice(service).toLocaleString()}/kg
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod" className="text-green-700">
                        Metode Pembayaran
                      </Label>
                      <Select
                        value={orderData.paymentMethod}
                        onValueChange={(value) =>
                          setOrderData((prev) => ({
                            ...prev,
                            paymentMethod: value,
                          }))
                        }
                      >
                        <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500 bg-white/70">
                          <SelectValue placeholder="Pilih metode pembayaran" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash (Tunai)</SelectItem>
                          <SelectItem value="Transfer">
                            Transfer Bank
                          </SelectItem>
                          <SelectItem value="QRIS">QRIS / e-Wallet</SelectItem>
                          <SelectItem value="COD">
                            COD (Bayar di Tempat)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Promo Code Section */}
                  <div
                    className="space-y-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200"
                    data-aos="fade-left"
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="promoCode"
                        className="text-green-700 flex items-center"
                      >
                        <Star className="h-4 w-4 mr-1 text-yellow-500 animate-pulse" />
                        Kode Promo (Opsional)
                      </Label>
                      <div className="flex space-x-2">
                        <Input
                          id="promoCode"
                          type="text"
                          placeholder="Masukkan kode promo"
                          value={orderData.promoCode}
                          onChange={(e) => {
                            setOrderData((prev) => ({
                              ...prev,
                              promoCode: e.target.value.toUpperCase(),
                            }));
                            setPromoError("");
                          }}
                          onBlur={validatePromoCode}
                          className="border-green-200 focus:border-green-500 focus:ring-green-500 bg-white/70"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={validatePromoCode}
                          disabled={
                            validatingPromo || !orderData.promoCode.trim()
                          }
                          className="border-green-200 text-green-700 hover:bg-green-50"
                        >
                          {validatingPromo ? "..." : "Terapkan"}
                        </Button>
                      </div>
                      {promoError && (
                        <p className="text-sm text-red-600">{promoError}</p>
                      )}
                      {appliedDiscount && (
                        <div className="bg-white border border-green-200 rounded-lg p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-green-800 flex items-center">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                {appliedDiscount.title}
                              </p>
                              <p className="text-sm text-green-600">
                                Diskon {appliedDiscount.discountPercent}%
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setOrderData((prev) => ({
                                  ...prev,
                                  promoCode: "",
                                }));
                                setAppliedDiscount(null);
                                setPromoError("");
                              }}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              Hapus
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price Display */}
                  {orderData.serviceId && orderData.estimatedWeight && (
                    <div
                      className="bg-gradient-to-r from-green-50 via-emerald-50 to-cyan-50 rounded-lg p-4 space-y-2 border border-green-100"
                      data-aos="zoom-in"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Harga Awal:</span>
                        <span className="text-gray-700">
                          Rp{" "}
                          {services
                            .find((s) => s.id === orderData.serviceId)
                            ?.basePricePerKg.toLocaleString()}
                          /kg
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Berat:</span>
                        <span className="text-gray-700">
                          {orderData.estimatedWeight} kg
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Subtotal:</span>
                        <span className="text-gray-700">
                          Rp{" "}
                          {(
                            parseFloat(orderData.estimatedWeight) *
                              services.find((s) => s.id === orderData.serviceId)
                                ?.basePricePerKg || 0
                          ).toLocaleString()}
                        </span>
                      </div>
                      {appliedDiscount && (
                        <div className="flex justify-between text-sm text-green-600 font-medium">
                          <span>
                            Diskon ({appliedDiscount.discountPercent}%):
                          </span>
                          <span>
                            -Rp{" "}
                            {(
                              (parseFloat(orderData.estimatedWeight) *
                                services.find(
                                  (s) => s.id === orderData.serviceId
                                )?.basePricePerKg || 0) *
                              (appliedDiscount.discountPercent / 100)
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span className="text-gray-800">Total Biaya:</span>
                        <span className="text-green-600">
                          Rp {calculateTotalCost().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tombol Buat Pesanan TANPA AOS */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 hover:from-green-600 hover:via-emerald-600 hover:to-cyan-600 text-white font-medium py-3 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                  >
                    Buat Pesanan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Track Tab */}
          <TabsContent value="track" className="max-w-2xl mx-auto" id="track">
            <Card
              className="shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur-sm"
              data-aos="fade-up"
            >
              <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400"></div>
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Lacak Pesanan
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Masukkan nomor invoice atau nomor telepon untuk melacak
                  pesanan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex space-x-2" data-aos="fade-right">
                  <Input
                    placeholder="Nomor invoice atau telepon"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="border-green-200 focus:border-green-500 focus:ring-green-500 bg-white/70"
                  />
                  <Button
                    onClick={handleTrackOrder}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {trackedOrder && (
                  <Card
                    className="border-green-200 shadow-xl overflow-hidden bg-white/95"
                    data-aos="fade-left"
                  >
                    <div className="h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400"></div>
                    <CardHeader>
                      <CardTitle className="text-lg text-green-700">
                        Detail Pesanan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          No. Invoice:
                        </span>
                        <span className="text-gray-700">
                          {trackedOrder.invoiceNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Pelanggan:
                        </span>
                        <span className="text-gray-700">
                          {trackedOrder.customer.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Layanan:
                        </span>
                        <span className="text-gray-700">
                          {trackedOrder.service.serviceName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Berat:
                        </span>
                        <span className="text-gray-700">
                          {trackedOrder.weight} kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Total:
                        </span>
                        <span className="font-semibold text-green-600">
                          Rp {trackedOrder.totalCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">
                          Status:
                        </span>
                        <Badge className={getStatusColor(trackedOrder.status)}>
                          {trackedOrder.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Tanggal:
                        </span>
                        <span className="text-gray-700">
                          {new Date(trackedOrder.orderDate).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      </div>

                      {trackedOrder.payments &&
                        trackedOrder.payments.length > 0 && (
                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-2 text-green-700">
                              Detail Pembayaran:
                            </h4>
                            {trackedOrder.payments.map((payment) => (
                              <div
                                key={payment.id}
                                className="space-y-2 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200"
                              >
                                <div className="flex justify-between">
                                  <span className="text-gray-700">Metode:</span>
                                  <span className="text-gray-700">
                                    {payment.paymentMethod}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-700">Jumlah:</span>
                                  <span className="text-gray-700">
                                    Rp {payment.amount.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-700">Status:</span>
                                  <Badge
                                    className={getStatusColor(payment.status)}
                                  >
                                    {payment.status}
                                  </Badge>
                                </div>
                                {payment.paymentProof && (
                                  <div className="mt-2">
                                    <img
                                      src={payment.paymentProof}
                                      alt="Bukti Pembayaran"
                                      className="w-32 h-32 object-cover rounded border border-green-200"
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                      {trackedOrder.status === "Pending" &&
                        trackedOrder.payments &&
                        trackedOrder.payments.some(
                          (p) => p.status === "Unpaid" || p.status === "Pending"
                        ) && (
                          <div className="border-t pt-4">
                            <h4 className="font-medium mb-2 text-green-700">
                              Upload Bukti Pembayaran:
                            </h4>
                            <div className="space-y-2">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  setPaymentProofFile(
                                    e.target.files?.[0] || null
                                  )
                                }
                                className="border-green-200 focus:border-green-500 focus:ring-green-500 bg-white/70"
                              />
                              <Button
                                onClick={() =>
                                  uploadPaymentProof(trackedOrder.id)
                                }
                                disabled={uploadingProof}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                              >
                                {uploadingProof
                                  ? "Mengupload..."
                                  : "Upload Bukti Pembayaran"}
                              </Button>
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="max-w-2xl mx-auto">
            <Card
              className="shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur-sm"
              data-aos="fade-up"
            >
              <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400"></div>
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Riwayat Pesanan
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Masukkan nomor telepon untuk melihat riwayat pesanan Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex space-x-2" data-aos="fade-right">
                  <Input
                    placeholder="Nomor telepon"
                    onChange={(e) => {
                      if (e.target.value.length >= 10) {
                        fetchOrderHistory(e.target.value);
                      }
                    }}
                    className="border-green-200 focus:border-green-500 focus:ring-green-500 bg-white/70"
                  />
                  <Button
                    onClick={() => {
                      const input = document.querySelector(
                        'input[placeholder="Nomor telepon"]'
                      ) as HTMLInputElement;
                      if (input?.value) {
                        fetchOrderHistory(input.value);
                      }
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {orderHistory.length > 0 && (
                  <div className="space-y-4">
                    {orderHistory.map((order, index) => (
                      <Card
                        key={order.id}
                        className="border-green-100 shadow-lg hover:shadow-xl transition-all overflow-hidden bg-white/95 hover:scale-105"
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                      >
                        <div className="h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400"></div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-green-700">
                                {order.invoiceNumber}
                              </h4>
                              <p className="text-sm text-gray-700">
                                {order.service.serviceName}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {new Date(order.orderDate).toLocaleDateString(
                                "id-ID"
                              )}
                            </span>
                            <span className="font-medium text-green-600">
                              Rp {order.totalCost.toLocaleString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Confirmation Tab */}
          <TabsContent value="confirmation" className="max-w-2xl mx-auto">
            {createdOrder ? (
              <Card
                className="shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur-sm"
                data-aos="zoom-in"
              >
                <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400"></div>
                <CardHeader>
                  <CardTitle className="text-green-700 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Pesanan Berhasil Dibuat!
                  </CardTitle>
                  <CardDescription className="text-gray-700">
                    Terima kasih telah memesan layanan kami
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="bg-gradient-to-r from-green-50 via-emerald-50 to-cyan-50 border border-green-200 rounded-lg p-4"
                    data-aos="fade-up"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        Pesanan Anda telah dibuat
                      </span>
                    </div>
                    <p className="text-sm text-green-700">
                      Nomor invoice:{" "}
                      <span className="font-mono font-bold">
                        {createdOrder.invoiceNumber}
                      </span>
                    </p>
                  </div>

                  <div
                    className="space-y-2 bg-white p-4 rounded-lg border border-green-100"
                    data-aos="fade-up"
                    data-aos-delay="100"
                  >
                    <div className="flex justify-between">
                      <span className="text-gray-700">Nama Pelanggan:</span>
                      <span className="text-gray-700">
                        {createdOrder.customer.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Layanan:</span>
                      <span className="text-gray-700">
                        {createdOrder.service.serviceName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Estimasi Berat:</span>
                      <span className="text-gray-700">
                        {createdOrder.weight} kg
                      </span>
                    </div>
                    {(createdOrder as any).appliedDiscount && (
                      <div className="flex justify-between text-green-600">
                        <span>
                          Diskon (
                          {
                            (createdOrder as any).appliedDiscount
                              .discountPercent
                          }
                          %):
                        </span>
                        <span>
                          -Rp{" "}
                          {(
                            createdOrder as any
                          ).appliedDiscount.discountAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-gray-800">Total Biaya:</span>
                      <span className="text-green-600">
                        Rp {createdOrder.totalCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Metode Pembayaran:</span>
                      <span className="text-gray-700">
                        {createdOrder.payments?.[0]?.paymentMethod || "Cash"}
                      </span>
                    </div>
                  </div>

                  {adminInfo && (
                    <div
                      className="border-t pt-4"
                      data-aos="fade-up"
                      data-aos-delay="200"
                    >
                      <h4 className="font-medium mb-2 text-green-700 flex items-center">
                        <CreditCard className="h-4 w-4 mr-1" />
                        Informasi Pembayaran:
                      </h4>
                      {adminInfo.qrisImage && (
                        <div
                          className="mb-4 bg-white p-4 rounded-lg border border-green-100"
                          data-aos="zoom-in"
                          data-aos-delay="300"
                        >
                          <p className="text-sm text-gray-700 mb-2">
                            Scan QRIS untuk pembayaran:
                          </p>
                          <div className="flex justify-center">
                            <img
                              src={adminInfo.qrisImage}
                              alt="QRIS"
                              className="max-w-xs w-auto h-auto object-contain rounded border border-green-200"
                              style={{ maxHeight: "200px" }}
                            />
                          </div>
                        </div>
                      )}
                      {adminInfo.bankAccount && (
                        <div
                          className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200"
                          data-aos="fade-up"
                          data-aos-delay="400"
                        >
                          <p className="text-sm text-gray-700">
                            {adminInfo.bankAccount}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className="flex space-x-2 pt-4"
                    data-aos="fade-up"
                    data-aos-delay="500"
                  >
                    <Button
                      onClick={() => {
                        setTrackingNumber(createdOrder.invoiceNumber);
                        setActiveTab("track");
                      }}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    >
                      Lacak Pesanan
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCreatedOrder(null);
                        setOrderData({
                          customerName: "",
                          customerEmail: "",
                          customerPhone: "",
                          customerAddress: "",
                          serviceId: "",
                          estimatedWeight: "",
                          paymentMethod: "",
                          promoCode: "",
                        });
                        setAppliedDiscount(null);
                        setPromoError("");
                        setActiveTab("order");
                      }}
                      className="flex-1 border-green-200 text-green-700 hover:bg-green-50 hover:scale-105 transition-all"
                    >
                      Pesan Lagi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card
                className="shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur-sm"
                data-aos="zoom-in"
              >
                <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400"></div>
                <CardContent className="text-center py-12">
                  <div
                    className="mb-4 flex justify-center"
                    data-aos="bounce-in"
                  >
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center shadow-lg">
                      <Package className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4" data-aos="fade-up">
                    Belum ada pesanan yang dibuat
                  </p>
                  <Button
                    onClick={() => setActiveTab("order")}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    data-aos="fade-up"
                  >
                    Buat Pesanan Baru
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
        .animation-delay-8000 {
          animation-delay: 8s;
        }
        .animation-delay-10000 {
          animation-delay: 10s;
        }
        .animation-delay-12000 {
          animation-delay: 12s;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
