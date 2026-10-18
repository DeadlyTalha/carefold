CREATE TABLE alembic_version (
	version_num VARCHAR(32) NOT NULL,
	CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);
CREATE TABLE users (
	id VARCHAR(36) NOT NULL,
	email VARCHAR(255) NOT NULL,
	username VARCHAR(64) NOT NULL,
	hashed_password VARCHAR(255) NOT NULL,
	full_name VARCHAR(255),
	role VARCHAR(32) DEFAULT 'steward' NOT NULL,
	status VARCHAR(32) DEFAULT 'active' NOT NULL,
	auth_provider VARCHAR(32) DEFAULT 'local' NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	last_login_at DATETIME, preferred_locale VARCHAR(16) DEFAULT 'en-US' NOT NULL,
	PRIMARY KEY (id)
);
CREATE UNIQUE INDEX ix_users_email ON users (email);
CREATE UNIQUE INDEX ix_users_username ON users (username);
CREATE TABLE sessions (
	id VARCHAR(64) NOT NULL,
	user_id VARCHAR(36) NOT NULL,
	client_ip VARCHAR(45),
	user_agent TEXT,
	expires_at DATETIME NOT NULL,
	created_at DATETIME NOT NULL,
	last_active_at DATETIME NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_sessions_expires_at ON sessions (expires_at);
CREATE INDEX ix_sessions_user_id ON sessions (user_id);
CREATE TABLE password_resets (
	token_hash VARCHAR(64) NOT NULL,
	user_id VARCHAR(36) NOT NULL,
	expires_at DATETIME NOT NULL,
	used_at DATETIME,
	created_at DATETIME NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE,
	PRIMARY KEY (token_hash)
);
CREATE INDEX ix_password_resets_expires_at ON password_resets (expires_at);
CREATE INDEX ix_password_resets_user_id ON password_resets (user_id);
CREATE TABLE system_settings (
	"key" VARCHAR(128) NOT NULL,
	value_json TEXT NOT NULL,
	is_secret BOOLEAN DEFAULT 0 NOT NULL,
	updated_at DATETIME NOT NULL,
	updated_by VARCHAR(255),
	PRIMARY KEY ("key")
);
CREATE TABLE agent (
	id VARCHAR(64) NOT NULL,
	type VARCHAR(32) NOT NULL,
	user_id VARCHAR(36),
	title VARCHAR(255) NOT NULL,
	description TEXT NOT NULL,
	persona TEXT NOT NULL,
	model VARCHAR(128) NOT NULL,
	skills_json TEXT NOT NULL,
	tools_json TEXT NOT NULL,
	starters_json TEXT NOT NULL,
	domain VARCHAR(64) NOT NULL,
	category VARCHAR(64) NOT NULL,
	risk_class VARCHAR(32) NOT NULL,
	tags_json TEXT NOT NULL,
	care_stages_json TEXT NOT NULL,
	target_audience_json TEXT NOT NULL,
	forbidden_json TEXT NOT NULL,
	icon VARCHAR(64) NOT NULL,
	maturity VARCHAR(32) NOT NULL,
	can_delegate BOOLEAN NOT NULL,
	max_iterations INTEGER NOT NULL,
	hidden BOOLEAN NOT NULL,
	is_public BOOLEAN NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE SET NULL,
	PRIMARY KEY (id)
);
CREATE INDEX ix_agent_type ON agent (type);
CREATE INDEX ix_agent_user_id ON agent (user_id);
CREATE TABLE skill (
	id VARCHAR(64) NOT NULL,
	type VARCHAR(32) NOT NULL,
	user_id VARCHAR(36),
	name VARCHAR(128) NOT NULL,
	title VARCHAR(255) NOT NULL,
	description TEXT NOT NULL,
	domain VARCHAR(64) NOT NULL,
	category VARCHAR(64) NOT NULL,
	risk_class VARCHAR(32) NOT NULL,
	tags_json TEXT NOT NULL,
	tools_json TEXT NOT NULL,
	instructions TEXT NOT NULL,
	forbidden_json TEXT NOT NULL,
	is_verified BOOLEAN NOT NULL,
	is_public BOOLEAN NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE SET NULL,
	PRIMARY KEY (id)
);
CREATE INDEX ix_skill_type ON skill (type);
CREATE INDEX ix_skill_user_id ON skill (user_id);
CREATE TABLE knowledge_base (
	id VARCHAR(36) NOT NULL,
	type VARCHAR(32) NOT NULL,
	user_id VARCHAR(36),
	target_type VARCHAR(32) NOT NULL,
	target_id VARCHAR(64) NOT NULL,
	name VARCHAR(255) NOT NULL,
	title VARCHAR(255) NOT NULL,
	content TEXT NOT NULL,
	format VARCHAR(32) NOT NULL,
	size_bytes INTEGER NOT NULL,
	metadata_json TEXT NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	CONSTRAINT uq_kb_target_name UNIQUE (target_type, target_id, name),
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE SET NULL,
	PRIMARY KEY (id)
);
CREATE INDEX ix_knowledge_base_name ON knowledge_base (name);
CREATE INDEX ix_knowledge_base_target_id ON knowledge_base (target_id);
CREATE INDEX ix_knowledge_base_target_type ON knowledge_base (target_type);
CREATE INDEX ix_knowledge_base_type ON knowledge_base (type);
CREATE INDEX ix_knowledge_base_user_id ON knowledge_base (user_id);
CREATE TABLE profiles (
	id VARCHAR(36) NOT NULL,
	user_id VARCHAR(36),
	name VARCHAR(255) NOT NULL,
	relationship VARCHAR(64) NOT NULL,
	role VARCHAR(32) NOT NULL,
	date_of_birth VARCHAR(10),
	avatar_color VARCHAR(32) NOT NULL,
	short_name VARCHAR(64),
	avatar_url VARCHAR(512),
	is_primary BOOLEAN NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL, preferred_locale VARCHAR(16) DEFAULT 'en-US' NOT NULL,
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_profiles_user_id ON profiles (user_id);
CREATE TABLE profile_access (
	id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	user_id VARCHAR(36),
	granted_by VARCHAR(36),
	role VARCHAR(32) NOT NULL,
	access_level VARCHAR(32) NOT NULL,
	granted_at DATETIME NOT NULL, allowed_sections_json TEXT,
	CONSTRAINT uq_profile_access_user UNIQUE (profile_id, user_id),
	FOREIGN KEY(granted_by) REFERENCES users (id) ON DELETE SET NULL,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_profile_access_profile_id ON profile_access (profile_id);
CREATE INDEX ix_profile_access_user_id ON profile_access (user_id);
CREATE TABLE profile_consents (
	id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	consented_at DATETIME,
	terms_version VARCHAR(32) DEFAULT 'v1.0' NOT NULL,
	allow_clinical BOOLEAN DEFAULT 0 NOT NULL,
	teen_handover_notified BOOLEAN DEFAULT 0 NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE UNIQUE INDEX ix_profile_consents_profile_id ON profile_consents (profile_id);
CREATE TABLE viewer_invites (
	id VARCHAR(36) NOT NULL,
	invite_code VARCHAR(64) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	invited_by VARCHAR(36),
	invitee_name VARCHAR(255) NOT NULL,
	role VARCHAR(32) DEFAULT 'viewer' NOT NULL,
	view_clinical BOOLEAN DEFAULT 1 NOT NULL,
	view_paperwork BOOLEAN DEFAULT 0 NOT NULL,
	expires_at DATETIME NOT NULL,
	accepted_at DATETIME,
	accepted_by VARCHAR(36),
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	FOREIGN KEY(accepted_by) REFERENCES users (id) ON DELETE SET NULL,
	FOREIGN KEY(invited_by) REFERENCES users (id) ON DELETE CASCADE,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_viewer_invites_accepted_by ON viewer_invites (accepted_by);
CREATE INDEX ix_viewer_invites_invited_by ON viewer_invites (invited_by);
CREATE INDEX ix_viewer_invites_profile_id ON viewer_invites (profile_id);
CREATE UNIQUE INDEX ix_viewer_invites_invite_code ON viewer_invites (invite_code);
CREATE TABLE attachments (
	id VARCHAR(36) NOT NULL,
	user_id VARCHAR(36),
	profile_id VARCHAR(36),
	storage_key VARCHAR(512),
	filename VARCHAR(255) NOT NULL,
	original_name VARCHAR(255) NOT NULL,
	content_type VARCHAR(128) DEFAULT 'application/octet-stream' NOT NULL,
	size_bytes INTEGER DEFAULT '0' NOT NULL,
	sha256_hash VARCHAR(64),
	created_at DATETIME NOT NULL, extracted_text TEXT, source VARCHAR(64) DEFAULT 'upload' NOT NULL, source_ref VARCHAR(255), extraction_status VARCHAR(32) DEFAULT 'pending' NOT NULL, updated_at DATETIME, locale VARCHAR(16) DEFAULT 'en-US' NOT NULL,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_attachments_extraction_status ON attachments (extraction_status);
CREATE INDEX ix_attachments_filename ON attachments (filename);
CREATE INDEX ix_attachments_profile_id ON attachments (profile_id);
CREATE INDEX ix_attachments_sha256_hash ON attachments (sha256_hash);
CREATE INDEX ix_attachments_source ON attachments (source);
CREATE INDEX ix_attachments_storage_key ON attachments (storage_key);
CREATE INDEX ix_attachments_user_id ON attachments (user_id);
CREATE TABLE audit_events (
	id VARCHAR(36) NOT NULL,
	ts DATETIME NOT NULL,
	profile_id VARCHAR(36),
	actor_user_id VARCHAR(36),
	principal VARCHAR(64) DEFAULT 'user' NOT NULL,
	run_id VARCHAR(64),
	event VARCHAR(64) NOT NULL,
	tool VARCHAR(64),
	risk VARCHAR(32),
	decision VARCHAR(32),
	payload_hash VARCHAR(64),
	external_ref VARCHAR(255),
	detail_redacted TEXT, prev_hash VARCHAR(64), entry_hash VARCHAR(64),
	FOREIGN KEY(actor_user_id) REFERENCES users (id) ON DELETE SET NULL,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE SET NULL,
	PRIMARY KEY (id)
);
CREATE INDEX ix_audit_events_actor_user_id ON audit_events (actor_user_id);
CREATE INDEX ix_audit_events_entry_hash ON audit_events (entry_hash);
CREATE INDEX ix_audit_events_event ON audit_events (event);
CREATE INDEX ix_audit_events_profile_id ON audit_events (profile_id);
CREATE INDEX ix_audit_events_run_id ON audit_events (run_id);
CREATE INDEX ix_audit_events_tool ON audit_events (tool);
CREATE INDEX ix_audit_events_ts ON audit_events (ts);
CREATE TABLE connections (
	id VARCHAR(36) NOT NULL,
	user_id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	connector_id VARCHAR(128) NOT NULL,
	status VARCHAR(32) DEFAULT 'pending_auth' NOT NULL,
	label VARCHAR(255),
	status_message TEXT,
	sync_cursor TEXT,
	last_sync_at DATETIME,
	config_json TEXT DEFAULT '{}' NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL, consecutive_failures INTEGER DEFAULT '0' NOT NULL, consented_version VARCHAR(32), autonomy_level VARCHAR(16) DEFAULT 'inherit' NOT NULL,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_connections_connector_id ON connections (connector_id);
CREATE INDEX ix_connections_profile_id ON connections (profile_id);
CREATE INDEX ix_connections_status ON connections (status);
CREATE INDEX ix_connections_user_id ON connections (user_id);
CREATE TABLE credentials (
	id VARCHAR(36) NOT NULL,
	connection_id VARCHAR(36) NOT NULL,
	user_id VARCHAR(36),
	profile_id VARCHAR(36) NOT NULL,
	token_version INTEGER DEFAULT '1' NOT NULL,
	encrypted_blob TEXT NOT NULL,
	aad_binding VARCHAR(255),
	expires_at DATETIME,
	rotated_at DATETIME,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL, dek_version INTEGER DEFAULT '1' NOT NULL,
	FOREIGN KEY(connection_id) REFERENCES connections (id) ON DELETE CASCADE,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_credentials_connection_id ON credentials (connection_id);
CREATE INDEX ix_credentials_profile_id ON credentials (profile_id);
CREATE INDEX ix_credentials_user_id ON credentials (user_id);
CREATE TABLE profile_keys (
	id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	encrypted_dek TEXT NOT NULL,
	dek_version INTEGER DEFAULT '1' NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	CONSTRAINT uq_profile_keys_profile_id_dek_version UNIQUE (profile_id, dek_version),
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_profile_keys_profile_id ON profile_keys (profile_id);
CREATE TABLE approvals (
	id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	run_id VARCHAR(64) NOT NULL,
	thread_id VARCHAR(64),
	tool_name VARCHAR(128) NOT NULL,
	args_redacted TEXT DEFAULT '{}' NOT NULL,
	payload_hash VARCHAR(64) NOT NULL,
	destination_hosts TEXT DEFAULT '[]',
	risk_tier VARCHAR(32) NOT NULL,
	status VARCHAR(32) DEFAULT 'pending' NOT NULL,
	expires_at DATETIME NOT NULL,
	created_at DATETIME NOT NULL,
	decided_at DATETIME,
	decided_by VARCHAR(36),
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_approvals_expires_at ON approvals (expires_at);
CREATE INDEX ix_approvals_payload_hash ON approvals (payload_hash);
CREATE INDEX ix_approvals_profile_id ON approvals (profile_id);
CREATE INDEX ix_approvals_run_id ON approvals (run_id);
CREATE INDEX ix_approvals_status ON approvals (status);
CREATE INDEX ix_approvals_thread_id ON approvals (thread_id);
CREATE INDEX ix_approvals_tool_name ON approvals (tool_name);
CREATE TABLE jobs (
	id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	kind VARCHAR(64) NOT NULL,
	routine_id VARCHAR(64),
	connection_id VARCHAR(36),
	payload TEXT DEFAULT '{}' NOT NULL,
	timezone VARCHAR(64) DEFAULT 'UTC' NOT NULL,
	rrule VARCHAR(255),
	next_run_at DATETIME NOT NULL,
	lease_owner VARCHAR(64),
	lease_until DATETIME,
	attempts INTEGER DEFAULT '0' NOT NULL,
	idempotency_key VARCHAR(255),
	status VARCHAR(32) DEFAULT 'pending' NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_jobs_connection_id ON jobs (connection_id);
CREATE INDEX ix_jobs_idempotency_key ON jobs (idempotency_key);
CREATE INDEX ix_jobs_kind ON jobs (kind);
CREATE INDEX ix_jobs_lease_until ON jobs (lease_until);
CREATE INDEX ix_jobs_next_run_at ON jobs (next_run_at);
CREATE INDEX ix_jobs_profile_id ON jobs (profile_id);
CREATE INDEX ix_jobs_routine_id ON jobs (routine_id);
CREATE INDEX ix_jobs_status ON jobs (status);
CREATE TABLE "chat_threads" (
	id VARCHAR(64) NOT NULL,
	user_id VARCHAR(36),
	profile_id VARCHAR(36) NOT NULL,
	agent_id VARCHAR(64) NOT NULL,
	title VARCHAR(255) DEFAULT 'New Consultation' NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE TABLE health_resources (
	id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	resource_type VARCHAR(64) NOT NULL,
	source_type VARCHAR(64) NOT NULL,
	source_ref VARCHAR(255),
	source_id VARCHAR(255),
	content_hash VARCHAR(64),
	data JSON NOT NULL,
	status VARCHAR(32) DEFAULT 'active' NOT NULL,
	effective_at DATETIME NOT NULL,
	recorded_at DATETIME NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL, locale VARCHAR(16) DEFAULT 'en-US' NOT NULL,
	CONSTRAINT uq_health_resources_source UNIQUE (profile_id, source_type, source_ref, source_id),
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_health_resources_effective_at ON health_resources (effective_at);
CREATE INDEX ix_health_resources_profile_id ON health_resources (profile_id);
CREATE INDEX ix_health_resources_profile_type_effective ON health_resources (profile_id, resource_type, effective_at);
CREATE TABLE appointments (
	id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	title VARCHAR(255) NOT NULL,
	provider_name VARCHAR(255),
	specialty VARCHAR(128),
	location VARCHAR(255),
	clinic_phone VARCHAR(64),
	start_time DATETIME NOT NULL,
	end_time DATETIME NOT NULL,
	timezone VARCHAR(64) DEFAULT 'UTC' NOT NULL,
	status VARCHAR(32) DEFAULT 'scheduled' NOT NULL,
	reason TEXT,
	preparation_notes TEXT,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_appointments_profile_id ON appointments (profile_id);
CREATE INDEX ix_appointments_profile_start ON appointments (profile_id, start_time);
CREATE INDEX ix_appointments_start_time ON appointments (start_time);
CREATE INDEX ix_appointments_status ON appointments (status);
CREATE TABLE reminders (
	id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	title VARCHAR(255) NOT NULL,
	description TEXT,
	category VARCHAR(64) DEFAULT 'general' NOT NULL,
	rrule VARCHAR(255),
	timezone VARCHAR(64) DEFAULT 'UTC' NOT NULL,
	next_due_at DATETIME NOT NULL,
	status VARCHAR(32) DEFAULT 'pending' NOT NULL,
	last_triggered_at DATETIME,
	snooze_until DATETIME,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_reminders_category ON reminders (category);
CREATE INDEX ix_reminders_next_due_at ON reminders (next_due_at);
CREATE INDEX ix_reminders_profile_id ON reminders (profile_id);
CREATE INDEX ix_reminders_profile_status_due ON reminders (profile_id, status, next_due_at);
CREATE INDEX ix_reminders_status ON reminders (status);
CREATE TABLE "notes" (
	id VARCHAR(36) NOT NULL,
	type VARCHAR(32) DEFAULT 'scratchpad' NOT NULL,
	user_id VARCHAR(36),
	profile_id VARCHAR(36) NOT NULL,
	slug VARCHAR(128) NOT NULL,
	title VARCHAR(255) NOT NULL,
	content TEXT DEFAULT ('') NOT NULL,
	tags_json TEXT DEFAULT '[]' NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	linked_appointment_id VARCHAR(36), locale VARCHAR(16) DEFAULT 'en-US' NOT NULL,
	CONSTRAINT fk_notes_linked_appointment_id FOREIGN KEY(linked_appointment_id) REFERENCES appointments (id) ON DELETE SET NULL,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE TABLE preventive_records (
	id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	rule_id VARCHAR(128) NOT NULL,
	status VARCHAR(32) DEFAULT 'due' NOT NULL,
	completed_at DATETIME,
	notes TEXT,
	schedule_source VARCHAR(32) DEFAULT 'aap_2026' NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	CONSTRAINT uq_preventive_records_profile_rule UNIQUE (profile_id, rule_id),
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_preventive_records_profile_id ON preventive_records (profile_id);
CREATE INDEX ix_preventive_records_profile_status ON preventive_records (profile_id, status);
CREATE INDEX ix_preventive_records_rule_id ON preventive_records (rule_id);
CREATE INDEX ix_preventive_records_status ON preventive_records (status);
CREATE TABLE import_batches (
	id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	attachment_id VARCHAR(36),
	format VARCHAR(32) NOT NULL,
	source_name VARCHAR(255) NOT NULL,
	status VARCHAR(32) DEFAULT 'staged' NOT NULL,
	summary_json TEXT DEFAULT '{}' NOT NULL,
	staged_records_json TEXT DEFAULT '[]' NOT NULL,
	committed_resource_ids_json TEXT DEFAULT '[]' NOT NULL,
	created_at DATETIME NOT NULL,
	committed_at DATETIME,
	updated_at DATETIME NOT NULL,
	FOREIGN KEY(attachment_id) REFERENCES attachments (id) ON DELETE SET NULL,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_import_batches_attachment_id ON import_batches (attachment_id);
CREATE INDEX ix_import_batches_profile_id ON import_batches (profile_id);
CREATE INDEX ix_import_batches_profile_status ON import_batches (profile_id, status);
CREATE INDEX ix_import_batches_status ON import_batches (status);
CREATE TABLE school_forms (
	id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	attachment_id VARCHAR(36),
	title VARCHAR(255) NOT NULL,
	school_or_camp_name VARCHAR(255),
	form_type VARCHAR(64) DEFAULT 'general' NOT NULL,
	expires_at DATETIME,
	reminder_id VARCHAR(36),
	prefill_draft_json TEXT DEFAULT '{}' NOT NULL,
	notes TEXT,
	status VARCHAR(32) DEFAULT 'draft' NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	FOREIGN KEY(attachment_id) REFERENCES attachments (id) ON DELETE SET NULL,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	FOREIGN KEY(reminder_id) REFERENCES reminders (id) ON DELETE SET NULL,
	PRIMARY KEY (id)
);
CREATE INDEX ix_school_forms_attachment_id ON school_forms (attachment_id);
CREATE INDEX ix_school_forms_expires_at ON school_forms (expires_at);
CREATE INDEX ix_school_forms_profile_id ON school_forms (profile_id);
CREATE INDEX ix_school_forms_profile_status ON school_forms (profile_id, status);
CREATE INDEX ix_school_forms_status ON school_forms (status);
CREATE TABLE consent_grants (
	id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	connection_id VARCHAR(36),
	connector_id VARCHAR(128) NOT NULL,
	granted_by_user_id VARCHAR(36),
	categories_json TEXT DEFAULT '[]' NOT NULL,
	scopes_json TEXT DEFAULT '[]' NOT NULL,
	allowed_hosts_json TEXT DEFAULT '[]' NOT NULL,
	purpose VARCHAR(64) DEFAULT 'sync_and_assist' NOT NULL,
	terms_version VARCHAR(32) DEFAULT '1.0.0' NOT NULL,
	connector_version VARCHAR(32) DEFAULT '0.1.0' NOT NULL,
	status VARCHAR(32) DEFAULT 'active' NOT NULL,
	granted_at DATETIME NOT NULL,
	revoked_at DATETIME,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	FOREIGN KEY(connection_id) REFERENCES connections (id) ON DELETE CASCADE,
	FOREIGN KEY(granted_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_consent_grants_connection_id ON consent_grants (connection_id);
CREATE INDEX ix_consent_grants_connector_id ON consent_grants (connector_id);
CREATE INDEX ix_consent_grants_profile_connector_status ON consent_grants (profile_id, connector_id, status);
CREATE INDEX ix_consent_grants_profile_id ON consent_grants (profile_id);
CREATE INDEX ix_consent_grants_status ON consent_grants (status);
CREATE TABLE sync_runs (
	id VARCHAR(36) NOT NULL,
	connection_id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	connector_id VARCHAR(128) NOT NULL,
	stream VARCHAR(128) DEFAULT 'all' NOT NULL,
	status VARCHAR(32) DEFAULT 'running' NOT NULL,
	records_fetched INTEGER DEFAULT '0' NOT NULL,
	records_upserted INTEGER DEFAULT '0' NOT NULL,
	records_quarantined INTEGER DEFAULT '0' NOT NULL,
	error_code VARCHAR(64),
	error_message TEXT,
	started_at DATETIME NOT NULL,
	completed_at DATETIME,
	duration_ms INTEGER,
	created_at DATETIME NOT NULL,
	FOREIGN KEY(connection_id) REFERENCES connections (id) ON DELETE CASCADE,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_sync_runs_connection_id ON sync_runs (connection_id);
CREATE INDEX ix_sync_runs_connection_started ON sync_runs (connection_id, started_at);
CREATE INDEX ix_sync_runs_connector_id ON sync_runs (connector_id);
CREATE INDEX ix_sync_runs_profile_id ON sync_runs (profile_id);
CREATE INDEX ix_sync_runs_status ON sync_runs (status);
CREATE TABLE routines (
	id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	connection_id VARCHAR(36),
	created_by_user_id VARCHAR(36),
	name VARCHAR(255) NOT NULL,
	description TEXT,
	tool_name VARCHAR(128) NOT NULL,
	args_json TEXT DEFAULT '{}' NOT NULL,
	rrule VARCHAR(255) NOT NULL,
	timezone VARCHAR(64) DEFAULT 'UTC' NOT NULL,
	status VARCHAR(32) DEFAULT 'active' NOT NULL,
	last_run_at DATETIME,
	next_run_at DATETIME,
	expires_at DATETIME NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	FOREIGN KEY(connection_id) REFERENCES connections (id) ON DELETE CASCADE,
	FOREIGN KEY(created_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_routines_connection_id ON routines (connection_id);
CREATE INDEX ix_routines_created_by_user_id ON routines (created_by_user_id);
CREATE INDEX ix_routines_next_run_at ON routines (next_run_at);
CREATE INDEX ix_routines_profile_id ON routines (profile_id);
CREATE INDEX ix_routines_status ON routines (status);
CREATE TABLE mcp_tool_pins (
	id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	connection_id VARCHAR(36) NOT NULL,
	tool_name VARCHAR(128) NOT NULL,
	risk_tier VARCHAR(32) DEFAULT 'read' NOT NULL,
	schema_hash VARCHAR(64) NOT NULL,
	schema_json TEXT DEFAULT '{}' NOT NULL,
	status VARCHAR(32) DEFAULT 'pinned' NOT NULL,
	pinned_at DATETIME NOT NULL,
	verified_at DATETIME NOT NULL,
	CONSTRAINT uq_mcp_tool_pins_conn_tool UNIQUE (connection_id, tool_name),
	FOREIGN KEY(connection_id) REFERENCES connections (id) ON DELETE CASCADE,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_mcp_tool_pins_connection_id ON mcp_tool_pins (connection_id);
CREATE INDEX ix_mcp_tool_pins_profile_id ON mcp_tool_pins (profile_id);
CREATE INDEX ix_mcp_tool_pins_status ON mcp_tool_pins (status);
CREATE TABLE email_drafts (
	id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	created_by_user_id VARCHAR(36),
	recipient VARCHAR(320),
	subject VARCHAR(500) NOT NULL,
	body TEXT NOT NULL,
	category VARCHAR(64) DEFAULT 'general' NOT NULL,
	status VARCHAR(32) DEFAULT 'draft' NOT NULL,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL, sent_at DATETIME, external_message_id VARCHAR(255),
	FOREIGN KEY(created_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_email_drafts_profile_id ON email_drafts (profile_id);
CREATE INDEX ix_email_drafts_status ON email_drafts (status);
CREATE TABLE school_ics_feeds (
	id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	label VARCHAR(255) NOT NULL,
	feed_url VARCHAR(1024) NOT NULL,
	status VARCHAR(32) DEFAULT 'active' NOT NULL,
	last_synced_at DATETIME,
	events_synced INTEGER DEFAULT '0' NOT NULL,
	last_error TEXT,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_school_ics_feeds_profile_id ON school_ics_feeds (profile_id);
CREATE INDEX ix_school_ics_feeds_status ON school_ics_feeds (status);
CREATE TABLE companion_devices (
	id VARCHAR(36) NOT NULL,
	user_id VARCHAR(36) NOT NULL,
	profile_id VARCHAR(36) NOT NULL,
	device_name VARCHAR(255) NOT NULL,
	platform VARCHAR(32) DEFAULT 'ios' NOT NULL,
	pairing_code_hash VARCHAR(64),
	token_hash VARCHAR(64),
	cert_fingerprint_sha256 VARCHAR(95) NOT NULL,
	allowed_categories_json TEXT DEFAULT '["vitals", "clinical_records", "reminders"]' NOT NULL,
	status VARCHAR(32) DEFAULT 'pending_pair' NOT NULL,
	paired_at DATETIME,
	last_seen_at DATETIME,
	expires_at DATETIME,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	FOREIGN KEY(profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
	FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE,
	PRIMARY KEY (id)
);
CREATE INDEX ix_companion_devices_profile_id ON companion_devices (profile_id);
CREATE INDEX ix_companion_devices_status ON companion_devices (status);
CREATE INDEX ix_companion_devices_token_hash ON companion_devices (token_hash);
CREATE INDEX ix_companion_devices_user_id ON companion_devices (user_id);
