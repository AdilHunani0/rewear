"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Star, Heart, ArrowLeft, Package, Shield, MessageCircle } from "lucide-react"
import Link from "next/link"
import type { ClothingItem } from "@/lib/models"

export default function ItemDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [item, setItem] = useState<ClothingItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [userItems, setUserItems] = useState<ClothingItem[]>([])
  const [selectedItemForSwap, setSelectedItemForSwap] = useState("")
  const [swapMessage, setSwapMessage] = useState("")
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchItem()
      if (user) {
        fetchUserItems()
      }
    }
  }, [params.id, user])

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/items/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setItem(data)
        setIsLiked(user ? data.likes?.includes(user.id) || false : false)
      }
    } catch (error) {
      console.error("Error fetching item:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserItems = async () => {
    try {
      const response = await fetch(`/api/items?userId=${user!.id}&includeOwn=true`)
      if (response.ok) {
        const data = await response.json()
        // Filter to only show user's available items
        const availableItems = data.filter(
          (item: ClothingItem) => item.uploaderId === user!.id && item.status === "available",
        )
        setUserItems(availableItems)
      }
    } catch (error) {
      console.error("Error fetching user items:", error)
    }
  }

  const handleSwapRequest = async () => {
    if (!user || !item || !selectedItemForSwap) {
      toast({
        title: "Missing information",
        description: "Please select an item to swap and add a message.",
        variant: "destructive",
      })
      return
    }

    try {
      const selectedItem = userItems.find((i) => i.id === selectedItemForSwap)
      if (!selectedItem) return

      const response = await fetch("/api/swap-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromUserId: user.id,
          fromUserName: user.name,
          fromItemId: selectedItem.id,
          toUserId: item.uploaderId,
          toUserName: item.uploaderName,
          toItemId: item.id,
          message: swapMessage,
        }),
      })

      if (response.ok) {
        toast({
          title: "Swap request sent!",
          description: `Your swap request has been sent to ${item.uploaderName}.`,
        })
        setIsSwapDialogOpen(false)
        setSelectedItemForSwap("")
        setSwapMessage("")
        // Refresh item to show updated status
        fetchItem()
      } else {
        const error = await response.json()
        toast({
          title: "Failed to send request",
          description: error.error || "Something went wrong.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending swap request:", error)
      toast({
        title: "Error",
        description: "Failed to send swap request.",
        variant: "destructive",
      })
    }
  }

  const handleRedeemWithPoints = () => {
    if (!user || !item) return

    if (user.points < item.points) {
      toast({
        title: "Insufficient points",
        description: `You need ${item.points} points to redeem this item. You currently have ${user.points} points.`,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Item redeemed!",
      description: `You've successfully redeemed "${item.title}" for ${item.points} points.`,
    })
  }

  const toggleLike = async () => {
    if (!user || !item) return

    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action: "like" }),
      })

      if (response.ok) {
        const { liked } = await response.json()
        setIsLiked(liked)
        setItem((prev) =>
          prev
            ? {
                ...prev,
                likes: liked ? [...(prev.likes || []), user.id] : (prev.likes || []).filter((id) => id !== user.id),
              }
            : null,
        )

        toast({
          title: liked ? "Added to favorites" : "Removed from favorites",
          description: liked ? "Item added to your favorites." : "Item removed from your favorites.",
        })
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500">Item not found</p>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === item.uploaderId
  const canSwap = user && !isOwner && item.status === "available" && userItems.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/browse">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-white">
              <img
                src={item.images[selectedImage] || "/placeholder.svg?height=500&width=500"}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleLike}
                className={`absolute top-4 right-4 h-10 w-10 p-0 ${
                  isLiked ? "bg-red-100 text-red-600" : "bg-white/80 hover:bg-white"
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </div>

            {item.images.length > 1 && (
              <div className="flex space-x-2">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? "border-primary" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg?height=80&width=80"}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
                <Badge className="bg-primary text-white">{item.points} points</Badge>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <Badge variant="secondary">{item.category}</Badge>
                <Badge variant="outline">{item.type}</Badge>
                <Badge variant="outline">Size {item.size}</Badge>
                <Badge
                  variant={item.condition === "Like New" ? "default" : "secondary"}
                  className={item.condition === "Like New" ? "bg-green-100 text-green-800" : ""}
                >
                  {item.condition}
                </Badge>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <div
                  className={`w-3 h-3 rounded-full ${
                    item.status === "available"
                      ? "bg-green-500"
                      : item.status === "in_negotiation"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
                <span className="text-sm font-medium text-gray-700">
                  {item.status === "available"
                    ? "Available"
                    : item.status === "in_negotiation"
                      ? "In Negotiation"
                      : "Not Available"}
                </span>
                <span className="text-sm text-gray-500">• Posted {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{item.views} views</span>
                <span>{item.likes?.length || 0} likes</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!isOwner && (
              <div className="space-y-3">
                {canSwap ? (
                  <Dialog open={isSwapDialogOpen} onOpenChange={setIsSwapDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg" disabled={item.status !== "available"}>
                        <Package className="mr-2 h-5 w-5" />
                        Propose Swap
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Propose a Swap</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Select your item to swap</Label>
                          <Select value={selectedItemForSwap} onValueChange={setSelectedItemForSwap}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose an item" />
                            </SelectTrigger>
                            <SelectContent>
                              {userItems.map((userItem) => (
                                <SelectItem key={userItem.id} value={userItem.id}>
                                  {userItem.title} - {userItem.category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Message (optional)</Label>
                          <Textarea
                            placeholder="Add a message to the owner..."
                            value={swapMessage}
                            onChange={(e) => setSwapMessage(e.target.value)}
                            rows={3}
                          />
                        </div>

                        <Button onClick={handleSwapRequest} className="w-full">
                          Send Swap Request
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button className="w-full" size="lg" disabled>
                    <Package className="mr-2 h-5 w-5" />
                    {!user ? "Login to Swap" : userItems.length === 0 ? "Add Items to Swap" : "Swap Not Available"}
                  </Button>
                )}

                <Button
                  onClick={handleRedeemWithPoints}
                  variant="outline"
                  className="w-full bg-transparent"
                  size="lg"
                  disabled={!user || item.status !== "available" || (user && user.points < item.points)}
                >
                  <Star className="mr-2 h-5 w-5" />
                  Redeem with {item.points} Points
                  {user && user.points < item.points && (
                    <span className="ml-2 text-xs text-red-600">(Need {item.points - user.points} more)</span>
                  )}
                </Button>
              </div>
            )}

            {/* Safety Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Safe Exchange</span>
                </div>
                <p className="text-sm text-blue-800">
                  All exchanges are protected by our community guidelines. Report any issues to our support team.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Uploader Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={item.uploaderAvatar || "/placeholder.svg?height=48&width=48"}
                  alt={item.uploaderName}
                />
                <AvatarFallback>{item.uploaderName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{item.uploaderName}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <span>{item.uploaderRating}</span>
                  </div>
                  <span>•</span>
                  <span>Member since {new Date(item.createdAt).getFullYear()}</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                View Profile
              </Button>
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
