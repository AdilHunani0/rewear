import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { action, userId } = body

    // Get swap request
    const { data: swapRequest, error: fetchError } = await supabase
      .from("swap_requests")
      .select("*")
      .eq("id", params.id)
      .single()

    if (fetchError || !swapRequest) {
      return NextResponse.json({ error: "Swap request not found" }, { status: 404 })
    }

    if (action === "accept" && userId === swapRequest.to_user_id) {
      // Update swap request status
      const { error: updateError } = await supabase
        .from("swap_requests")
        .update({ status: "accepted" })
        .eq("id", params.id)

      if (updateError) {
        console.error("Error updating swap request:", updateError)
        return NextResponse.json({ error: "Failed to update swap request" }, { status: 500 })
      }

      // Update items status to swapped
      await Promise.all([
        supabase.from("clothing_items").update({ status: "swapped" }).eq("id", swapRequest.from_item_id),
        supabase.from("clothing_items").update({ status: "swapped" }).eq("id", swapRequest.to_item_id),
      ])

      return NextResponse.json({ success: true, status: "accepted" })
    }

    if (action === "reject" && userId === swapRequest.to_user_id) {
      // Update swap request status
      const { error: updateError } = await supabase
        .from("swap_requests")
        .update({ status: "rejected" })
        .eq("id", params.id)

      if (updateError) {
        console.error("Error updating swap request:", updateError)
        return NextResponse.json({ error: "Failed to update swap request" }, { status: 500 })
      }

      // Update items status back to available
      await Promise.all([
        supabase.from("clothing_items").update({ status: "available" }).eq("id", swapRequest.from_item_id),
        supabase.from("clothing_items").update({ status: "available" }).eq("id", swapRequest.to_item_id),
      ])

      return NextResponse.json({ success: true, status: "rejected" })
    }

    if (action === "complete" && (userId === swapRequest.from_user_id || userId === swapRequest.to_user_id)) {
      // Update swap request status
      const { error: updateError } = await supabase
        .from("swap_requests")
        .update({ status: "completed" })
        .eq("id", params.id)

      if (updateError) {
        console.error("Error updating swap request:", updateError)
        return NextResponse.json({ error: "Failed to update swap request" }, { status: 500 })
      }

      // Update user swap history and points
      const pointsEarned = 10 // Points earned for completing a swap

      await Promise.all([
        supabase
          .from("users")
          .update({
            swap_history: supabase.sql`swap_history + 1`,
            points: supabase.sql`points + ${pointsEarned}`,
          })
          .eq("id", swapRequest.from_user_id),
        supabase
          .from("users")
          .update({
            swap_history: supabase.sql`swap_history + 1`,
            points: supabase.sql`points + ${pointsEarned}`,
          })
          .eq("id", swapRequest.to_user_id),
      ])

      return NextResponse.json({ success: true, status: "completed" })
    }

    return NextResponse.json({ error: "Invalid action or unauthorized" }, { status: 400 })
  } catch (error) {
    console.error("Error updating swap request:", error)
    return NextResponse.json({ error: "Failed to update swap request" }, { status: 500 })
  }
}
