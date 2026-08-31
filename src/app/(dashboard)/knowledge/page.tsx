'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const CATEGORIES = [
  { id: 'SERVICE', label: 'Services', icon: '✂️', desc: 'Services you offer with pricing' },
  { id: 'PRODUCT', label: 'Products', icon: '📦', desc: 'Products you sell' },
  { id: 'FAQ', label: 'FAQs', icon: '❓', desc: 'Frequently asked questions' },
  { id: 'POLICY', label: 'Policies', icon: '📋', desc: 'Business policies & terms' },
  { id: 'ABOUT', label: 'About Us', icon: 'ℹ️', desc: 'Your business story' },
  { id: 'PRICING', label: 'Pricing', icon: '💰', desc: 'Pricing information' },
  { id: 'HOURS', label: 'Hours', icon: '🕐', desc: 'Operating hours' },
  { id: 'CONTACT', label: 'Contact', icon: '📞', desc: 'Contact information' },
  { id: 'OTHER', label: 'Other', icon: '📝', desc: 'Additional information' },
]

interface KnowledgeItem {
  id: string
  category: string
  title: string
  content: string
  price?: number
  isActive: boolean
  sortOrder: number
}

export default function KnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<KnowledgeItem | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [activeCategory, setActiveCategory] = useState('SERVICE')
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    category: 'SERVICE',
    title: '',
    content: '',
    price: '',
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/knowledge')
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Failed to fetch knowledge items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editing ? '/api/knowledge' : '/api/knowledge'
      const method = editing ? 'PUT' : 'POST'
      const body = editing
        ? { ...editing, ...formData, price: formData.price ? parseFloat(formData.price) : null }
        : { ...formData, price: formData.price ? parseFloat(formData.price) : null }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowDialog(false)
        setEditing(null)
        setFormData({ category: activeCategory, title: '', content: '', price: '' })
        fetchItems()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save item')
      }
    } catch (error) {
      alert('Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: KnowledgeItem) => {
    setEditing(item)
    setFormData({
      category: item.category,
      title: item.title,
      content: item.content,
      price: item.price?.toString() || '',
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    try {
      await fetch('/api/knowledge', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      fetchItems()
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const handleSyncServices = async () => {
    try {
      // Fetch services and add them to knowledge base
      const res = await fetch('/api/services')
      if (res.ok) {
        const services = await res.json()
        for (const service of services) {
          await fetch('/api/knowledge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: 'SERVICE',
              title: service.name,
              content: service.description || `${service.duration} minute service`,
              price: service.price,
            }),
          })
        }
        fetchItems()
        alert(`Synced ${services.length} services to knowledge base!`)
      }
    } catch (error) {
      console.error('Failed to sync services:', error)
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(items, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'knowledge-base.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string)
        for (const item of imported) {
          await fetch('/api/knowledge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: item.category,
              title: item.title,
              content: item.content,
              price: item.price,
            }),
          })
        }
        fetchItems()
        alert(`Imported ${imported.length} items!`)
      } catch (error) {
        alert('Failed to import file')
      }
    }
    reader.readAsText(file)
  }

  const filteredItems = items.filter((item) => {
    const matchesCategory = item.category === activeCategory
    const matchesSearch = searchQuery
      ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    return matchesCategory && matchesSearch
  })

  const totalItems = items.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Add information about your business that the AI agent uses to answer customer questions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSyncServices}>
            Sync Services
          </Button>
          <Button variant="outline" onClick={handleExport}>
            Export
          </Button>
          <label className="inline-flex">
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            <Button variant="outline" asChild>
              <span>Import</span>
            </Button>
          </label>
          <Button
            onClick={() => {
              setEditing(null)
              setFormData({ category: activeCategory, title: '', content: '', price: '' })
              setShowDialog(true)
            }}
            className="bg-gradient-to-r from-primary to-purple-600"
          >
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="hover-lift">
          <CardContent className="p-4">
            <div className="text-2xl font-bold gradient-text">{totalItems}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="p-4">
            <div className="text-2xl font-bold gradient-text">{items.filter((i) => i.category === 'SERVICE').length}</div>
            <div className="text-sm text-muted-foreground">Services</div>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="p-4">
            <div className="text-2xl font-bold gradient-text">{items.filter((i) => i.category === 'PRODUCT').length}</div>
            <div className="text-sm text-muted-foreground">Products</div>
          </CardContent>
        </Card>
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-2xl animate-scale-in">
            <h2 className="text-lg font-semibold">{editing ? 'Edit Item' : 'Add Item'}</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Title / Question</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Haircut, Return Policy, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Content / Answer</Label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Describe the service, answer the question, etc."
                  required
                />
              </div>
              {(formData.category === 'SERVICE' || formData.category === 'PRODUCT') && (
                <div className="space-y-2">
                  <Label>Price (optional)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-gradient-to-r from-primary to-purple-600">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Search knowledge base..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:bg-muted border'
            }`}
          >
            {cat.icon} {cat.label} ({items.filter((i) => i.category === cat.id).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="text-4xl mb-4">{CATEGORIES.find((c) => c.id === activeCategory)?.icon}</div>
            <h3 className="font-medium mb-2">No items yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
              {CATEGORIES.find((c) => c.id === activeCategory)?.desc}
            </p>
            <Button
              onClick={() => {
                setFormData({ category: activeCategory, title: '', content: '', price: '' })
                setShowDialog(true)
              }}
              variant="outline"
            >
              Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, index) => (
            <Card
              key={item.id}
              className={`hover-lift animate-fade-in`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{item.content}</p>
                    {item.price != null && (
                      <p className="text-sm font-medium text-primary mt-2">${item.price.toFixed(2)}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
