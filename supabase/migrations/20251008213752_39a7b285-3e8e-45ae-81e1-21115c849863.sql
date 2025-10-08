-- Create agent_configs table for DB-driven agent versioning
CREATE TABLE IF NOT EXISTS public.agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  version TEXT NOT NULL,
  model_name TEXT,
  parameters JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_agent_version UNIQUE(agent_name, version)
);

-- Create index for active versions
CREATE INDEX IF NOT EXISTS idx_agent_configs_active
  ON public.agent_configs (agent_name)
  WHERE active = true;

-- Enable RLS
ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;

-- Policy: all authenticated users can read
CREATE POLICY agent_configs_read ON public.agent_configs
FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: only admins can write
CREATE POLICY agent_configs_write_admin ON public.agent_configs
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Trigger: auto-update updated_at and updated_by
CREATE OR REPLACE FUNCTION public.set_agent_configs_audit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  IF auth.uid() IS NOT NULL THEN
    NEW.updated_by := auth.uid();
  END IF;
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_agent_configs_audit ON public.agent_configs;
CREATE TRIGGER trg_agent_configs_audit
BEFORE INSERT OR UPDATE ON public.agent_configs
FOR EACH ROW EXECUTE FUNCTION public.set_agent_configs_audit();

-- RPC: set active version (deactivates others for same agent)
CREATE OR REPLACE FUNCTION public.set_active_agent_version(p_agent_name TEXT, p_version TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins allowed
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'admin only';
  END IF;

  -- Deactivate all versions of this agent
  UPDATE public.agent_configs
     SET active = false
   WHERE agent_name = p_agent_name;

  -- Activate the specified version
  UPDATE public.agent_configs
     SET active = true
   WHERE agent_name = p_agent_name
     AND version = p_version;
     
  -- Audit log
  INSERT INTO public.audit_logs(user_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(), 
    'agent_config_activate', 
    'agent_config', 
    NULL,
    jsonb_build_object('agent_name', p_agent_name, 'version', p_version)
  );
END$$;

GRANT EXECUTE ON FUNCTION public.set_active_agent_version(TEXT, TEXT) TO authenticated;