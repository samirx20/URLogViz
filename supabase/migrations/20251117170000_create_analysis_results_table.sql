CREATE TABLE "public"."analysis_results" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "file_name" text,
    "total_run_time_sec" double precision,
    "kpi_max_following_error" jsonb,
    "kpi_peak_current" jsonb,
    "kpi_peak_temp" jsonb,
    "kpi_peak_tcp_force" jsonb,
    "anomalies" jsonb,
    "ts_tcp_path" jsonb,
    "ts_tcp_orientation" jsonb,
    "ts_following_error" jsonb,
    "ts_target_position" jsonb,
    "ts_actual_position" jsonb,
    "ts_tcp_force" jsonb,
    "ts_tcp_torque" jsonb,
    "ts_target_torque" jsonb,
    "ts_target_acceleration" jsonb,
    "ts_actual_current" jsonb,
    "ts_target_current" jsonb,
    "ts_control_current" jsonb,
    "ts_joint_temps" jsonb,
    CONSTRAINT "analysis_results_pkey" PRIMARY KEY ("id")
);

ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.analysis_results
FOR SELECT USING (true);