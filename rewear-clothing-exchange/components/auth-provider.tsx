"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  points: number
  swapHistory: number
  avatar?: string
  joinDate: string
  location?: string
  bio?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  isAdmin: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("rewear-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      // Mock authentication for preview
      const mockUsers = [
        {
          id: "1",
          name: "Sarah Johnson",
          email: "sarah@example.com",
          points: 150,
          swapHistory: 12,
          avatar: "/placeholder.svg?height=40&width=40",
          joinDate: "2023-03-15",
          location: "New York, NY",
          bio: "Fashion enthusiast who loves sustainable clothing!",
        },
        {
          id: "admin",
          name: "Admin User",
          email: "admin@rewear.com",
          points: 0,
          swapHistory: 0,
          joinDate: "2023-01-01",
        },
      ]

      const foundUser = mockUsers.find((u) => u.email === email)
      if (foundUser && password === "password") {
        setUser(foundUser)
        localStorage.setItem("rewear-user", JSON.stringify(foundUser))
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      // Mock signup for preview
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        points: 50, // Welcome bonus
        swapHistory: 0,
        joinDate: new Date().toISOString().split("T")[0],
        location: "",
        bio: "",
      }
      setUser(newUser)
      localStorage.setItem("rewear-user", JSON.stringify(newUser))
      return true
    } catch (error) {
      console.error("Signup error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("rewear-user")
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem("rewear-user", JSON.stringify(updatedUser))
    }
  }

  const isAdmin = user?.email === "admin@rewear.com"

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
