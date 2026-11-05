-- Visual SDD / Sprint 01B
-- Dedicated Neon project in EU Central. These statements were applied on 2026-11-05.
CREATE TABLE IF NOT EXISTS public.visual_sdd_projects (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_id text NOT NULL,
 title varchar(150) NOT NULL,
 idea text NOT NULL DEFAULT '',
 specification jsonb,
 revision integer NOT NULL DEFAULT 0 CHECK(revision>=0),
 approval_status varchar(16) NOT NULL DEFAULT 'draft' CHECK(approval_status IN ('draft','approved')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT visual_sdd_idea_len CHECK (length(idea)<=600),
 CONSTRAINT visual_sdd_spec_json CHECK (specification IS NULL OR jsonb_typeof(specification)='object')
);
CREATE INDEX IF NOT EXISTS idx_vsd_projects_owner_updated ON public.visual_sdd_projects(owner_id,updated_at DESC);
CREATE TABLE IF NOT EXISTS public.visual_sdd_activity (
 id bigserial PRIMARY KEY,
 project_id uuid NOT NULL REFERENCES public.visual_sdd_projects(id) ON DELETE CASCADE,
 owner_id text NOT NULL,
 event_type varchar(40) NOT NULL CHECK(event_type IN ('project_created','idea_saved','specification_saved','specification_approved','specification_reopened','project_deleted')),
 summary varchar(320) NOT NULL,
 revision integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vsd_activity_owner_project ON public.visual_sdd_activity(owner_id,project_id,created_at DESC);
ALTER TABLE public.visual_sdd_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_sdd_activity ENABLE ROW LEVEL SECURITY;

-- Backend is the only application database caller and uses server-verified owner id.
-- No browser DB credentials / exposed Data API are configured. No permissive RLS policies.
-- The privileged server connection can bypass RLS; every API query therefore
-- explicitly checks owner_id, including updates and deletions.
