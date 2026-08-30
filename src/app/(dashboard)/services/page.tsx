'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
 price: '',
    color: '#3b82f6',
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services')
      if (res.ok) {
        const data = await res.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services'
      const method = editingService ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
       ...formData,
          duration: parseInt(formData.duration),
       price: parseFloat(formData.price) || 0,
        }),
      })
      if (res.ok) {
        setShowDialog(false)
    setEditingService(null)
    setFormData({ name: '', description: '', duration: '', price: '', color: '#3b82f6' })
   fetchServices()
      } else {
        const data = await res.json()
   alert(data.error || 'Failed to save service')
      }
    } catch (error) {
      alert('Failed to save service')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (service: any) => {
    setEditingService(service)
    setFormData({
   name: service.name,
      description: service.description || '',
      duration: service.duration.toString(),
      price: (service.price || 0).toString(),
      color: service.color,
    })
    setShowDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">Manage your services and pricing.</p>
        </div>
        <Button onClick={() => { setEditingService(null); setFormData({ name: '', description: '', duration: '', price: '', color: '#3b82f6' }); setShowDialog(true) }}>Add Service</Button>
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
      <h2 className="text-lg font-semibold">{editingService ? 'Edit Service' : 'Add Service'}</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
       <div className="space-y-2">
       <Label>Service Name</Label>
       <Input
           value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
           />
         </div>
       <div className="space-y-2">
       <Label>Description</Label>
        <Input
    value={formData.description}
     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
         />
       </div>
       <div className="space-y-2">
                <Label>Duration (minutes)</Label>
       <Input
          type="number"
        value={formData.duration}
         onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
        required
                />
              </div>
    <div className="space-y-2">
         <Label>Price ($)</Label>
      <Input
      type="number"
         step="0.01"
      value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
         <div className="space-y-2">
       <Label>Color</Label>
                <Input
           type="color"
     value={formData.color}
           onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
       <div className="flex justify-end gap-2">
       <Button type="button" variant="outline" onClick={() => { setShowDialog(false); setEditingService(null) }}>
     Cancel
                </Button>
        <Button type="submit" disabled={saving}>
         {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : services.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No services yet. Add your first service to start accepting bookings.</p>
            </CardContent>
          </Card>
        ) : (
          services.map((service: any) => (
            <Card key={service.id}>
           <CardHeader>
                <div className="flex items-center justify-between">
            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: service.color }} />
        <span className="text-sm text-muted-foreground">{service.duration} min</span>
           </div>
      <CardTitle>{service.name}</CardTitle>
           </CardHeader>
     <CardContent>
           <p className="text-sm text-muted-foreground mb-4">{service.description || 'No description'}</p>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold">${service.price || 0}</span>
     <div className="flex gap-2">
    <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>Edit</Button>
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