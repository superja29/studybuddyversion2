import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateOrderRequest {
  tutorId: string;
  lessonDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  lessonType: "trial" | "regular";
  price: number;
}

const getPayPalAccessToken = async (): Promise<string> => {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = Deno.env.get("PAYPAL_SECRET");
  
  if (!clientId || !secret) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = btoa(`${clientId}:${secret}`);
  
  const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("PayPal auth error:", error);
    throw new Error("Failed to get PayPal access token");
  }

  const data = await response.json();
  return data.access_token;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: CreateOrderRequest = await req.json();
    console.log("Creating PayPal order for:", body);

    // Get tutor info
    const { data: tutor, error: tutorError } = await supabase
      .from("tutors")
      .select("name")
      .eq("id", body.tutorId)
      .single();

    if (tutorError || !tutor) {
      return new Response(JSON.stringify({ error: "Tutor not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create booking in pending state
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        student_id: user.id,
        tutor_id: body.tutorId,
        lesson_date: body.lessonDate,
        start_time: body.startTime,
        end_time: body.endTime,
        duration_minutes: body.durationMinutes,
        lesson_type: body.lessonType,
        price: body.price,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking creation error:", bookingError);
      return new Response(JSON.stringify({ error: "Failed to create booking" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create PayPal order
    const accessToken = await getPayPalAccessToken();
    
    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: booking.id,
          description: `${body.lessonType === "trial" ? "Trial" : "Regular"} lesson with ${tutor.name} (${body.durationMinutes} min)`,
          amount: {
            currency_code: "USD",
            value: body.price.toFixed(2),
          },
        },
      ],
    };

    const paypalResponse = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    if (!paypalResponse.ok) {
      const error = await paypalResponse.text();
      console.error("PayPal order creation error:", error);
      
      // Clean up booking
      await supabase.from("bookings").delete().eq("id", booking.id);
      
      return new Response(JSON.stringify({ error: "Failed to create PayPal order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paypalOrder = await paypalResponse.json();
    console.log("PayPal order created:", paypalOrder.id);

    // Update booking with PayPal order ID
    await supabase
      .from("bookings")
      .update({ paypal_order_id: paypalOrder.id })
      .eq("id", booking.id);

    return new Response(
      JSON.stringify({
        orderId: paypalOrder.id,
        bookingId: booking.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error creating PayPal order:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
