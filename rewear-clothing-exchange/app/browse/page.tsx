"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, Heart } from "lucide-react"
import Link from "next/link"

// Mock items for preview
const mockItems = [
  {
    id: "1",
    title: "Vintage Denim Jacket",
    images: ["/placeholder.svg?height=300&width=300"],
    category: "Jackets",
    type: "Women",
    size: "M",
    condition: "Gently Used",
    points: 25,
    tags: ["vintage", "denim", "casual"],
    uploaderName: "Sarah J.",
    uploaderRating: 4.8,
    status: "available",
    views: 45,
    likes: ["2", "3"],
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "Designer Summer Dress",
    images: ["/placeholder.svg?height=300&width=300"],
    category: "Dresses",
    type: "Women",
    size: "S",
    condition: "Like New",
    points: 40,
    tags: ["designer", "summer", "elegant"],
    uploaderName: "Emma K.",
    uploaderRating: 5.0,
    status: "available",
    views: 67,
    likes: ["1", "4"],
    createdAt: "2024-01-14T15:30:00Z",
  },
  {
    id: "3",
    title: "Casual Sneakers",
    images: ["/placeholder.svg?height=300&width=300"],
    category: "Shoes",
    type: "Unisex",
    size: "42",
    condition: "Good",
    points: 20,
    tags: ["sneakers", "casual", "comfortable"],
    uploaderName: "Mike R.",
    uploaderRating: 4.5,
    status: "available",
    views: 32,
    likes: ["1"],
    createdAt: "2024-01-13T09:15:00Z",
  },
  {
    id: "4",
    title: "Wool Winter Coat",
    images: ["/placeholder.svg?height=300&width=300"],
    category: "Coats",
    type: "Men",
    size: "L",
    condition: "Excellent",
    points: 50,
    tags: ["wool", "winter", "warm"],
    uploaderName: "Lisa M.",
    uploaderRating: 4.9,
    status: "available",
    views: 89,
    likes: ["2", "3", "5"],
    createdAt: "2024-01-12T14:20:00Z",
  },
]

export default function BrowsePage() {
  const { user } = useAuth()
  const [items] = useState(mockItems)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedCondition, setSelectedCondition] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const categories = ["all", "Jackets", "Dresses", "Shoes", "Coats", "T-Shirts", "Tops", "Pants", "Accessories"]
  const types = ["all", "Men", "Women", "Kids", "Unisex"]
  const conditions = ["all", "Like New", "Excellent", "Gently Used", "Good"]

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesType = selectedType === "all" || item.type === selectedType
    const matchesCondition = selectedCondition === "all" || item.condition === selectedCondition

    return matchesSearch && matchesCategory && matchesType && matchesCondition
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "points-low":
        return a.points - b.points
      case "points-high":
        return b.points - a.points
      case "rating":
        return b.uploaderRating - a.uploaderRating
      case "popular":
        return b.likes.length - a.likes.length
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Items</h1>
          <p className="text-gray-600">Discover amazing pieces from our community</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "all" ? "All Types" : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition === "all" ? "All Conditions" : condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="points-low">Points: Low to High</SelectItem>
                <SelectItem value="points-high">Points: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="popular">Most Liked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">Showing {sortedItems.length} items</p>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <Link href={`/item/${item.id}`}>
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <img
                      src={item.images[0] || "/placeholder.svg?height=300&width=300"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 right-2 bg-white text-gray-900">{item.points} pts</Badge>
                    <Badge className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs">Available</Badge>
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/item/${item.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.condition}
                      </Badge>
                      <span className="text-xs text-gray-500">Size {item.size}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Star className="h-3 w-3 mr-1 fill-current text-yellow-400" />
                        {item.uploaderRating} • {item.uploaderName}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                  </Link>
                  <div className="flex items-center justify-between mt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`h-8 w-8 p-0 ${
                        user && item.likes?.includes(user.id) ? "text-red-600" : "text-gray-400"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${user && item.likes?.includes(user.id) ? "fill-current" : ""}`} />
                    </Button>
                    <span className="text-xs text-gray-500">
                      {item.likes?.length || 0} likes • {item.views} views
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found matching your criteria.</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  )
}
