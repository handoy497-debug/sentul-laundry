'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trash2, 
  AlertTriangle, 
  Database, 
  Calendar,
  Download,
  RefreshCw,
  Users,
  Package,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Bomb
} from 'lucide-react'
import ExcelJS from 'exceljs'
import AdminPageLayout from '@/components/admin/admin-page-layout'

interface DataInfo {
  totalData: {
    orders: number
    customers: number
    payments: number
  }
  oldData: {
    ordersOlderThan30Days: number
    ordersOlderThan90Days: number
    ordersOlderThan1Year: number
  }
  statusBreakdown: {
    completedOrders: number
    deliveredOrders: number
    paidPayments: number
  }
}

export default function DataManagementPage() {
  const [dataInfo, setDataInfo] = useState<DataInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)
  const [deleteAllConfirmed, setDeleteAllConfirmed] = useState(false)
  const [deleteConfig, setDeleteConfig] = useState({
    dataType: '',
    olderThan: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchDataInfo()
  }, [])

  const fetchDataInfo = async () => {
    try {
      const response = await fetch('/api/admin/data-management')
      const data = await response.json()
      setDataInfo(data)
    } catch (error) {
      console.error('Error fetching data info:', error)
      setMessage({ type: 'error', text: 'Gagal memuat informasi data' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(deleteConfig.dataType)
    setShowConfirm(false)
    
    try {
      const params = new URLSearchParams()
      params.append('type', deleteConfig.dataType)
      
      if (deleteConfig.olderThan) {
        params.append('olderThan', deleteConfig.olderThan)
      }
      if (deleteConfig.status) {
        params.append('status', deleteConfig.status)
      }
      if (deleteConfig.dateFrom && deleteConfig.dateTo) {
        params.append('dateFrom', deleteConfig.dateFrom)
        params.append('dateTo', deleteConfig.dateTo)
      }

      const response = await fetch(`/api/admin/data-management?${params}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Berhasil menghapus ${result.deletedCount} ${deleteConfig.dataType}` 
        })
        fetchDataInfo()
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Gagal menghapus data' 
        })
      }
    } catch (error) {
      console.error('Error deleting data:', error)
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menghapus data' })
    } finally {
      setDeleting('')
      setDeleteConfig({ dataType: '', olderThan: '', status: '', dateFrom: '', dateTo: '' })
    }
  }

  const handleDeleteAll = async () => {
    setDeleting('all')
    setShowDeleteAllConfirm(false)
    
    try {
      const response = await fetch('/api/admin/data-management?type=all', {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Berhasil menghapus semua data. ${result.message}` 
        })
        fetchDataInfo()
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Gagal menghapus semua data' 
        })
      }
    } catch (error) {
      console.error('Error deleting all data:', error)
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menghapus semua data' })
    } finally {
      setDeleting('')
      setDeleteAllConfirmed(false)
    }
  }

  const confirmDeleteAll = () => {
    if (deleteAllConfirmed) {
      handleDeleteAll()
    } else {
      setShowDeleteAllConfirm(true)
    }
  }

  const confirmDelete = (config: typeof deleteConfig) => {
    setDeleteConfig(config)
    setShowConfirm(true)
  }

  const backupData = async () => {
    try {
      // Fetch all data for backup
      const [ordersResponse, customersResponse, paymentsResponse] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/admin/customers'),
        fetch('/api/admin/payments')
      ])

      const orders = await ordersResponse.json()
      const customers = await customersResponse.json()
      const payments = await paymentsResponse.json()

      // Create Excel workbook
      const wb = new ExcelJS.Workbook()

      // Orders sheet
      const ordersWs = wb.addWorksheet('Pesanan')
      ordersWs.columns = [
        { header: 'Invoice', key: 'invoice', width: 15 },
        { header: 'Customer', key: 'customer', width: 20 },
        { header: 'Service', key: 'service', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Total', key: 'total', width: 15 },
        { header: 'Date', key: 'date', width: 15 }
      ]
      orders.forEach((order: any) => {
        ordersWs.addRow({
          invoice: order.invoiceNumber,
          customer: order.customer?.name || 'Unknown',
          service: order.service?.serviceName || 'Unknown',
          status: order.status,
          total: order.totalCost || 0,
          date: new Date(order.orderDate).toLocaleDateString('id-ID')
        })
      })

      // Customers sheet
      const customersWs = wb.addWorksheet('Pelanggan')
      customersWs.columns = [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'Created Date', key: 'createdDate', width: 15 }
      ]
      customers.forEach((customer: any) => {
        customersWs.addRow({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          createdDate: new Date(customer.createdAt).toLocaleDateString('id-ID')
        })
      })

      // Payments sheet
      const paymentsWs = wb.addWorksheet('Pembayaran')
      paymentsWs.columns = [
        { header: 'Order ID', key: 'orderId', width: 15 },
        { header: 'Method', key: 'method', width: 15 },
        { header: 'Amount', key: 'amount', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Date', key: 'date', width: 15 }
      ]
      payments.forEach((payment: any) => {
        paymentsWs.addRow({
          orderId: payment.orderId,
          method: payment.paymentMethod,
          amount: payment.amount,
          status: payment.status,
          date: payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('id-ID') : 'N/A'
        })
      })

      // Generate and download file
      const buffer = await wb.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-laundrypro-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      setMessage({ type: 'success', text: 'Backup berhasil diunduh' })
    } catch (error) {
      console.error('Error backing up data:', error)
      setMessage({ type: 'error', text: 'Gagal membuat backup' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat informasi data...</div>
      </div>
    )
  }

  if (!dataInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Gagal memuat informasi data</div>
      </div>
    )
  }

  return (
    <AdminPageLayout 
      title="Manajemen Data" 
      description="Kelola dan bersihkan data yang sudah menumpuk"
      currentPage="data-management"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end items-center space-x-2">
          <Button
            onClick={backupData}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Backup Data
          </Button>
          <Button
            onClick={fetchDataInfo}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Alert Message */}
        {message.text && (
          <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

      {/* Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataInfo.totalData.orders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataInfo.totalData.customers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pembayaran</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataInfo.totalData.payments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">&gt; 30 Hari</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{dataInfo.oldData.ordersOlderThan30Days}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">&gt; 90 Hari</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dataInfo.oldData.ordersOlderThan90Days}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">&gt; 1 Tahun</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{dataInfo.oldData.ordersOlderThan1Year}</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Hapus Pesanan</TabsTrigger>
          <TabsTrigger value="customers">Hapus Pelanggan</TabsTrigger>
          <TabsTrigger value="payments">Hapus Pembayaran</TabsTrigger>
          <TabsTrigger value="delete-all" className="text-red-600">Hapus Semua Data</TabsTrigger>
        </TabsList>

        {/* Orders Deletion */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                <span>Hapus Data Pesanan</span>
              </CardTitle>
              <CardDescription>
                Hapus pesanan lama berdasarkan tanggal atau status. Pembayaran terkait juga akan dihapus.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Hapus Pesanan Lebih Dari</Label>
                  <Select onValueChange={(value) => setDeleteConfig(prev => ({ ...prev, olderThan: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih periode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Hari</SelectItem>
                      <SelectItem value="60">60 Hari</SelectItem>
                      <SelectItem value="90">90 Hari</SelectItem>
                      <SelectItem value="180">6 Bulan</SelectItem>
                      <SelectItem value="365">1 Tahun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Hapus Berdasarkan Status</Label>
                  <Select onValueChange={(value) => setDeleteConfig(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Completed">Selesai</SelectItem>
                      <SelectItem value="Delivered">Terkirim</SelectItem>
                      <SelectItem value="Canceled">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFrom">Dari Tanggal</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    onChange={(e) => setDeleteConfig(prev => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo">Sampai Tanggal</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    onChange={(e) => setDeleteConfig(prev => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => confirmDelete({ ...deleteConfig, dataType: 'orders' })}
                  disabled={deleting === 'orders' || (!deleteConfig.olderThan && !deleteConfig.dateFrom)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting === 'orders' ? 'Menghapus...' : 'Hapus Pesanan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Deletion */}
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                <span>Hapus Data Pelanggan</span>
              </CardTitle>
              <CardDescription>
                Hanya pelanggan tanpa pesanan yang dapat dihapus untuk menjaga integritas data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hapus Pelanggan Tanpa Pesanan (Lebih Dari)</Label>
                <Select onValueChange={(value) => setDeleteConfig(prev => ({ ...prev, olderThan: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih periode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Hari</SelectItem>
                    <SelectItem value="60">60 Hari</SelectItem>
                    <SelectItem value="90">90 Hari</SelectItem>
                    <SelectItem value="180">6 Bulan</SelectItem>
                    <SelectItem value="365">1 Tahun</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => confirmDelete({ ...deleteConfig, dataType: 'customers' })}
                disabled={deleting === 'customers' || !deleteConfig.olderThan}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting === 'customers' ? 'Menghapus...' : 'Hapus Pelanggan'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Deletion */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                <span>Hapus Data Pembayaran</span>
              </CardTitle>
              <CardDescription>
                Hapus data pembayaran lama atau dengan status tertentu.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Hapus Pembayaran Lebih Dari</Label>
                  <Select onValueChange={(value) => setDeleteConfig(prev => ({ ...prev, olderThan: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih periode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Hari</SelectItem>
                      <SelectItem value="60">60 Hari</SelectItem>
                      <SelectItem value="90">90 Hari</SelectItem>
                      <SelectItem value="180">6 Bulan</SelectItem>
                      <SelectItem value="365">1 Tahun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Hapus Berdasarkan Status</Label>
                  <Select onValueChange={(value) => setDeleteConfig(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unpaid">Belum Dibayar</SelectItem>
                      <SelectItem value="Pending Confirmation">Menunggu Konfirmasi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() => confirmDelete({ ...deleteConfig, dataType: 'payments' })}
                disabled={deleting === 'payments' || (!deleteConfig.olderThan && !deleteConfig.status)}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting === 'payments' ? 'Menghapus...' : 'Hapus Pembayaran'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delete All Data */}
        <TabsContent value="delete-all">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <Bomb className="h-5 w-5" />
                <span>Hapus Semua Data</span>
              </CardTitle>
              <CardDescription className="text-red-600">
                ⚠️ PERINGATAN: Ini akan menghapus SEMUA data dari sistem termasuk pesanan, pelanggan, pembayaran, dan layanan. 
                Tindakan ini TIDAK DAPAT dibatalkan dan akan mengembalikan sistem ke kondisi kosong.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">Data yang akan dihapus:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Semua data pesanan ({dataInfo.totalData.orders} pesanan)</li>
                  <li>• Semua data pelanggan ({dataInfo.totalData.customers} pelanggan)</li>
                  <li>• Semua data pembayaran ({dataInfo.totalData.payments} pembayaran)</li>
                  <li>• Semua data layanan</li>
                  <li>• Semua data harga</li>
                  <li>• Semua log aktivitas</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Sebelum melanjutkan:</h4>
                <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                  <li>Pastikan Anda sudah membuat backup data</li>
                  <li> pastikan tidak ada pesanan yang sedang diproses</li>
                  <li>Informasikan kepada tim terkait</li>
                  <li>Lakukan di luar jam operasional</li>
                </ol>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="confirmDeleteAll"
                  checked={deleteAllConfirmed}
                  onChange={(e) => setDeleteAllConfirmed(e.target.checked)}
                  className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <Label htmlFor="confirmDeleteAll" className="text-sm text-gray-700">
                  Saya memahami konsekuensi dan ingin menghapus semua data
                </Label>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={confirmDeleteAll}
                  disabled={!deleteAllConfirmed || deleting === 'all'}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting === 'all' ? 'Menghapus Semua Data...' : 'Hapus Semua Data Permanen'}
                </Button>
                <Button
                  onClick={backupData}
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Backup Data Dulu
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span>Konfirmasi Hapus Data</span>
              </CardTitle>
              <CardDescription>
                Tindakan ini tidak dapat dibatalkan. Data yang dihapus akan hilang permanen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-3 rounded">
                <p className="text-sm text-red-800">
                  Anda akan menghapus data {deleteConfig.dataType} dengan filter:
                </p>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  {deleteConfig.olderThan && <li>• Lebih dari {deleteConfig.olderThan} hari</li>}
                  {deleteConfig.status && <li>• Status: {deleteConfig.status}</li>}
                  {deleteConfig.dateFrom && deleteConfig.dateTo && (
                    <li>• Tanggal: {deleteConfig.dateFrom} - {deleteConfig.dateTo}</li>
                  )}
                </ul>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleDelete}
                  disabled={deleting !== ''}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting ? 'Menghapus...' : 'Ya, Hapus Data'}
                </Button>
                <Button
                  onClick={() => setShowConfirm(false)}
                  variant="outline"
                >
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete All Confirmation Dialog */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <Bomb className="h-6 w-6" />
                <span>KONFIRMASI HAPUS SEMUA DATA</span>
              </CardTitle>
              <CardDescription className="text-red-600 font-semibold">
                ⚠️ TINDAKAN KRITIS - TIDAK DAPAT DIBATALKAN ⚠️
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
                <h4 className="font-bold text-red-800 mb-3 text-center">DATA YANG AKAN DIHAPUS PERMANEN:</h4>
                <ul className="text-sm text-red-700 space-y-2 font-medium">
                  <li>📄 Semua Pesanan ({dataInfo?.totalData.orders || 0} pesanan)</li>
                  <li>👥 Semua Pelanggan ({dataInfo?.totalData.customers || 0} pelanggan)</li>
                  <li>💳 Semua Pembayaran ({dataInfo?.totalData.payments || 0} pembayaran)</li>
                  <li>🧵 Semua Layanan dan Harga</li>
                  <li>📊 Semua Log Aktivitas</li>
                  <li>⚙️ Semua Konfigurasi Sistem</li>
                </ul>
              </div>
              
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                <p className="text-sm text-yellow-800 font-medium text-center">
                  Sistem akan dikembalikan ke kondisi kosong seperti baru diinstall
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="finalConfirm"
                  checked={deleteAllConfirmed}
                  onChange={(e) => setDeleteAllConfirmed(e.target.checked)}
                  className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <Label htmlFor="finalConfirm" className="text-sm font-medium text-gray-700">
                  Saya yakin ingin menghapus SEMUA data dan memahami konsekuensinya
                </Label>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleDeleteAll}
                  disabled={!deleteAllConfirmed || deleting === 'all'}
                  className="bg-red-600 hover:bg-red-700 flex-1"
                >
                  {deleting === 'all' ? 'Menghapus...' : 'YA, HAPUS SEMUA DATA'}
                </Button>
                <Button
                  onClick={() => {
                    setShowDeleteAllConfirm(false)
                    setDeleteAllConfirmed(false)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  BATAL
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </AdminPageLayout>
  )
}