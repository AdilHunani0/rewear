"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Eye, Trash2, AlertTriangle } from "lucide-react"
import { redirect } from "next/navigation"

// Mock pending items
const pendingItems = [
  {
    id: "1",
    title: "Designer Handbag",
    image: "/placeholder.svg?height=100&width=100",
    uploader: "Jane Doe",
    category: "Accessories",
    condition: "Like New",
    points: 45,
    submittedDate: "2024-01-15",
    description: "Authentic designer handbag in excellent condition...",
  },
  {
    id: "2",
    title: "Vintage Band T-Shirt",
    image: "/placeholder.svg?height=100&width=100",
    uploader: "Mike Smith",
    category: "T-Shirts",
    condition: "Good",
    points: 15,
    submittedDate: "2024-01-14",
    description: "Rare vintage band t-shirt from the 90s...",
  },
]

// Mock reported items
const reportedItems = [
  {
    id: "3",
    title: "Suspicious Item",
    image: "/placeholder.svg?height=100&width=100",
    uploader: "Unknown User",
    reason: "Inappropriate content",
    reportedBy: "User123",
    reportDate: "2024-01-13",
  },
]

export default function AdminPage() {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const [pendingList, setPendingList] = useState(pendingItems)
  const [reportedList, setReportedList] = useState(reportedItems)

  if (!user || !isAdmin) {
    redirect("/login")
  }

  const handleApprove = (itemId: string) => {
    setPendingList((prev) => prev.filter((item) => item.id !== itemId))
    toast({
      title: "Item approved",
      description: "The item has been approved and is now live.",
    })
  }

  const handleReject = (itemId: string) => {
    setPendingList((prev) => prev.filter((item) => item.id !== itemId))
    toast({
      title: "Item rejected",
      description: "The item has been rejected and removed.",
      variant: "destructive",
    })
  }

  const handleRemoveReported = (itemId: string) => {
    setReportedList((prev) => prev.filter((item) => item.id !== itemId))
    toast({
      title: "Item removed",
      description: "The reported item has been removed from the platform.",
      variant: "destructive",
    })
  }

  const handleDismissReport = (itemId: string) => {
    setReportedList((prev) => prev.filter((item) => item.id !== itemId))
    toast({
      title: "Report dismissed",
      description: "The report has been dismissed and the item remains live.",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage items and moderate content</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Eye className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{pendingList.length}</p>
                  <p className="text-gray-600 text-sm">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{reportedList.length}</p>
                  <p className="text-gray-600 text-sm">Reported Items</p>
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
                  <p className="text-2xl font-bold text-gray-900">156</p>
                  <p className="text-gray-600 text-sm">Approved Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending Items ({pendingList.length})</TabsTrigger>
            <TabsTrigger value="reported">Reported Items ({reportedList.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <div className="space-y-4">
              {pendingList.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              by {item.uploader} • {item.submittedDate}
                            </p>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="secondary">{item.category}</Badge>
                              <Badge variant="outline">{item.condition}</Badge>
                              <Badge>{item.points} points</Badge>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(item.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(item.id)}>
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {pendingList.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">No items pending review at the moment.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reported" className="space-y-4">
            <div className="space-y-4">
              {reportedList.map((item) => (
                <Card key={item.id} className="border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">by {item.uploader}</p>
                            <div className="bg-red-50 p-3 rounded-lg mb-2">
                              <p className="text-sm font-medium text-red-800">Reported for: {item.reason}</p>
                              <p className="text-xs text-red-600">
                                Reported by {item.reportedBy} on {item.reportDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="destructive" onClick={() => handleRemoveReported(item.id)}>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDismissReport(item.id)}>
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {reportedList.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reports!</h3>
                    <p className="text-gray-600">No reported items to review at the moment.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
