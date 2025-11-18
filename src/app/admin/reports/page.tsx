'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'
import { 
  FileText, 
  Download, 
  Calendar, 
  DollarSign, 
  Package, 
  TrendingUp,
  Users,
  CreditCard,
  CheckCircle,
  Clock
} from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import ExcelJS from 'exceljs'
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } from 'docx'
import AdminPageLayout from '@/components/admin/admin-page-layout'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface ReportData {
  summary: {
    totalOrders: number
    totalRevenue: number
    paidOrders: number
    pendingOrders: number
    inProcessOrders: number
    completedOrders: number
    averageOrderValue: number
    paymentSuccessRate: number
  }
  revenueByPaymentMethod: Record<string, number>
  ordersByService: Record<string, number>
  monthlyRevenue: Array<{ month: string; revenue: number; orders: number }>
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>
  orders: Array<{
    invoiceNumber: string
    customerName: string
    customerEmail: string
    customerPhone: string
    serviceName: string
    weight: number
    totalCost: number
    status: string
    orderDate: string
    paymentMethod: string
    paymentStatus: string
    paymentAmount: number
    paymentDate?: string
    hasPaymentProof: boolean
  }>
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)

      const response = await fetch(`/api/admin/reports?${params}`)
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = async () => {
    if (!reportData) return
    
    setExporting('PDF')
    try {
      const pdf = new jsPDF()
      const pageWidth = pdf.internal.pageSize.getWidth()
      
      // Title
      pdf.setFontSize(20)
      pdf.text('Laporan Sentul-Laundry', pageWidth / 2, 20, { align: 'center' })
      
      // Date range
      pdf.setFontSize(12)
      const dateText = dateRange.startDate && dateRange.endDate 
        ? `Periode: ${dateRange.startDate} - ${dateRange.endDate}`
        : 'Semua Data'
      pdf.text(dateText, pageWidth / 2, 30, { align: 'center' })
      
      // Summary
      pdf.setFontSize(14)
      pdf.text('Ringkasan', 20, 50)
      pdf.setFontSize(10)
      pdf.text(`Total Pesanan: ${reportData.summary.totalOrders}`, 20, 60)
      pdf.text(`Total Pendapatan: Rp ${reportData.summary.totalRevenue.toLocaleString()}`, 20, 70)
      pdf.text(`Pesanan Dibayar: ${reportData.summary.paidOrders}`, 20, 80)
      pdf.text(`Rata-rata Nilai Pesanan: Rp ${reportData.summary.averageOrderValue.toLocaleString()}`, 20, 90)
      
      // Add chart as image
      const chartElement = document.getElementById('revenue-chart')
      if (chartElement) {
        const canvas = await html2canvas(chartElement)
        const imgData = canvas.toDataURL('image/png')
        pdf.addPage()
        pdf.text('Grafik Pendapatan Bulanan', 20, 20)
        pdf.addImage(imgData, 'PNG', 20, 30, 170, 100)
      }
      
      pdf.save(`laporan-laundrypro-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
    } finally {
      setExporting('')
    }
  }

  const exportToExcel = async () => {
    if (!reportData) return
    
    setExporting('Excel')
    try {
      const wb = new ExcelJS.Workbook()
      
      // Summary sheet
      const summaryWs = wb.addWorksheet('Ringkasan')
      summaryWs.columns = [
        { header: 'Metrik', key: 'metric', width: 25 },
        { header: 'Nilai', key: 'value', width: 20 }
      ]
      summaryWs.addRow({ metric: 'Total Pesanan', value: reportData.summary.totalOrders })
      summaryWs.addRow({ metric: 'Total Pendapatan', value: reportData.summary.totalRevenue })
      summaryWs.addRow({ metric: 'Pesanan Dibayar', value: reportData.summary.paidOrders })
      summaryWs.addRow({ metric: 'Pesanan Pending', value: reportData.summary.pendingOrders })
      summaryWs.addRow({ metric: 'Pesanan Proses', value: reportData.summary.inProcessOrders })
      summaryWs.addRow({ metric: 'Pesanan Selesai', value: reportData.summary.completedOrders })
      summaryWs.addRow({ metric: 'Rata-rata Nilai Pesanan', value: reportData.summary.averageOrderValue })
      summaryWs.addRow({ metric: 'Tingkat Keberhasilan Pembayaran', value: `${reportData.summary.paymentSuccessRate.toFixed(1)}%` })
      
      // Orders sheet
      const ordersWs = wb.addWorksheet('Pesanan')
      ordersWs.columns = [
        { header: 'Invoice', key: 'invoice', width: 15 },
        { header: 'Customer', key: 'customer', width: 20 },
        { header: 'Layanan', key: 'service', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Metode Pembayaran', key: 'paymentMethod', width: 20 },
        { header: 'Status Pembayaran', key: 'paymentStatus', width: 15 },
        { header: 'Jumlah', key: 'amount', width: 15 },
        { header: 'Tanggal', key: 'date', width: 15 }
      ]
      reportData.orders.forEach(order => {
        ordersWs.addRow({
          invoice: order.invoiceNumber,
          customer: order.customerName,
          service: order.serviceName,
          status: order.status,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          amount: order.paymentAmount,
          date: new Date(order.orderDate).toLocaleDateString('id-ID')
        })
      })
      
      // Generate and download file
      const buffer = await wb.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-laundrypro-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting Excel:', error)
    } finally {
      setExporting('')
    }
  }

  const exportToWord = async () => {
    if (!reportData) return
    
    setExporting('Word')
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Laporan Sentul-Laundry",
                  bold: true,
                  size: 32
                })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Periode: ${dateRange.startDate && dateRange.endDate ? `${dateRange.startDate} - ${dateRange.endDate}` : 'Semua Data'}`,
                  size: 24
                })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Ringkasan",
                  bold: true,
                  size: 28
                })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun(`Total Pesanan: ${reportData.summary.totalOrders}`)
              ]
            }),
            new Paragraph({
              children: [
                new TextRun(`Total Pendapatan: Rp ${reportData.summary.totalRevenue.toLocaleString()}`)
              ]
            }),
            new Paragraph({
              children: [
                new TextRun(`Pesanan Dibayar: ${reportData.summary.paidOrders}`)
              ]
            }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Invoice")] }),
                    new TableCell({ children: [new Paragraph("Customer")] }),
                    new TableCell({ children: [new Paragraph("Layanan")] }),
                    new TableCell({ children: [new Paragraph("Status")] })
                  ]
                }),
                ...reportData.orders.slice(0, 10).map(order => 
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(order.invoiceNumber)] }),
                      new TableCell({ children: [new Paragraph(order.customerName)] }),
                      new TableCell({ children: [new Paragraph(order.serviceName)] }),
                      new TableCell({ children: [new Paragraph(order.status)] })
                    ]
                  })
                )
              ]
            })
          ]
        }]
      })

      const buffer = await Packer.toBuffer(doc)
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-laundrypro-${new Date().toISOString().split('T')[0]}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting Word:', error)
    } finally {
      setExporting('')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat data laporan...</div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Gagal memuat data laporan</div>
      </div>
    )
  }

  // Chart data
  const monthlyRevenueChartData = {
    labels: reportData.monthlyRevenue.map(item => item.month),
    datasets: [
      {
        label: 'Pendapatan (Rp)',
        data: reportData.monthlyRevenue.map(item => item.revenue),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1
      }
    ]
  }

  const ordersByServiceChartData = {
    labels: Object.keys(reportData.ordersByService),
    datasets: [
      {
        label: 'Jumlah Pesanan',
        data: Object.values(reportData.ordersByService),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ]
      }
    ]
  }

  const paymentMethodChartData = {
    labels: Object.keys(reportData.revenueByPaymentMethod),
    datasets: [
      {
        data: Object.values(reportData.revenueByPaymentMethod),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ]
      }
    ]
  }

  return (
    <AdminPageLayout 
      title="Laporan" 
      description="Analisis dan ekspor data laporan Sentul-Laundry"
      currentPage="reports"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end items-center space-x-2">
          <Button
            onClick={exportToPDF}
            disabled={!!exporting}
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            {exporting === 'PDF' ? 'Mengekspor...' : 'Export PDF'}
          </Button>
          <Button
            onClick={exportToExcel}
            disabled={!!exporting}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting === 'Excel' ? 'Mengekspor...' : 'Export Excel'}
          </Button>
          <Button
            onClick={exportToWord}
            disabled={!!exporting}
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            {exporting === 'Word' ? 'Mengekspor...' : 'Export Word'}
          </Button>
        </div>

      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Tanggal</CardTitle>
          <CardDescription>Pilih rentang tanggal untuk laporan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Tanggal Selesai</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
          <Button 
            onClick={fetchReportData} 
            className="mt-4 bg-teal-600 hover:bg-teal-700"
          >
            Terapkan Filter
          </Button>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.summary.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.summary.completedOrders} selesai
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {reportData.summary.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.summary.paymentSuccessRate.toFixed(1)}% tingkat keberhasilan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesanan Dibayar</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.summary.paidOrders}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.summary.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {reportData.summary.averageOrderValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              per pesanan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Pendapatan</TabsTrigger>
          <TabsTrigger value="services">Layanan</TabsTrigger>
          <TabsTrigger value="payments">Pembayaran</TabsTrigger>
          <TabsTrigger value="orders">Pesanan</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Pendapatan Bulanan</CardTitle>
              <CardDescription>Grafik pendapatan 12 bulan terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <div id="revenue-chart">
                <Line data={monthlyRevenueChartData} height={100} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Pesanan per Layanan</CardTitle>
              <CardDescription>Distribusi pesanan berdasarkan jenis layanan</CardDescription>
            </CardHeader>
            <CardContent>
              <Bar data={ordersByServiceChartData} height={100} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Pendapatan per Metode Pembayaran</CardTitle>
              <CardDescription>Distribusi pendapatan berdasarkan metode pembayaran</CardDescription>
            </CardHeader>
            <CardContent>
              <Pie data={paymentMethodChartData} height={100} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Detail Pesanan</CardTitle>
              <CardDescription>Daftar semua pesanan dalam periode yang dipilih</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Invoice</th>
                      <th className="text-left p-2">Customer</th>
                      <th className="text-left p-2">Layanan</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Pembayaran</th>
                      <th className="text-left p-2">Jumlah</th>
                      <th className="text-left p-2">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.orders.slice(0, 20).map((order, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{order.invoiceNumber}</td>
                        <td className="p-2">{order.customerName}</td>
                        <td className="p-2">{order.serviceName}</td>
                        <td className="p-2">
                          <Badge className={
                            order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'In Process' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="p-2">{order.paymentMethod}</td>
                        <td className="p-2">Rp {order.paymentAmount.toLocaleString()}</td>
                        <td className="p-2">{new Date(order.orderDate).toLocaleDateString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminPageLayout>
  )
}