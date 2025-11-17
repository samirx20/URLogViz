CREATE POLICY "Enable insert for service_role" ON public.analysis_results
FOR INSERT TO service_role WITH CHECK (true);
