'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
 notes: '',
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
   headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowDialog(false)
        setFormData({ firstName: '', lastName: '', email: '', phone: '', notes: '' })
        fetchCustomers()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to add customer')
      }
    } catch (error) {
      alert('Failed to add customer')
    } finally {
      setSaving(false)
    }
  }

  const filteredCustomers = customers.filter((c: any) =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
 c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
      <p className="text-muted-foreground">Manage your customer database.</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>Add Customer</Button>
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
       <h2 className="text-lg font-semibold">Add Customer</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
         <div className="space-y-2">
      <Label>First Name</Label>
         <Input
           value={formData.firstName}
     onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
          />
         </div>
     <div className="space-y-2">
      <Label>Last Name</Label>
        <Input
         value={formData.lastName}
   onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        required
      />
     </div>
         <div className="space-y-2">
     <Label>Email</Label>
      <Input
         type="email"
   value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
       />
       </div>
         <div className="space-y-2">
       <Label>Phone</Label>
           <Input
   value={formData.phone}
     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
   />
      </div>
         <div className="space-y-2">
        <Label>Notes</Label>
     <Input
        value={formData.notes}
   onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
           />
   </div>
              <div className="flex justify-end gap-2">
         <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Customers</CardTitle>
            <Input
              placeholder="Search customers..."
   value={search}
        onChange={(e) => setSearch(e.target.value)}
  className="max-w-xs"
     />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
   <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
         <p>No customers found. Add your first customer to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
         {filteredCustomers.map((customer: any) => (
       <div key={customer.id} className="flex items-center justify-between rounded-lg border p-4">
       <div className="flex items-center gap-3">
         <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
      {customer.firstName?.[0]}{customer.lastName?.[0]}
          </div>
       <div>
       <p className="font-medium">{customer.firstName} {customer.lastName}</p>
      <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
         </div>
    <div className="text-right">
           <p className="text-sm">{customer.phone || 'No phone'}</p>
      <p className="text-xs text-muted-foreground">{customer._count?.appointments || 0} appointments</p>
           </div>
       </div>
        ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
