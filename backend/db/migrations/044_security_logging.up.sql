-- Audit logs for security and compliance
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    actor_id VARCHAR(36),
    target_type VARCHAR(50),
    target_id VARCHAR(100),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- Rate limit logs for monitoring
CREATE TABLE IF NOT EXISTS rate_limit_logs (
    id SERIAL PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_created ON rate_limit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_blocked ON rate_limit_logs(blocked) WHERE blocked = true;

-- Partitioning for audit logs (optional, for high-volume production)
-- ALTER TABLE audit_logs SET (autovacuum_vacuum_scale_factor = 0.01);

-- Security events view for quick monitoring
CREATE OR REPLACE VIEW security_events AS
SELECT 
    created_at,
    event_type,
    actor_id,
    ip_address,
    details
FROM audit_logs
WHERE event_type IN (
    'user_login_failed',
    'password_reset_requested',
    'admin_user_suspended',
    'admin_user_banned'
)
ORDER BY created_at DESC;

-- Failed login attempts view
CREATE OR REPLACE VIEW failed_logins_summary AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as attempts,
    COUNT(DISTINCT ip_address) as unique_ips
FROM audit_logs
WHERE event_type = 'user_login_failed'
    AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

