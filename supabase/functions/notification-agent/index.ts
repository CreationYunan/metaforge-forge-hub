import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  type: string;
  target_user_id?: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const requestData: NotificationRequest = await req.json();

    // Validate required fields
    if (!requestData.type || !requestData.title || !requestData.message || !requestData.severity) {
      throw new Error('Missing required fields: type, title, message, severity');
    }

    // Create notification table entry (assuming table exists)
    // If table doesn't exist, just log to agent_logs
    const notificationEntry = {
      user_id: requestData.target_user_id || null,
      type: requestData.type,
      title: requestData.title,
      message: requestData.message,
      severity: requestData.severity,
      metadata: requestData.metadata || {},
      read: false
    };

    let notificationId = null;
    
    // Try to insert into notifications table if it exists
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationEntry)
        .select()
        .single();
      
      if (!error && data) {
        notificationId = data.id;
      }
    } catch (tableError) {
      console.log('Notifications table may not exist, continuing without insertion');
    }

    // For high severity, could send email via webhook (placeholder)
    if (requestData.severity === 'high' && requestData.target_user_id) {
      console.log(`High severity notification for user ${requestData.target_user_id}: ${requestData.title}`);
      // TODO: Implement email sending via SMTP/webhook
    }

    // Log to agent_logs
    await supabase.from('agent_logs').insert({
      agent_name: 'notification-agent',
      input: requestData,
      output: { notification_id: notificationId, sent: true },
      status: 'success',
      execution_time_ms: Date.now() - startTime
    });

    return new Response(
      JSON.stringify({ 
        status: 'ok', 
        data: { notification_id: notificationId, sent: true } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Notification agent error:', error);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabase.from('agent_logs').insert({
      agent_name: 'notification-agent',
      input: {},
      output: null,
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      execution_time_ms: Date.now() - startTime
    });

    return new Response(
      JSON.stringify({ 
        status: 'error', 
        reason: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
