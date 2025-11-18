'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  CreditCard,
  Package,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts'

interface ReportData {
  revenue: Array<{ date: string; amount: number }>
  orderStatus: Array<{ status: string; count: number }>
  paymentMethods: Array<{ method: string; count: number; amount: number }>
  services: Array<{ name: string; count: number; revenue: number }>
  topCustomers: Array<{ name: string; orderCount: number; totalSpent: number }>
  summary: {
    totalRevenue: number
    totalOrders: number
    totalCustomers: number
    averageOrderValue: number
  }
}

const COLORS = ['#00897B', '#26A69A', '#4DB6AC', '#80CBC4', '#B2DFDB']

export default function ReportsManagement() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('monthly')

  useEffect(() => {
    fetchReports()
  }, [period])

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/admin/reports?period=${period}`)
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#F59E0B'
      case 'In Process': return '#3B82F6'
      case 'Completed': return '#10B981'
      case 'Delivered': return '#059669'
      case 'Canceled': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short' 
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>
  }

  if (!reportData) {
    return <div className="text-center py-8">No data available</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Laporan & Analitik</h3>
          <p className="text-sm text-gray-600">Lihat laporan pendapatan dan statistik bisnis</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Minggu Ini</SelectItem>
              <SelectItem value="monthly">Bulan Ini</SelectItem>
              <SelectItem value="yearly">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchReports}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {reportData.summary.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Periode {period === 'weekly' ? 'minggu' : period === 'monthly' ? 'bulan' : 'tahun'} ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {reportData.summary.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Semua status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {reportData.summary.totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground">
              Pelanggan aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Nilai Pesanan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              Rp {Math.round(reportData.summary.averageOrderValue).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaksi
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              <span>Grafik Pendapatan</span>
            </CardTitle>
            <CardDescription>Pendapatan per periode waktu</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                />
                <YAxis 
                  tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(1)}jt`}
                />
                <Tooltip 
                  formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Pendapatan']}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Bar dataKey="amount" fill="#00897B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-teal-600" />
              <span>Distribusi Status Pesanan</span>
            </CardTitle>
            <CardDescription>Jumlah pesanan per status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={reportData.orderStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {reportData.orderStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-teal-600" />
              <span>Metode Pembayaran</span>
            </CardTitle>
            <CardDescription>Distribusi metode pembayaran</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.paymentMethods}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'count' ? value : `Rp ${value.toLocaleString()}`,
                    name === 'count' ? 'Jumlah' : 'Total'
                  ]}
                />
                <Legend />
                <Bar dataKey="count" fill="#26A69A" name="Jumlah" />
                <Bar dataKey="amount" fill="#4DB6AC" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Popularity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-teal-600" />
              <span>Popularitas Layanan</span>
            </CardTitle>
            <CardDescription>Layanan paling populer</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.services} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'count' ? value : `Rp ${value.toLocaleString()}`,
                    name === 'count' ? 'Pesanan' : 'Pendapatan'
                  ]}
                />
                <Legend />
                <Bar dataKey="count" fill="#00897B" name="Pesanan" />
                <Bar dataKey="revenue" fill="#26A69A" name="Pendapatan" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-teal-600" />
            <span>Pelanggan Terbaik</span>
          </CardTitle>
          <CardDescription>10 pelanggan dengan pesanan terbanyak</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.topCustomers.map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-teal-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.orderCount} pesanan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    Rp {customer.totalSpent.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total pengeluaran</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}