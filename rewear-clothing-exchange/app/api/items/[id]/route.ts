import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase.from("clothing_items").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Error fetching item:", error)
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Increment view count
    await supabase
      .from("clothing_items")
      .update({ views: (data.views || 0) + 1 })
      .eq("id", params.id)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching item:", error)
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { userId, action, ...updateData } = body

    if (action === "like") {
      // Get current item
      const { data: item, error: fetchError } = await supabase
        .from("clothing_items")
        .select("likes")
        .eq("id", params.id)
        .single()

      if (fetchError) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 })
      }

      const currentLikes = item.likes || []
      const isLiked = currentLikes.includes(userId)

      let newLikes
      if (isLiked) {
        newLikes = currentLikes.filter((id: string) => id !== userId)
      } else {
        newLikes = [...currentLikes, userId]
      }

      const { error } = await supabase.from("clothing_items").update({ likes: newLikes }).eq("id", params.id)

      if (error) {
        console.error("Error updating likes:", error)
        return NextResponse.json({ error: "Failed to update likes" }, { status: 500 })
      }

      return NextResponse.json({ success: true, liked: !isLiked })
    }

    // Regular update
    const { error } = await supabase.from("clothing_items").update(updateData).eq("id", params.id)

    if (error) {
      console.error("Error updating item:", error)
      return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating item:", error)
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}
