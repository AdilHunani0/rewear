import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const type = searchParams.get("type")
    const condition = searchParams.get("condition")
    const search = searchParams.get("search")
    const userId = searchParams.get("userId")
    const includeOwn = searchParams.get("includeOwn")

    let query = supabase.from("clothing_items").select("*")

    // Filter by status
    if (includeOwn !== "true") {
      query = query.eq("status", "available")
    }

    // Exclude user's own items unless specifically requested
    if (userId && includeOwn !== "true") {
      query = query.neq("uploader_id", userId)
    } else if (userId && includeOwn === "true") {
      query = query.eq("uploader_id", userId)
    }

    // Apply filters
    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (type && type !== "all") {
      query = query.eq("type", type)
    }

    if (condition && condition !== "all") {
      query = query.eq("condition", condition)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(50)

    if (error) {
      console.error("Error fetching items:", error)
      return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      images,
      category,
      type,
      size,
      condition,
      points,
      tags,
      uploaderId,
      uploaderName,
      uploaderAvatar,
      uploaderRating,
    } = body

    if (!title || !description || !category || !uploaderId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("clothing_items")
      .insert({
        title,
        description,
        images: images || [],
        category,
        type,
        size,
        condition,
        points: points || 20,
        tags: tags || [],
        uploader_id: uploaderId,
        uploader_name: uploaderName,
        uploader_avatar: uploaderAvatar,
        uploader_rating: uploaderRating || 5.0,
        status: "available",
        views: 0,
        likes: [],
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating item:", error)
      return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      item: data,
    })
  } catch (error) {
    console.error("Error creating item:", error)
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 })
  }
}
