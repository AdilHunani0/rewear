"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, ArrowUpDown, CheckCircle, Star, Eye } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

// Mock data for preview
const mockUserItems = [
  {
    id: "user-1",
    title: "My Vintage Jacket",
    images: ["/placeholder.svg?height=64&width=64"],
    status: "available",
    views: 23,
    likes: ["2", "3"],
  },
  {
    id: "user-2",
    title: "Designer Boots",
    images: ["/placeholder.svg?height=64&width=64"],
    status: "in_negotiation",
    views: 45,
    likes: ["1", "4", "5"],
  },
]

const mockSwaps = [
  {
    id: "swap-1",
    fromUserId: "1",
    toUserName: "Emma K.",
    fromItemTitle: "My Vintage Jacket",
    toItemTitle: "Summer Dress",
    status: "pending",
    createdAt: "2024-01-15T10:00:00Z",
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [userItems] = useState(mockUserItems)
  const [swapRequests] = useState(mockSwaps)

  if (!user) {
    redirect("/login")
  }

  const ongoingSwaps = swapRequests.filter((swap) => swap.status === "pending" || swap.status === "accepted")
  const completedSwaps = swapRequests.filter((swap) => swap.status === "completed")

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar || "/placeholder.svg?height=64&width=64"} alt={user.name} />
              <AvatarFallback className="text-lg">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{user.points}</p>
                    <p className="text-gray-600 text-sm">Points Balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{userItems.length}</p>
                    <p className="text-gray-600 text-sm">Items Listed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <ArrowUpDown className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{ongoingSwaps.length}</p>
                    <p className="text-gray-600 text-sm">Active Swaps</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{completedSwaps.length}</p>
                    <p className="text-gray-600 text-sm">Completed Swaps</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="items">My Items</TabsTrigger>
            <TabsTrigger value="ongoing">Recent Swaps</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Your Listed Items</h2>
              <Button asChild>
                <Link href="/add-item">Add New Item</Link>
              </Button>
            </div>

            {userItems.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No items listed yet</h3>
                  <p className="text-gray-600 mb-4">Start by adding your first item to the community.</p>
                  <Button asChild>
                    <Link href="/add-item">Add Your First Item</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        <img
                          src={item.images[0] || "/placeholder.svg?height=64&width=64"}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 line-clamp-1">{item.title}</h3>
                          <Badge
                            variant={
                              item.status === "available"
                                ? "default"
                                : item.status === "in_negotiation"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="mt-1"
                          >
                            {item.status === "available"
                              ? "Available"
                              : item.status === "in_negotiation"
                                ? "In Negotiation"
                                : "Not Available"}
                          </Badge>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{item.views}</span>
                            </div>
                            <span>{item.likes?.length || 0} likes</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ongoing" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Swap Activity</h2>
              <Button variant="outline" asChild>
                <Link href="/swaps">View All Swaps</Link>
              </Button>
            </div>

            {ongoingSwaps.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ArrowUpDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active swaps</h3>
                  <p className="text-gray-600 mb-4">Browse items and start swapping to see activity here.</p>
                  <Button asChild>
                    <Link href="/browse">Browse Items</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {ongoingSwaps.map((swap) => (
                  <Card key={swap.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <ArrowUpDown className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Sent request to {swap.toUserName}</h3>
                            <p className="text-sm text-gray-600">
                              {swap.fromItemTitle} ↔ {swap.toItemTitle}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">Pending</Badge>
                          <p className="text-sm text-gray-500 mt-1">{new Date(swap.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>

            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No completed swaps yet</h3>
                <p className="text-gray-600">Your completed exchanges will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
