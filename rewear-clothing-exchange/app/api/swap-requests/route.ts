import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("swap_requests")
      .select("*")
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching swap requests:", error)
      return NextResponse.json({ error: "Failed to fetch swap requests" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching swap requests:", error)
    return NextResponse.json({ error: "Failed to fetch swap requests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fromUserId, fromUserName, fromItemId, toUserId, toUserName, toItemId, message } = body

    if (!fromUserId || !fromItemId || !toUserId || !toItemId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get item details
    const [fromItemResponse, toItemResponse] = await Promise.all([
      supabase.from("clothing_items").select("*").eq("id", fromItemId).single(),
      supabase.from("clothing_items").select("*").eq("id", toItemId).single(),
    ])

    if (fromItemResponse.error || toItemResponse.error) {
      return NextResponse.json({ error: "Items not found" }, { status: 404 })
    }

    const fromItem = fromItemResponse.data
    const toItem = toItemResponse.data

    // Check if swap request already exists
    const { data: existingRequest } = await supabase
      .from("swap_requests")
      .select("id")
      .or(
        `and(from_user_id.eq.${fromUserId},from_item_id.eq.${fromItemId},to_user_id.eq.${toUserId},to_item_id.eq.${toItemId}),and(from_user_id.eq.${toUserId},from_item_id.eq.${toItemId},to_user_id.eq.${fromUserId},to_item_id.eq.${fromItemId})`,
      )
      .in("status", ["pending", "accepted"])
      .single()

    if (existingRequest) {
      return NextResponse.json({ error: "Swap request already exists" }, { status: 400 })
    }

    // Create swap request
    const { data: swapRequest, error: swapError } = await supabase
      .from("swap_requests")
      .insert({
        from_user_id: fromUserId,
        from_user_name: fromUserName,
        from_item_id: fromItemId,
        from_item_title: fromItem.title,
        from_item_image: fromItem.images?.[0] || "",
        to_user_id: toUserId,
        to_user_name: toUserName,
        to_item_id: toItemId,
        to_item_title: toItem.title,
        to_item_image: toItem.images?.[0] || "",
        status: "pending",
        message,
      })
      .select()
      .single()

    if (swapError) {
      console.error("Error creating swap request:", swapError)
      return NextResponse.json({ error: "Failed to create swap request" }, { status: 500 })
    }

    // Update item statuses to in_negotiation
    await Promise.all([
      supabase.from("clothing_items").update({ status: "in_negotiation" }).eq("id", fromItemId),
      supabase.from("clothing_items").update({ status: "in_negotiation" }).eq("id", toItemId),
    ])

    return NextResponse.json({
      success: true,
      swapRequest,
    })
  } catch (error) {
    console.error("Error creating swap request:", error)
    return NextResponse.json({ error: "Failed to create swap request" }, { status: 500 })
  }
}
