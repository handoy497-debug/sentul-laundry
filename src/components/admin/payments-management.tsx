'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  User, 
  Phone, 
  Package,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Eye,
  Image as ImageIcon
} from 'lucide-react'

interface Payment {
  id: string
  paymentMethod: string
  amount: number
  status: string
  paymentDate?: string
  notes?: string
  createdAt: string
  paymentProof?: string
  order: {
    invoiceNumber: string
    customer: {
      name: string
      phone: string
    }
    service: {
      serviceName: string
    }
  }
}

export default function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterMethod, setFilterMethod] = useState<string>('all')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [updateForm, setUpdateForm] = useState({
    status: '',
    notes: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [adminInfo, setAdminInfo] = useState<{ qrisImage?: string; bankAccount?: string } | null>(null)

  useEffect(() => {
    fetchPayments()
    fetchAdminInfo()
  }, [filterStatus, filterMethod])

  const fetchAdminInfo = async () => {
    try {
      const response = await fetch('/api/admin/payment-info')
      const data = await response.json()
      setAdminInfo(data)
    } catch (error) {
      console.error('Error fetching admin info:', error)
    }
  }

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterMethod !== 'all') params.append('method', filterMethod)
      
      const response = await fetch(`/api/admin/payments?${params.toString()}`)
      const data = await response.json()
      setPayments(data)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePaymentStatus = async (paymentId: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateForm),
      })
      
      if (response.ok) {
        await fetchPayments()
        setIsUpdateDialogOpen(false)
        setSelectedPayment(null)
        setUpdateForm({ status: '', notes: '' })
        // Show success message
        alert('Payment updated successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to update payment: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      alert('Failed to update payment. Please check your connection and try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800'
      case 'Unpaid': return 'bg-red-100 text-red-800'
      case 'Pending Confirmation': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Cash': return <DollarSign className="h-4 w-4" />
      case 'Transfer': return <CreditCard className="h-4 w-4" />
      case 'QRIS': return <ImageIcon className="h-4 w-4" />
      case 'COD': return <Package className="h-4 w-4" />
      default: return <CreditCard className="h-4 w-4" />
    }
  }

  const openUpdateDialog = (payment: Payment) => {
    setSelectedPayment(payment)
    setUpdateForm({
      status: payment.status,
      notes: payment.notes || ''
    })
    setIsUpdateDialogOpen(true)
  }

  const viewPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsDetailDialogOpen(true)
  }

  if (loading) {
    return <div className="text-center py-8">Loading payments...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Manajemen Pembayaran</h3>
          <p className="text-sm text-gray-600">Kelola pembayaran dan verifikasi transaksi</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
              <SelectItem value="Pending Confirmation">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter Metode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Metode</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Transfer">Transfer</SelectItem>
              <SelectItem value="QRIS">QRIS</SelectItem>
              <SelectItem value="COD">COD</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchPayments}>
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
                <TableHead>Metode</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <span className="font-mono text-sm font-medium">{payment.order.invoiceNumber}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.order.customer.name}</div>
                      <div className="text-sm text-gray-600">{payment.order.customer.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-teal-600" />
                      <span>{payment.order.service.serviceName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getMethodIcon(payment.paymentMethod)}
                      <span>{payment.paymentMethod}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">
                        Rp {payment.amount.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {payment.paymentDate 
                          ? new Date(payment.paymentDate).toLocaleDateString()
                          : new Date(payment.createdAt).toLocaleDateString()
                        }
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewPaymentDetails(payment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUpdateDialog(payment)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      {selectedPayment && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detail Pembayaran</DialogTitle>
              <DialogDescription>Informasi lengkap pembayaran</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Invoice:</span>
                  <p className="font-medium">{selectedPayment.order.invoiceNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge className={getStatusColor(selectedPayment.status)}>
                    {selectedPayment.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Metode:</span>
                  <p className="font-medium">{selectedPayment.paymentMethod}</p>
                </div>
                <div>
                  <span className="text-gray-600">Jumlah:</span>
                  <p className="font-semibold text-green-600">
                    Rp {selectedPayment.amount.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div>
                <span className="text-gray-600">Pelanggan:</span>
                <p className="font-medium">{selectedPayment.order.customer.name}</p>
                <p className="text-sm text-gray-600">{selectedPayment.order.customer.phone}</p>
              </div>
              
              <div>
                <span className="text-gray-600">Layanan:</span>
                <p className="font-medium">{selectedPayment.order.service.serviceName}</p>
              </div>
              
              <div>
                <span className="text-gray-600">Tanggal Pembayaran:</span>
                <p className="font-medium">
                  {selectedPayment.paymentDate 
                    ? new Date(selectedPayment.paymentDate).toLocaleString()
                    : 'Belum dibayar'
                  }
                </p>
              </div>
              
              {selectedPayment.notes && (
                <div>
                  <span className="text-gray-600">Catatan:</span>
                  <p className="font-medium">{selectedPayment.notes}</p>
                </div>
              )}

              {selectedPayment.paymentMethod === 'QRIS' && adminInfo?.qrisImage && (
                <div>
                  <span className="text-gray-600">QRIS Payment:</span>
                  <div className="mt-2 text-center">
                    <img 
                      src={adminInfo.qrisImage} 
                      alt="QRIS Payment" 
                      className="max-w-xs w-auto h-auto object-contain mx-auto border border-gray-200 rounded"
                      style={{ maxHeight: '150px' }}
                    />
                    <p className="text-sm text-gray-600 mt-1">QRIS Code for Payment</p>
                  </div>
                </div>
              )}

              {selectedPayment.paymentProof && (
                <div>
                  <span className="text-gray-600">Bukti Pembayaran:</span>
                  <div className="mt-2">
                    <img 
                      src={selectedPayment.paymentProof} 
                      alt="Payment Proof" 
                      className="w-32 h-32 border border-gray-200 rounded object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Update Payment Dialog */}
      {selectedPayment && (
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Status Pembayaran</DialogTitle>
              <DialogDescription>Ubah status dan catatan pembayaran</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status Pembayaran</Label>
                <Select 
                  value={updateForm.status} 
                  onValueChange={(value) => setUpdateForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                    <SelectItem value="Pending Confirmation">Pending Confirmation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  placeholder="Tambahkan catatan pembayaran..."
                  value={updateForm.notes}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium">Invoice: {selectedPayment.order.invoiceNumber}</p>
                <p className="text-sm">Jumlah: Rp {selectedPayment.amount.toLocaleString()}</p>
                <p className="text-sm">Metode: {selectedPayment.paymentMethod}</p>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsUpdateDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button 
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                  onClick={() => updatePaymentStatus(selectedPayment.id)}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update Pembayaran'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}