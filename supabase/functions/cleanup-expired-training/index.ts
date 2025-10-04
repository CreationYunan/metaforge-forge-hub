import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let logData: {
    agent_name: string;
    status: 'success' | 'error';
    input: any;
    output: any;
    error_message: string | null;
    execution_time_ms: number;
  } = {
    agent_name: 'cleanup-expired-training',
    status: 'error',
    input: { timestamp: new Date().toISOString() },
    output: null,
    error_message: null,
    execution_time_ms: 0
  };

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get expired pending training data
    const { data: expiredData, error: fetchError } = await supabaseClient
      .from('training_data')
      .select('id')
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) throw fetchError;

    const expiredCount = expiredData?.length || 0;

    if (expiredCount > 0) {
      // Update expired records to rejected
      const { error: updateError } = await supabaseClient
        .from('training_data')
        .update({ status: 'rejected' })
        .eq('status', 'pending')
        .lt('expires_at', new Date().toISOString());

      if (updateError) throw updateError;

      // Create audit log
      await supabaseClient
        .from('audit_logs')
        .insert({
          action: 'cleanup_expired_training',
          entity_type: 'training_data',
          details: {
            entity_type: 'training_data',
            action: 'auto_reject_expired',
            summary: `Automatically rejected ${expiredCount} expired training corrections`,
            count: expiredCount
          }
        });
    }

    logData.status = 'success';
    logData.output = { expired_count: expiredCount };
    logData.execution_time_ms = Date.now() - startTime;

    await supabaseClient.from('agent_logs').insert(logData);

    return new Response(
      JSON.stringify({ status: 'ok', data: { expired_count: expiredCount } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in cleanup-expired-training:', error);
    
    logData.error_message = error instanceof Error ? error.message : 'Unknown error';
    logData.execution_time_ms = Date.now() - startTime;

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseClient.from('agent_logs').insert(logData);

    return new Response(
      JSON.stringify({ status: 'error', reason: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
