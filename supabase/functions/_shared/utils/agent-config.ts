import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

export type AgentConfig = {
  agent_name: string;
  version: string;
  model_name?: string | null;
  parameters?: Record<string, unknown>;
};

/**
 * Gets the active agent configuration from the database.
 * Falls back to environment variables if no active config found in DB.
 */
export async function getActiveAgentConfig(agentName: string): Promise<AgentConfig> {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1) Try to get active config from DB
  const { data, error } = await supabase
    .from('agent_configs')
    .select('agent_name, version, model_name, parameters')
    .eq('agent_name', agentName)
    .eq('active', true)
    .maybeSingle();

  if (!error && data) {
    return {
      agent_name: agentName,
      version: data.version,
      model_name: data.model_name ?? undefined,
      parameters: (data as any).parameters ?? {}
    };
  }

  // 2) Fallback to environment variables
  const envKeyVersion = agentName.replace(/-/g, '_').toUpperCase();
  const fallbackVersion = Deno.env.get(`AGENT_VERSION_${envKeyVersion}`) || 'v0000.00.00.000';
  const fallbackModel = Deno.env.get(`MODEL_NAME_${envKeyVersion}`) || undefined;

  return {
    agent_name: agentName,
    version: fallbackVersion,
    model_name: fallbackModel,
    parameters: {}
  };
}
