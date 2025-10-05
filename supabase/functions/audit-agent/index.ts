import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditRequest {
  entity_type: string;
  entity_id?: string;
  action: string;
  summary: string;
  details?: Record<string, any>;
  user_id?: string;
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
    const requestData: AuditRequest = await req.json();

    // Validate required fields
    if (!requestData.entity_type || !requestData.action || !requestData.summary) {
      throw new Error('Missing required fields: entity_type, action, summary');
    }

    // Create audit log entry
    const auditEntry = {
      user_id: requestData.user_id || null,
      entity_type: requestData.entity_type,
      entity_id: requestData.entity_id || null,
      action: requestData.action,
      details: {
        entity_type: requestData.entity_type,
        entity_id: requestData.entity_id || null,
        action: requestData.action,
        summary: requestData.summary,
        ...requestData.details
      }
    };

    const { data, error } = await supabase
      .from('audit_logs')
      .insert(auditEntry)
      .select()
      .single();

    if (error) throw error;

    // Log to agent_logs
    await supabase.from('agent_logs').insert({
      agent_name: 'audit-agent',
      input: requestData,
      output: { audit_id: data.id },
      status: 'success',
      execution_time_ms: Date.now() - startTime
    });

    return new Response(
      JSON.stringify({ status: 'ok', data: { audit_id: data.id } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Audit agent error:', error);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabase.from('agent_logs').insert({
      agent_name: 'audit-agent',
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
