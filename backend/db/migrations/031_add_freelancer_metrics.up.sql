ALTER TABLE freelancer_profiles 
ADD COLUMN avg_response_time_hours DECIMAL(10,2),
ADD COLUMN completion_rate DECIMAL(5,2) DEFAULT 0;

CREATE INDEX idx_freelancer_profiles_response_time ON freelancer_profiles(avg_response_time_hours);
CREATE INDEX idx_freelancer_profiles_completion_rate ON freelancer_profiles(completion_rate);

COMMENT ON COLUMN freelancer_profiles.avg_response_time_hours IS 'Average response time in hours for accepting/declining booking requests';
COMMENT ON COLUMN freelancer_profiles.completion_rate IS 'Percentage of bookings completed successfully (0-100)';
