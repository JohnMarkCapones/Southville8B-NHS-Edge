-- Migration: Update academic_years table to always use quarters structure
-- This migration updates the existing academic_years table to enforce quarters-only structure

-- Update the structure column to have a default value of 'quarters'
ALTER TABLE public.academic_years 
ALTER COLUMN structure SET DEFAULT 'quarters';

-- Update any existing records that don't have 'quarters' structure
UPDATE public.academic_years 
SET structure = 'quarters' 
WHERE structure != 'quarters';

-- Add a check constraint to ensure only 'quarters' is allowed
ALTER TABLE public.academic_years 
ADD CONSTRAINT academic_years_structure_check 
CHECK (structure = 'quarters');

-- Update the column comment to reflect the change
COMMENT ON COLUMN public.academic_years.structure IS 'Academic year structure - always quarters (4 periods)';

-- Update any existing academic periods to follow the quarters naming convention
-- This ensures consistency with the quarters-only system
UPDATE public.academic_periods 
SET period_name = CASE 
  WHEN period_order = 1 THEN 'Q1 - First Quarter'
  WHEN period_order = 2 THEN 'Q2 - Second Quarter' 
  WHEN period_order = 3 THEN 'Q3 - Third Quarter'
  WHEN period_order = 4 THEN 'Q4 - Fourth Quarter'
  ELSE period_name
END
WHERE academic_year_id IN (
  SELECT id FROM public.academic_years WHERE structure = 'quarters'
);

-- Add a comment to the academic_periods table
COMMENT ON TABLE public.academic_periods IS 'Academic periods for quarters-based academic years (Q1, Q2, Q3, Q4)';

-- Update the generate_academic_periods_from_template function to always generate quarters
CREATE OR REPLACE FUNCTION public.generate_academic_periods_from_template(
  p_academic_year_id UUID,
  p_template_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_academic_year RECORD;
  v_start_date DATE;
  v_end_date DATE;
  v_quarter_duration INTERVAL;
  v_periods_created INTEGER := 0;
  v_result JSON;
BEGIN
  -- Get academic year details
  SELECT * INTO v_academic_year
  FROM public.academic_years
  WHERE id = p_academic_year_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Academic year not found'
    );
  END IF;
  
  -- Check if periods already exist
  IF EXISTS (
    SELECT 1 FROM public.academic_periods 
    WHERE academic_year_id = p_academic_year_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Periods already exist for this academic year'
    );
  END IF;
  
  -- Calculate quarter duration (always 4 quarters)
  v_start_date := v_academic_year.start_date;
  v_end_date := v_academic_year.end_date;
  v_quarter_duration := (v_end_date - v_start_date) / 4;
  
  -- Insert 4 quarters
  INSERT INTO public.academic_periods (
    academic_year_id,
    period_name,
    period_order,
    start_date,
    end_date,
    is_grading_period,
    weight,
    description,
    created_at,
    updated_at
  ) VALUES 
  (
    p_academic_year_id,
    'Q1 - First Quarter',
    1,
    v_start_date,
    v_start_date + v_quarter_duration - INTERVAL '1 day',
    true,
    0.25,
    'First Quarter of the academic year',
    NOW(),
    NOW()
  ),
  (
    p_academic_year_id,
    'Q2 - Second Quarter',
    2,
    v_start_date + v_quarter_duration,
    v_start_date + (v_quarter_duration * 2) - INTERVAL '1 day',
    true,
    0.25,
    'Second Quarter of the academic year',
    NOW(),
    NOW()
  ),
  (
    p_academic_year_id,
    'Q3 - Third Quarter',
    3,
    v_start_date + (v_quarter_duration * 2),
    v_start_date + (v_quarter_duration * 3) - INTERVAL '1 day',
    true,
    0.25,
    'Third Quarter of the academic year',
    NOW(),
    NOW()
  ),
  (
    p_academic_year_id,
    'Q4 - Fourth Quarter',
    4,
    v_start_date + (v_quarter_duration * 3),
    v_end_date,
    true,
    0.25,
    'Fourth Quarter of the academic year',
    NOW(),
    NOW()
  );
  
  GET DIAGNOSTICS v_periods_created = ROW_COUNT;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Successfully generated 4 quarters for academic year',
    'periods_created', v_periods_created,
    'structure', 'quarters'
  );
END;
$$;

-- Add comment to the function
COMMENT ON FUNCTION public.generate_academic_periods_from_template(UUID, UUID) IS 'Generates 4 quarters for an academic year (Q1, Q2, Q3, Q4)';

-- Create a simple function to get quarters for an academic year
CREATE OR REPLACE FUNCTION public.get_academic_year_quarters(p_academic_year_id UUID)
RETURNS TABLE (
  id UUID,
  period_name TEXT,
  period_order INTEGER,
  start_date DATE,
  end_date DATE,
  is_grading_period BOOLEAN,
  weight DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ap.id,
    ap.period_name,
    ap.period_order,
    ap.start_date,
    ap.end_date,
    ap.is_grading_period,
    ap.weight
  FROM public.academic_periods ap
  WHERE ap.academic_year_id = p_academic_year_id
  ORDER BY ap.period_order;
END;
$$;

-- Add comment to the function
COMMENT ON FUNCTION public.get_academic_year_quarters(UUID) IS 'Returns all quarters for a specific academic year in order';

-- Update table comments
COMMENT ON TABLE public.academic_years IS 'Academic years using 4-quarter structure (Q1, Q2, Q3, Q4)';
COMMENT ON COLUMN public.academic_years.structure IS 'Academic year structure - always quarters (4 periods)';

-- Success message
SELECT 'Academic years structure updated to quarters-only system' as migration_status;
