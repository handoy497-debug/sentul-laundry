'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Upload,
  Calendar,
  Percent,
  Tag,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface Discount {
  id: string
  title: string
  description?: string
  image?: string
  bannerImage?: string
  discountPercent: number
  promoCode?: string
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountPercent: '',
    promoCode: '',
    startDate: '',
    endDate: '',
    isActive: true,
    image: null as File | null,
    bannerImage: null as File | null
  })

  useEffect(() => {
    fetchDiscounts()
  }, [])

  const fetchDiscounts = async () => {
    try {
      const response = await fetch('/api/admin/discounts')
      const data = await response.json()
      setDiscounts(data)
    } catch (error) {
      console.error('Error fetching discounts:', error)
      setMessage({ type: 'error', text: 'Gagal memuat data discount' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discountPercent: '',
      promoCode: '',
      startDate: '',
      endDate: '',
      isActive: true,
      image: null,
      bannerImage: null
    })
    setEditingDiscount(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('discountPercent', formData.discountPercent)
      submitData.append('promoCode', formData.promoCode)
      submitData.append('startDate', formData.startDate)
      submitData.append('endDate', formData.endDate)
      submitData.append('isActive', formData.isActive.toString())
      
      if (formData.image) {
        submitData.append('image', formData.image)
      }
      if (formData.bannerImage) {
        submitData.append('bannerImage', formData.bannerImage)
      }

      const url = editingDiscount 
        ? `/api/admin/discounts/${editingDiscount.id}`
        : '/api/admin/discounts'
      
      const response = await fetch(url, {
        method: editingDiscount ? 'PUT' : 'POST',
        body: submitData
      })

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Discount berhasil ${editingDiscount ? 'diperbarui' : 'ditambahkan'}` 
        })
        fetchDiscounts()
        resetForm()
        setIsDialogOpen(false)
      } else {
        const error = await response.json()
        setMessage({ 
          type: 'error', 
          text: error.error || 'Gagal menyimpan discount' 
        })
      }
    } catch (error) {
      console.error('Error saving discount:', error)
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan' })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount)
    setFormData({
      title: discount.title,
      description: discount.description || '',
      discountPercent: discount.discountPercent.toString(),
      promoCode: discount.promoCode || '',
      startDate: new Date(discount.startDate).toISOString().split('T')[0],
      endDate: new Date(discount.endDate).toISOString().split('T')[0],
      isActive: discount.isActive,
      image: null,
      bannerImage: null
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus discount ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/discounts/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Discount berhasil dihapus' })
        fetchDiscounts()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Gagal menghapus discount' })
      }
    } catch (error) {
      console.error('Error deleting discount:', error)
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menghapus' })
    }
  }

  const getStatusBadge = (discount: Discount) => {
    const now = new Date()
    const start = new Date(discount.startDate)
    const end = new Date(discount.endDate)
    
    if (!discount.isActive) {
      return <Badge variant="secondary"><EyeOff className="h-3 w-3 mr-1" />Non-aktif</Badge>
    }
    if (now < start) {
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Akan Datang</Badge>
    }
    if (now > end) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Kadaluarsa</Badge>
    }
    return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Aktif</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuat data discount...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alert Message */}
      {message.text && (
        <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Discount</h2>
          <p className="text-gray-600">Kelola promo dan discount untuk ditampilkan di landing page</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDiscount ? 'Edit Discount' : 'Tambah Discount Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingDiscount ? 'Perbarui informasi discount' : 'Buat discount baru untuk ditampilkan di landing page'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Judul Discount *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Contoh: Diskon 20% untuk Pelanggan Baru"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="discountPercent">Persentase Discount (%) *</Label>
                  <Input
                    id="discountPercent"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: e.target.value }))}
                    placeholder="20"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi detail tentang discount ini..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="promoCode">Kode Promo (Opsional)</Label>
                <Input
                  id="promoCode"
                  value={formData.promoCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value }))}
                  placeholder="NEWBIE20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Tanggal Mulai *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">Tanggal Selesai *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image">Gambar Discount (Opsional)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files?.[0] || null }))}
                  />
                  {formData.image && (
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.image.name}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="bannerImage">Banner untuk Landing Page (Opsional)</Label>
                  <Input
                    id="bannerImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData(prev => ({ ...prev, bannerImage: e.target.files?.[0] || null }))}
                  />
                  {formData.bannerImage && (
                    <p className="text-sm text-gray-600 mt-1">
                      {formData.bannerImage.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {saving ? 'Menyimpan...' : (editingDiscount ? 'Perbarui' : 'Simpan')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Discounts List */}
      <div className="grid gap-4">
        {discounts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <Tag className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Belum ada discount</p>
                <p className="text-sm text-gray-500">Tambahkan discount pertama untuk ditampilkan di landing page</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          discounts.map((discount) => (
            <Card key={discount.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{discount.title}</h3>
                      {getStatusBadge(discount)}
                    </div>
                    
                    {discount.description && (
                      <p className="text-gray-600 mb-3">{discount.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Percent className="h-4 w-4" />
                        <span>{discount.discountPercent}%</span>
                      </div>
                      
                      {discount.promoCode && (
                        <div className="flex items-center space-x-1">
                          <Tag className="h-4 w-4" />
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{discount.promoCode}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(discount.startDate).toLocaleDateString('id-ID')} - {new Date(discount.endDate).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>

                    {(discount.image || discount.bannerImage) && (
                      <div className="mt-3 flex space-x-2">
                        {discount.image && (
                          <div className="flex items-center space-x-1 text-sm text-blue-600">
                            <ImageIcon className="h-4 w-4" />
                            <span>Ada gambar</span>
                          </div>
                        )}
                        {discount.bannerImage && (
                          <div className="flex items-center space-x-1 text-sm text-green-600">
                            <Upload className="h-4 w-4" />
                            <span>Ada banner</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(discount)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(discount.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}