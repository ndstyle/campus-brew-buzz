-- PART 1: Fix rating data type for decimal support
ALTER TABLE public.reviews ALTER COLUMN rating TYPE NUMERIC(3,1);

-- Update constraint for decimal ratings 1.0-10.0
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_rating_check;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_rating_check CHECK (rating >= 1.0 AND rating <= 10.0);

-- PART 2: Create universities table to replace hardcoded coordinates
CREATE TABLE public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  aliases JSONB DEFAULT '[]'::jsonb,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  default_zoom INTEGER DEFAULT 15,
  country TEXT DEFAULT 'USA',
  state_province TEXT,
  city TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on universities table
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

-- RLS policies for universities table
CREATE POLICY "Public can read universities" 
ON public.universities 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can create universities" 
ON public.universities 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Insert initial university data
INSERT INTO public.universities (name, aliases, latitude, longitude, default_zoom, state_province, city) VALUES
-- California Universities
('University of California, Los Angeles', '["UCLA"]', 34.06890000, -118.44520000, 15, 'California', 'Los Angeles'),
('University of California, Berkeley', '["UC Berkeley", "Berkeley"]', 37.87190000, -122.25850000, 15, 'California', 'Berkeley'),
('Stanford University', '["Stanford"]', 37.42750000, -122.16970000, 15, 'California', 'Stanford'),
('University of Southern California', '["USC"]', 34.02240000, -118.28510000, 15, 'California', 'Los Angeles'),
('California Institute of Technology', '["Caltech"]', 34.13770000, -118.12530000, 16, 'California', 'Pasadena'),
('University of California, San Diego', '["UCSD"]', 32.88010000, -117.23400000, 15, 'California', 'San Diego'),

-- East Coast Universities
('Harvard University', '["Harvard"]', 42.37440000, -71.11690000, 15, 'Massachusetts', 'Cambridge'),
('Massachusetts Institute of Technology', '["MIT"]', 42.36010000, -71.09420000, 16, 'Massachusetts', 'Cambridge'),
('Yale University', '["Yale"]', 41.31630000, -72.92230000, 15, 'Connecticut', 'New Haven'),
('Princeton University', '["Princeton"]', 40.34300000, -74.65140000, 15, 'New Jersey', 'Princeton'),
('Columbia University', '["Columbia"]', 40.80750000, -73.96260000, 16, 'New York', 'New York'),
('University of Pennsylvania', '["UPenn", "Penn"]', 39.95220000, -75.19320000, 15, 'Pennsylvania', 'Philadelphia'),
('Cornell University', '["Cornell"]', 42.45340000, -76.47350000, 15, 'New York', 'Ithaca'),
('Brown University', '["Brown"]', 41.82400000, -71.41280000, 15, 'Rhode Island', 'Providence'),
('Dartmouth College', '["Dartmouth"]', 43.70440000, -72.28870000, 15, 'New Hampshire', 'Hanover'),

-- New York Universities
('New York University', '["NYU"]', 40.72910000, -73.99650000, 16, 'New York', 'New York'),
('Fordham University', '[]', 40.86180000, -73.88540000, 15, 'New York', 'Bronx'),
('The New School', '[]', 40.73590000, -73.99440000, 16, 'New York', 'New York'),

-- Midwest Universities (INCLUDING UIUC!)
('University of Chicago', '[]', 41.78860000, -87.59870000, 15, 'Illinois', 'Chicago'),
('Northwestern University', '["Northwestern"]', 42.05640000, -87.67530000, 15, 'Illinois', 'Evanston'),
('University of Michigan', '["Michigan", "U of M"]', 42.28080000, -83.74300000, 15, 'Michigan', 'Ann Arbor'),
('University of Illinois Urbana-Champaign', '["UIUC", "University of Illinois", "Illinois", "U of I"]', 40.10200000, -88.22720000, 15, 'Illinois', 'Urbana-Champaign'),
('University of Notre Dame', '["Notre Dame"]', 41.70010000, -86.23790000, 15, 'Indiana', 'Notre Dame'),
('Washington University in St. Louis', '["WashU", "WUSTL"]', 38.64880000, -90.31080000, 15, 'Missouri', 'St. Louis'),

-- Southern Universities
('Duke University', '["Duke"]', 36.00140000, -78.93820000, 15, 'North Carolina', 'Durham'),
('University of North Carolina at Chapel Hill', '["UNC Chapel Hill", "UNC"]', 35.90490000, -79.04690000, 15, 'North Carolina', 'Chapel Hill'),
('Vanderbilt University', '["Vanderbilt"]', 36.14470000, -86.80270000, 15, 'Tennessee', 'Nashville'),
('Emory University', '["Emory"]', 33.79630000, -84.32400000, 15, 'Georgia', 'Atlanta'),
('Rice University', '["Rice"]', 29.71740000, -95.40180000, 15, 'Texas', 'Houston'),
('University of Texas at Austin', '["UT Austin", "UT", "Texas"]', 30.28490000, -97.73410000, 15, 'Texas', 'Austin'),

-- State Universities
('Ohio State University', '["OSU", "Ohio State"]', 40.00670000, -83.03050000, 15, 'Ohio', 'Columbus'),
('Penn State University', '["Penn State"]', 40.79820000, -77.85990000, 15, 'Pennsylvania', 'University Park'),
('University of Florida', '["UF", "Florida"]', 29.64360000, -82.35490000, 15, 'Florida', 'Gainesville'),
('Florida State University', '["FSU"]', 30.45180000, -84.28070000, 15, 'Florida', 'Tallahassee'),
('University of Georgia', '["UGA", "Georgia"]', 33.94800000, -83.37730000, 15, 'Georgia', 'Athens'),
('University of Alabama', '["Alabama", "Bama"]', 33.20980000, -87.56920000, 15, 'Alabama', 'Tuscaloosa'),

-- Tech Schools
('Georgia Institute of Technology', '["Georgia Tech", "GT"]', 33.77560000, -84.39630000, 15, 'Georgia', 'Atlanta'),
('Carnegie Mellon University', '["Carnegie Mellon", "CMU"]', 40.44260000, -79.94300000, 15, 'Pennsylvania', 'Pittsburgh'),
('Virginia Tech', '["VT"]', 37.22840000, -80.42340000, 15, 'Virginia', 'Blacksburg'),

-- West Coast Additional
('University of Washington', '["UW", "Washington"]', 47.65530000, -122.30350000, 15, 'Washington', 'Seattle'),
('University of Oregon', '["Oregon", "UO"]', 44.04450000, -123.07150000, 15, 'Oregon', 'Eugene'),
('Arizona State University', '["ASU"]', 33.42420000, -111.92810000, 15, 'Arizona', 'Tempe'),
('University of Arizona', '["Arizona", "UA"]', 32.23190000, -110.95010000, 15, 'Arizona', 'Tucson');

-- Create index for faster university searches
CREATE INDEX idx_universities_name ON public.universities(name);
CREATE INDEX idx_universities_aliases ON public.universities USING GIN(aliases);