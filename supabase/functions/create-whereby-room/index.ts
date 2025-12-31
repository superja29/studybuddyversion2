import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WHEREBY_API_KEY = Deno.env.get('WHEREBY_API_KEY');
    if (!WHEREBY_API_KEY) {
      throw new Error('WHEREBY_API_KEY is not configured');
    }

    const { bookingId, lessonDate, startTime, endTime, tutorName, studentName } = await req.json();

    console.log('Creating Whereby room for booking:', bookingId);
    console.log('Lesson details:', { lessonDate, startTime, endTime, tutorName, studentName });

    // Calculate end date time for the room
    const startDateTime = new Date(`${lessonDate}T${startTime}:00Z`);
    const endDateTime = new Date(`${lessonDate}T${endTime}:00Z`);
    
    // Add 30 minutes buffer after end time
    endDateTime.setMinutes(endDateTime.getMinutes() + 30);

    // Create Whereby meeting room
    const wherebyResponse = await fetch('https://api.whereby.dev/v1/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHEREBY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        roomNamePrefix: `lesson-${bookingId.slice(0, 8)}`,
        roomMode: 'normal',
        fields: ['hostRoomUrl'],
      }),
    });

    if (!wherebyResponse.ok) {
      const errorText = await wherebyResponse.text();
      console.error('Whereby API error:', errorText);
      throw new Error(`Whereby API error: ${errorText}`);
    }

    const wherebyData = await wherebyResponse.json();
    console.log('Whereby room created:', wherebyData);

    // Update booking with room URLs
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update({
        whereby_room_url: wherebyData.roomUrl,
        whereby_host_url: wherebyData.hostRoomUrl,
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Error updating booking with room URL:', updateError);
      throw new Error(`Failed to update booking: ${updateError.message}`);
    }

    console.log('Booking updated with room URLs');

    return new Response(
      JSON.stringify({
        success: true,
        roomUrl: wherebyData.roomUrl,
        hostRoomUrl: wherebyData.hostRoomUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error creating Whereby room:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
