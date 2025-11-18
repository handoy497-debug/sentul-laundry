'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, DollarSign, Clock, Package } from 'lucide-react'

interface Service {
  id: string
  serviceName: string
  description: string
  basePricePerKg: number
  estimatedTime: string
  prices: Array<{
    id: string
    pricePerKg: number
    effectiveDate: string
    notes: string
  }>
  _count: {
    orders: number
  }
}

interface ServiceFormData {
  serviceName: string
  description: string
  basePricePerKg: string
  estimatedTime: string
}

export default function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>({
    serviceName: '',
    description: '',
    basePricePerKg: '',
    estimatedTime: ''
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services')
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingService ? `/api/admin/services/${editingService.id}` : '/api/admin/services'
      const method = editingService ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        await fetchServices()
        setIsCreateDialogOpen(false)
        setIsEditDialogOpen(false)
        setEditingService(null)
        setFormData({
          serviceName: '',
          description: '',
          basePricePerKg: '',
          estimatedTime: ''
        })
      } else {
        alert('Failed to save service')
      }
    } catch (error) {
      console.error('Error saving service:', error)
      alert('Failed to save service')
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      serviceName: service.serviceName,
      description: service.description,
      basePricePerKg: service.basePricePerKg.toString(),
      estimatedTime: service.estimatedTime
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await fetchServices()
      } else {
        alert('Failed to delete service')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Failed to delete service')
    }
  }

  const getCurrentPrice = (service: Service) => {
    return service.prices.length > 0 ? service.prices[0].pricePerKg : service.basePricePerKg
  }

  if (loading) {
    return <div className="text-center py-8">Loading services...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Daftar Layanan</h3>
          <p className="text-sm text-gray-600">Kelola layanan laundry dan harga</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Layanan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Layanan Baru</DialogTitle>
              <DialogDescription>Tambahkan layanan laundry baru</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Nama Layanan</Label>
                <Input
                  id="serviceName"
                  value={formData.serviceName}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePricePerKg">Harga per kg</Label>
                  <Input
                    id="basePricePerKg"
                    type="number"
                    value={formData.basePricePerKg}
                    onChange={(e) => setFormData(prev => ({ ...prev, basePricePerKg: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">Estimasi Waktu</Label>
                  <Input
                    id="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                    placeholder="Contoh: 2-3 hari"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                Simpan Layanan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Layanan</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Harga/kg</TableHead>
                <TableHead>Estimasi</TableHead>
                <TableHead>Pesanan</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-teal-600" />
                      <span className="font-medium">{service.serviceName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{service.description}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">
                        Rp {getCurrentPrice(service).toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{service.estimatedTime}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{service._count.orders}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Layanan</DialogTitle>
            <DialogDescription>Ubah informasi layanan</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceName">Nama Layanan</Label>
              <Input
                id="serviceName"
                value={formData.serviceName}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePricePerKg">Harga per kg</Label>
                <Input
                  id="basePricePerKg"
                  type="number"
                  value={formData.basePricePerKg}
                  onChange={(e) => setFormData(prev => ({ ...prev, basePricePerKg: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Estimasi Waktu</Label>
                <Input
                  id="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  placeholder="Contoh: 2-3 hari"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
              Update Layanan
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}