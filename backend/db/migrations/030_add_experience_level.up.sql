ALTER TABLE freelancer_profiles 
ADD COLUMN years_experience INTEGER;

CREATE INDEX idx_freelancer_profiles_experience ON freelancer_profiles(years_experience);
