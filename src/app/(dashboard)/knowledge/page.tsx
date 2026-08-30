'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const CATEGORIES = [
  { id: 'SERVICE', label: 'Services', icon: '✂️' },
  { id: 'PRODUCT', label: 'Products', icon: '📦' },
  { id: 'FAQ', label: 'FAQs', icon: '❓' },
  { id: 'POLICY', label: 'Policies', icon: '📋' },
  { id: 'ABOUT', label: 'About Us', icon: 'ℹ️' },
  { id: 'PRICING', label: 'Pricing', icon: '💰' },
  { id: 'HOURS', label: 'Hours', icon: '🕐' },
  { id: 'CONTACT', label: 'Contact', icon: '📞' },
  { id: 'OTHER', label: 'Other', icon: '📝' },
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
  const [editing, setEditing] = useState<KnowledgeItem | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [activeCategory, setActiveCategory] = useState('SERVICE')
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
      }
    } catch (error) {
      console.error('Failed to save item:', error)
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

  const filteredItems = items.filter((item) => item.category === activeCategory)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Add information about your business that the AI agent can use to answer customer questions.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setFormData({ category: activeCategory, title: '', content: '', price: '' })
            setShowDialog(true)
          }}
        >
          Add Item
        </Button>
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold">{editing ? 'Edit Item' : 'Add Item'}</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                <Button type="submit">{editing ? 'Update' : 'Add'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
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
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>No items in this category yet. Click "Add Item" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{item.content}</p>
                    {item.price != null && (
                      <p className="text-sm font-medium text-primary mt-2">${item.price}</p>
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
