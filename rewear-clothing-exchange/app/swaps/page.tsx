"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Clock, ArrowRightLeft, MessageCircle } from "lucide-react"
import { redirect } from "next/navigation"
import type { SwapRequest } from "@/lib/models"

export default function SwapsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([])
  const [loading, setLoading] = useState(true)

  if (!user) {
    redirect("/login")
  }

  useEffect(() => {
    fetchSwapRequests()
  }, [user])

  const fetchSwapRequests = async () => {
    try {
      const response = await fetch(`/api/swap-requests?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setSwapRequests(data)
      }
    } catch (error) {
      console.error("Error fetching swap requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwapAction = async (swapId: string, action: "accept" | "reject" | "complete") => {
    try {
      const response = await fetch(`/api/swap-requests/${swapId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, userId: user.id }),
      })

      if (response.ok) {
        const { status } = await response.json()
        toast({
          title: `Swap ${action}ed!`,
          description: `The swap request has been ${action}ed.`,
        })

        // Update local state
        setSwapRequests((prev) =>
          prev.map((swap) =>
            swap.id === swapId ? { ...swap, status: status as any, updatedAt: new Date().toISOString() } : swap,
          ),
        )
      } else {
        const error = await response.json()
        toast({
          title: "Action failed",
          description: error.error || "Something went wrong.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error handling swap action:", error)
      toast({
        title: "Error",
        description: "Failed to process the action.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "accepted":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const incomingRequests = swapRequests.filter((swap) => swap.toUserId === user.id && swap.status === "pending")

  const outgoingRequests = swapRequests.filter((swap) => swap.fromUserId === user.id)

  const activeSwaps = swapRequests.filter(
    (swap) => swap.status === "accepted" && (swap.fromUserId === user.id || swap.toUserId === user.id),
  )

  const completedSwaps = swapRequests.filter(
    (swap) => swap.status === "completed" && (swap.fromUserId === user.id || swap.toUserId === user.id),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Swaps</h1>
          <p className="text-gray-600">Manage your clothing exchanges</p>
        </div>

        <Tabs defaultValue="incoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="incoming">Incoming ({incomingRequests.length})</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing ({outgoingRequests.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeSwaps.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedSwaps.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Incoming Requests</h2>
            {incomingRequests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ArrowRightLeft className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No incoming requests</h3>
                  <p className="text-gray-600">When someone wants to swap with your items, they'll appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {incomingRequests.map((swap) => (
                  <Card key={swap.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex items-center space-x-2">
                            <img
                              src={swap.fromItemImage || "/placeholder.svg?height=60&width=60"}
                              alt={swap.fromItemTitle}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <ArrowRightLeft className="h-6 w-6 text-gray-400" />
                            <img
                              src={swap.toItemImage || "/placeholder.svg?height=60&width=60"}
                              alt={swap.toItemTitle}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{swap.fromUserName} wants to swap</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">{swap.fromItemTitle}</span> for your{" "}
                              <span className="font-medium">{swap.toItemTitle}</span>
                            </p>
                            {swap.message && <p className="text-sm text-gray-500 italic">"{swap.message}"</p>}
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(swap.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleSwapAction(swap.id, "accept")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleSwapAction(swap.id, "reject")}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="outgoing" className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Outgoing Requests</h2>
            {outgoingRequests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ArrowRightLeft className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No outgoing requests</h3>
                  <p className="text-gray-600">Browse items and send swap requests to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {outgoingRequests.map((swap) => (
                  <Card key={swap.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex items-center space-x-2">
                            <img
                              src={swap.fromItemImage || "/placeholder.svg?height=60&width=60"}
                              alt={swap.fromItemTitle}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <ArrowRightLeft className="h-6 w-6 text-gray-400" />
                            <img
                              src={swap.toItemImage || "/placeholder.svg?height=60&width=60"}
                              alt={swap.toItemTitle}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Swap request to {swap.toUserName}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Your <span className="font-medium">{swap.fromItemTitle}</span> for{" "}
                              <span className="font-medium">{swap.toItemTitle}</span>
                            </p>
                            {swap.message && <p className="text-sm text-gray-500 italic">"{swap.message}"</p>}
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(swap.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(swap.status)}>
                            {getStatusIcon(swap.status)}
                            <span className="ml-1 capitalize">{swap.status}</span>
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Active Swaps</h2>
            {activeSwaps.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active swaps</h3>
                  <p className="text-gray-600">Accepted swap requests will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeSwaps.map((swap) => {
                  const isInitiator = swap.fromUserId === user.id
                  const partnerName = isInitiator ? swap.toUserName : swap.fromUserName

                  return (
                    <Card key={swap.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="flex items-center space-x-2">
                              <img
                                src={swap.fromItemImage || "/placeholder.svg?height=60&width=60"}
                                alt={swap.fromItemTitle}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <ArrowRightLeft className="h-6 w-6 text-green-600" />
                              <img
                                src={swap.toItemImage || "/placeholder.svg?height=60&width=60"}
                                alt={swap.toItemTitle}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Active swap with {partnerName}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">{swap.fromItemTitle}</span> ↔{" "}
                                <span className="font-medium">{swap.toItemTitle}</span>
                              </p>
                              <p className="text-xs text-gray-400">
                                Accepted on {new Date(swap.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSwapAction(swap.id, "complete")}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Mark Complete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Completed Swaps</h2>
            {completedSwaps.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No completed swaps</h3>
                  <p className="text-gray-600">Your completed exchanges will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedSwaps.map((swap) => {
                  const isInitiator = swap.fromUserId === user.id
                  const partnerName = isInitiator ? swap.toUserName : swap.fromUserName

                  return (
                    <Card key={swap.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="flex items-center space-x-2">
                              <img
                                src={swap.fromItemImage || "/placeholder.svg?height=60&width=60"}
                                alt={swap.fromItemTitle}
                                className="w-16 h-16 object-cover rounded-lg opacity-75"
                              />
                              <CheckCircle className="h-6 w-6 text-green-600" />
                              <img
                                src={swap.toItemImage || "/placeholder.svg?height=60&width=60"}
                                alt={swap.toItemTitle}
                                className="w-16 h-16 object-cover rounded-lg opacity-75"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Completed swap with {partnerName}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">{swap.fromItemTitle}</span> ↔{" "}
                                <span className="font-medium">{swap.toItemTitle}</span>
                              </p>
                              <p className="text-xs text-gray-400">
                                Completed on {new Date(swap.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
