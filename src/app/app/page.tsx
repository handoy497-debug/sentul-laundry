'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Home
} from 'lucide-react'
import Link from 'next/link'

interface Service {
  id: string
  serviceName: string
  description: string
  basePricePerKg: number
  estimatedTime: string
  prices: Array<{
    pricePerKg: number
    effectiveDate: string
  }>
}

interface Order {
  id: string
  invoiceNumber: string
  customer: {
    name: string
    email: string
    phone: string
    address: string
  }
  service: Service
  weight: number
  totalCost: number
  status: string
  orderDate: string
  payments?: Array<{
    id: string
    paymentMethod: string
    amount: number
    status: string
    paymentDate?: string
    paymentProof?: string
  }>
}

interface AdminInfo {
  qrisImage?: string
  bankAccount?: string
}

export default function AppPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [orderData, setOrderData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    serviceId: '',
    estimatedWeight: '',
    paymentMethod: '',
    promoCode: ''
  })
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null)
  const [orderHistory, setOrderHistory] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState('services')
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [uploadingProof, setUploadingProof] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null)
  const [promoError, setPromoError] = useState('')
  const [validatingPromo, setValidatingPromo] = useState(false)

  useEffect(() => {
    fetchServices()
    fetchAdminInfo()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminInfo = async () => {
    try {
      const response = await fetch('/api/admin/payment-info')
      const data = await response.json()
      setAdminInfo(data)
    } catch (error) {
      console.error('Error fetching admin info:', error)
    }
  }

  const validatePromoCode = async () => {
    if (!orderData.promoCode.trim()) {
      setPromoError('')
      setAppliedDiscount(null)
      return
    }

    setValidatingPromo(true)
    setPromoError('')

    try {
      const response = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ promoCode: orderData.promoCode }),
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setAppliedDiscount(data.discount)
        setPromoError('')
      } else {
        setPromoError(data.error || 'Invalid promo code')
        setAppliedDiscount(null)
      }
    } catch (error) {
      console.error('Error validating promo code:', error)
      setPromoError('Failed to validate promo code')
      setAppliedDiscount(null)
    } finally {
      setValidatingPromo(false)
    }
  }

  const calculateTotalCost = () => {
    if (!orderData.serviceId || !orderData.estimatedWeight) return 0

    const service = services.find(s => s.id === orderData.serviceId)
    if (!service) return 0

    const weight = parseFloat(orderData.estimatedWeight)
    if (isNaN(weight) || weight <= 0) return 0

    let totalCost = weight * service.basePricePerKg

    if (appliedDiscount) {
      const discountAmount = totalCost * (appliedDiscount.discountPercent / 100)
      totalCost = totalCost - discountAmount
    }

    return totalCost
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const orderPayload = {
        ...orderData,
        discountId: appliedDiscount?.id || null
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      })
      
      if (response.ok) {
        const order = await response.json()
        setCreatedOrder(order)
        if (order.appliedDiscount) {
          setAppliedDiscount(order.appliedDiscount)
        }
        setActiveTab('confirmation')
      } else {
        alert('Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Failed to create order')
    }
  }

  const handleTrackOrder = async () => {
    if (!trackingNumber) return
    
    try {
      const response = await fetch(`/api/orders/track?number=${trackingNumber}`)
      const data = await response.json()
      
      if (response.ok) {
        setTrackedOrder(data)
      } else {
        alert('Order not found')
        setTrackedOrder(null)
      }
    } catch (error) {
      console.error('Error tracking order:', error)
      alert('Failed to track order')
    }
  }

  const fetchOrderHistory = async (phone: string) => {
    try {
      const response = await fetch(`/api/orders/history?phone=${phone}`)
      const data = await response.json()
      
      if (response.ok) {
        setOrderHistory(data)
      } else {
        setOrderHistory([])
      }
    } catch (error) {
      console.error('Error fetching order history:', error)
      setOrderHistory([])
    }
  }

  const uploadPaymentProof = async (orderId: string) => {
    if (!paymentProofFile) {
      alert('Pilih file bukti pembayaran terlebih dahulu')
      return
    }

    setUploadingProof(true)
    try {
      const formData = new FormData()
      formData.append('paymentProof', paymentProofFile)

      const response = await fetch(`/api/orders/${orderId}/payment-proof`, {
        method: 'POST',
        body: formData
      })

      const responseData = await response.json()

      if (response.ok) {
        alert('Bukti pembayaran berhasil diupload!')
        setPaymentProofFile(null)
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        handleTrackOrder()
      } else {
        alert(`Gagal mengupload bukti pembayaran: ${responseData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error uploading payment proof:', error)
      alert('Gagal mengupload bukti pembayaran. Periksa koneksi internet Anda.')
    } finally {
      setUploadingProof(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'In Process': return 'bg-blue-100 text-blue-800'
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'Delivered': return 'bg-emerald-100 text-emerald-800'
      case 'Canceled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCurrentPrice = (service: Service) => {
    return service.prices.length > 0 ? service.prices[0].pricePerKg : service.basePricePerKg
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-teal-600">
                <ArrowLeft className="h-5 w-5" />
                <span>Kembali</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-teal-600" />
                <h1 className="text-2xl font-bold text-teal-600">Sentul-Laundry</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Beranda
                </Button>
              </Link>
              <Button variant="outline" size="sm" asChild>
                <a href="/admin/login">Admin Login</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Aplikasi Laundry</h2>
          <p className="text-gray-600">Kelola pesanan laundry Anda dengan mudah</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="services">Layanan</TabsTrigger>
            <TabsTrigger value="order">Pesan</TabsTrigger>
            <TabsTrigger value="track">Lacak</TabsTrigger>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
            <TabsTrigger value="confirmation">Konfirmasi</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6" id="services">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Layanan Laundry Kami</h3>
              <p className="text-gray-600">Pilih layanan yang sesuai dengan kebutuhan Anda</p>
            </div>
            
            {loading ? (
              <div className="text-center py-12">Memuat layanan...</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow border-teal-100">
                    <CardHeader>
                      <CardTitle className="text-teal-700">{service.serviceName}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-teal-600" />
                          <span className="font-semibold text-teal-600">
                            Rp {getCurrentPrice(service).toLocaleString()}/kg
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{service.estimatedTime}</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-teal-600 hover:bg-teal-700"
                        onClick={() => {
                          setOrderData(prev => ({ ...prev, serviceId: service.id }))
                          setActiveTab('order')
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
            <Card>
              <CardHeader>
                <CardTitle className="text-teal-700">Formulir Pemesanan</CardTitle>
                <CardDescription>Isi data lengkap untuk melakukan pemesanan</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitOrder} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Nama Lengkap</Label>
                      <Input
                        id="customerName"
                        value={orderData.customerName}
                        onChange={(e) => setOrderData(prev => ({ ...prev, customerName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Email</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={orderData.customerEmail}
                        onChange={(e) => setOrderData(prev => ({ ...prev, customerEmail: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Nomor Telepon</Label>
                      <Input
                        id="customerPhone"
                        value={orderData.customerPhone}
                        onChange={(e) => setOrderData(prev => ({ ...prev, customerPhone: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedWeight">Estimasi Berat (kg)</Label>
                      <Input
                        id="estimatedWeight"
                        type="number"
                        step="0.1"
                        value={orderData.estimatedWeight}
                        onChange={(e) => setOrderData(prev => ({ ...prev, estimatedWeight: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerAddress">Alamat Lengkap</Label>
                    <Textarea
                      id="customerAddress"
                      value={orderData.customerAddress}
                      onChange={(e) => setOrderData(prev => ({ ...prev, customerAddress: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serviceId">Layanan</Label>
                      <Select value={orderData.serviceId} onValueChange={(value) => setOrderData(prev => ({ ...prev, serviceId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih layanan" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.serviceName} - Rp {getCurrentPrice(service).toLocaleString()}/kg
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                      <Select value={orderData.paymentMethod} onValueChange={(value) => setOrderData(prev => ({ ...prev, paymentMethod: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih metode pembayaran" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash (Tunai)</SelectItem>
                          <SelectItem value="Transfer">Transfer Bank</SelectItem>
                          <SelectItem value="QRIS">QRIS / e-Wallet</SelectItem>
                          <SelectItem value="COD">COD (Bayar di Tempat)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Promo Code Section */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="promoCode">Kode Promo (Opsional)</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="promoCode"
                          type="text"
                          placeholder="Masukkan kode promo"
                          value={orderData.promoCode}
                          onChange={(e) => {
                            setOrderData(prev => ({ ...prev, promoCode: e.target.value.toUpperCase() }))
                            setPromoError('')
                          }}
                          onBlur={validatePromoCode}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={validatePromoCode}
                          disabled={validatingPromo || !orderData.promoCode.trim()}
                        >
                          {validatingPromo ? '...' : 'Terapkan'}
                        </Button>
                      </div>
                      {promoError && (
                        <p className="text-sm text-red-600">{promoError}</p>
                      )}
                      {appliedDiscount && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-green-800">{appliedDiscount.title}</p>
                              <p className="text-sm text-green-600">Diskon {appliedDiscount.discountPercent}%</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setOrderData(prev => ({ ...prev, promoCode: '' }))
                                setAppliedDiscount(null)
                                setPromoError('')
                              }}
                              className="text-red-600 hover:text-red-800"
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
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Harga Awal:</span>
                        <span>Rp {services.find(s => s.id === orderData.serviceId)?.basePricePerKg.toLocaleString()}/kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Berat:</span>
                        <span>{orderData.estimatedWeight} kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>Rp {(parseFloat(orderData.estimatedWeight) * services.find(s => s.id === orderData.serviceId)?.basePricePerKg || 0).toLocaleString()}</span>
                      </div>
                      {appliedDiscount && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Diskon ({appliedDiscount.discountPercent}%):</span>
                          <span>-Rp {((parseFloat(orderData.estimatedWeight) * services.find(s => s.id === orderData.serviceId)?.basePricePerKg || 0) * (appliedDiscount.discountPercent / 100)).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total Biaya:</span>
                        <span className="text-teal-600">Rp {calculateTotalCost().toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                    Buat Pesanan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Track Tab */}
          <TabsContent value="track" className="max-w-2xl mx-auto" id="track">
            <Card>
              <CardHeader>
                <CardTitle className="text-teal-700">Lacak Pesanan</CardTitle>
                <CardDescription>Masukkan nomor invoice atau nomor telepon untuk melacak pesanan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nomor invoice atau telepon"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                  <Button onClick={handleTrackOrder} className="bg-teal-600 hover:bg-teal-700">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {trackedOrder && (
                  <Card className="border-teal-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Detail Pesanan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="font-medium">No. Invoice:</span>
                        <span>{trackedOrder.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Pelanggan:</span>
                        <span>{trackedOrder.customer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Layanan:</span>
                        <span>{trackedOrder.service.serviceName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Berat:</span>
                        <span>{trackedOrder.weight} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Total:</span>
                        <span className="font-semibold">Rp {trackedOrder.totalCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Status:</span>
                        <Badge className={getStatusColor(trackedOrder.status)}>
                          {trackedOrder.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Tanggal:</span>
                        <span>{new Date(trackedOrder.orderDate).toLocaleDateString('id-ID')}</span>
                      </div>

                      {trackedOrder.payments && trackedOrder.payments.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Detail Pembayaran:</h4>
                          {trackedOrder.payments.map((payment) => (
                            <div key={payment.id} className="space-y-2">
                              <div className="flex justify-between">
                                <span>Metode:</span>
                                <span>{payment.paymentMethod}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Jumlah:</span>
                                <span>Rp {payment.amount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span>Status:</span>
                                <Badge className={getStatusColor(payment.status)}>
                                  {payment.status}
                                </Badge>
                              </div>
                              {payment.paymentProof && (
                                <div className="mt-2">
                                  <img 
                                    src={payment.paymentProof} 
                                    alt="Bukti Pembayaran" 
                                    className="w-32 h-32 object-cover rounded"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {trackedOrder.status === 'Pending' && trackedOrder.payments && trackedOrder.payments.some(p => p.status === 'Unpaid' || p.status === 'Pending') && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2">Upload Bukti Pembayaran:</h4>
                          <div className="space-y-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)}
                            />
                            <Button
                              onClick={() => uploadPaymentProof(trackedOrder.id)}
                              disabled={uploadingProof}
                              className="w-full bg-teal-600 hover:bg-teal-700"
                            >
                              {uploadingProof ? 'Mengupload...' : 'Upload Bukti Pembayaran'}
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
            <Card>
              <CardHeader>
                <CardTitle className="text-teal-700">Riwayat Pesanan</CardTitle>
                <CardDescription>Masukkan nomor telepon untuk melihat riwayat pesanan Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nomor telepon"
                    onChange={(e) => {
                      if (e.target.value.length >= 10) {
                        fetchOrderHistory(e.target.value)
                      }
                    }}
                  />
                  <Button 
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Nomor telepon"]') as HTMLInputElement
                      if (input?.value) {
                        fetchOrderHistory(input.value)
                      }
                    }}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {orderHistory.length > 0 && (
                  <div className="space-y-4">
                    {orderHistory.map((order) => (
                      <Card key={order.id} className="border-teal-100">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{order.invoiceNumber}</h4>
                              <p className="text-sm text-gray-600">{order.service.serviceName}</p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{new Date(order.orderDate).toLocaleDateString('id-ID')}</span>
                            <span className="font-medium">Rp {order.totalCost.toLocaleString()}</span>
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-teal-700">Pesanan Berhasil Dibuat!</CardTitle>
                  <CardDescription>Terima kasih telah memesan layanan kami</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Pesanan Anda telah dibuat</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Nomor invoice: <span className="font-mono font-bold">{createdOrder.invoiceNumber}</span>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Nama Pelanggan:</span>
                      <span>{createdOrder.customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Layanan:</span>
                      <span>{createdOrder.service.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimasi Berat:</span>
                      <span>{createdOrder.weight} kg</span>
                    </div>
                    {(createdOrder as any).appliedDiscount && (
                      <div className="flex justify-between text-green-600">
                        <span>Diskon ({(createdOrder as any).appliedDiscount.discountPercent}%):</span>
                        <span>-Rp {(createdOrder as any).appliedDiscount.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Total Biaya:</span>
                      <span className="font-semibold text-teal-600">Rp {createdOrder.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Metode Pembayaran:</span>
                      <span>{createdOrder.payments?.[0]?.paymentMethod || 'Cash'}</span>
                    </div>
                  </div>

                  {adminInfo && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Informasi Pembayaran:</h4>
                      {adminInfo.qrisImage && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Scan QRIS untuk pembayaran:</p>
                          <div className="flex justify-center">
                            <img 
                              src={adminInfo.qrisImage} 
                              alt="QRIS" 
                              className="max-w-xs w-auto h-auto object-contain"
                              style={{ maxHeight: '200px' }}
                            />
                          </div>
                        </div>
                      )}
                      {adminInfo.bankAccount && (
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm">{adminInfo.bankAccount}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-2 pt-4">
                    <Button 
                      onClick={() => {
                        setTrackingNumber(createdOrder.invoiceNumber)
                        setActiveTab('track')
                      }}
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                    >
                      Lacak Pesanan
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setCreatedOrder(null)
                        setOrderData({
                          customerName: '',
                          customerEmail: '',
                          customerPhone: '',
                          customerAddress: '',
                          serviceId: '',
                          estimatedWeight: '',
                          paymentMethod: '',
                          promoCode: ''
                        })
                        setAppliedDiscount(null)
                        setPromoError('')
                        setActiveTab('order')
                      }}
                      className="flex-1"
                    >
                      Pesan Lagi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-600 mb-4">Belum ada pesanan yang dibuat</p>
                  <Button 
                    onClick={() => setActiveTab('order')}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Buat Pesanan Baru
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}