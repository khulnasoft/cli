\set pgpass `echo "$PGPASSWORD"`
\set jwt_secret `echo "$JWT_SECRET"`
\set jwt_exp `echo "$JWT_EXP"`

ALTER DATABASE postgres SET "app.settings.jwt_secret" TO :'jwt_secret';
ALTER DATABASE postgres SET "app.settings.jwt_exp" TO :'jwt_exp';

ALTER USER authenticator WITH PASSWORD :'pgpass';
ALTER USER pgbouncer WITH PASSWORD :'pgpass';
ALTER USER khulnasoft_auth_admin WITH PASSWORD :'pgpass';
ALTER USER khulnasoft_storage_admin WITH PASSWORD :'pgpass';
ALTER USER khulnasoft_replication_admin WITH PASSWORD :'pgpass';
ALTER USER khulnasoft_read_only_user WITH PASSWORD :'pgpass';

create schema if not exists _realtime;
alter schema _realtime owner to postgres;

create schema if not exists _analytics;
alter schema _analytics owner to postgres;

BEGIN;

-- Create pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- Create khulnasoft_functions schema
CREATE SCHEMA khulnasoft_functions AUTHORIZATION khulnasoft_admin;

GRANT USAGE ON SCHEMA khulnasoft_functions TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA khulnasoft_functions GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA khulnasoft_functions GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA khulnasoft_functions GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- khulnasoft_functions.migrations definition
CREATE TABLE khulnasoft_functions.migrations (
  version text PRIMARY KEY,
  inserted_at timestamptz NOT NULL DEFAULT NOW()
);

-- Initial khulnasoft_functions migration
INSERT INTO khulnasoft_functions.migrations (version) VALUES ('initial');

-- khulnasoft_functions.hooks definition
CREATE TABLE khulnasoft_functions.hooks (
  id bigserial PRIMARY KEY,
  hook_table_id integer NOT NULL,
  hook_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  request_id bigint
);
CREATE INDEX khulnasoft_functions_hooks_request_id_idx ON khulnasoft_functions.hooks USING btree (request_id);
CREATE INDEX khulnasoft_functions_hooks_h_table_id_h_name_idx ON khulnasoft_functions.hooks USING btree (hook_table_id, hook_name);
COMMENT ON TABLE khulnasoft_functions.hooks IS 'Khulnasoft Functions Hooks: Audit trail for triggered hooks.';

CREATE FUNCTION khulnasoft_functions.http_request()
  RETURNS trigger
  LANGUAGE plpgsql
  AS $function$
  DECLARE
    request_id bigint;
    payload jsonb;
    url text := TG_ARGV[0]::text;
    method text := TG_ARGV[1]::text;
    headers jsonb DEFAULT '{}'::jsonb;
    params jsonb DEFAULT '{}'::jsonb;
    timeout_ms integer DEFAULT 1000;
  BEGIN
    IF url IS NULL OR url = 'null' THEN
      RAISE EXCEPTION 'url argument is missing';
    END IF;

    IF method IS NULL OR method = 'null' THEN
      RAISE EXCEPTION 'method argument is missing';
    END IF;

    IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
      headers = '{"Content-Type": "application/json"}'::jsonb;
    ELSE
      headers = TG_ARGV[2]::jsonb;
    END IF;

    IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
      params = '{}'::jsonb;
    ELSE
      params = TG_ARGV[3]::jsonb;
    END IF;

    IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
      timeout_ms = 1000;
    ELSE
      timeout_ms = TG_ARGV[4]::integer;
    END IF;

    CASE
      WHEN method = 'GET' THEN
        SELECT http_get INTO request_id FROM net.http_get(
          url,
          params,
          headers,
          timeout_ms
        );
      WHEN method = 'POST' THEN
        payload = jsonb_build_object(
          'old_record', OLD,
          'record', NEW,
          'type', TG_OP,
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA
        );

        SELECT http_post INTO request_id FROM net.http_post(
          url,
          payload,
          params,
          headers,
          timeout_ms
        );
      ELSE
        RAISE EXCEPTION 'method argument % is invalid', method;
    END CASE;

    INSERT INTO khulnasoft_functions.hooks
      (hook_table_id, hook_name, request_id)
    VALUES
      (TG_RELID, TG_NAME, request_id);

    RETURN NEW;
  END
$function$;

-- Khulnasoft super admin
DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'khulnasoft_functions_admin'
  )
  THEN
    CREATE USER khulnasoft_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
  END IF;
END
$$;

GRANT ALL PRIVILEGES ON SCHEMA khulnasoft_functions TO khulnasoft_functions_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA khulnasoft_functions TO khulnasoft_functions_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA khulnasoft_functions TO khulnasoft_functions_admin;
ALTER USER khulnasoft_functions_admin SET search_path = "khulnasoft_functions";
ALTER table "khulnasoft_functions".migrations OWNER TO khulnasoft_functions_admin;
ALTER table "khulnasoft_functions".hooks OWNER TO khulnasoft_functions_admin;
ALTER function "khulnasoft_functions".http_request() OWNER TO khulnasoft_functions_admin;
GRANT khulnasoft_functions_admin TO postgres;

-- Remove unused khulnasoft_pg_net_admin role
DO
$$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'khulnasoft_pg_net_admin'
  )
  THEN
    REASSIGN OWNED BY khulnasoft_pg_net_admin TO khulnasoft_admin;
    DROP OWNED BY khulnasoft_pg_net_admin;
    DROP ROLE khulnasoft_pg_net_admin;
  END IF;
END
$$;

-- pg_net grants when extension is already enabled
DO
$$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_extension
    WHERE extname = 'pg_net'
  )
  THEN
    GRANT USAGE ON SCHEMA net TO khulnasoft_functions_admin, postgres, anon, authenticated, service_role;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

    REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
    REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

    GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO khulnasoft_functions_admin, postgres, anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO khulnasoft_functions_admin, postgres, anon, authenticated, service_role;
  END IF;
END
$$;

-- Event trigger for pg_net
CREATE OR REPLACE FUNCTION extensions.grant_pg_net_access()
RETURNS event_trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    GRANT USAGE ON SCHEMA net TO khulnasoft_functions_admin, postgres, anon, authenticated, service_role;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

    REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
    REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

    GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO khulnasoft_functions_admin, postgres, anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO khulnasoft_functions_admin, postgres, anon, authenticated, service_role;
  END IF;
END;
$$;
COMMENT ON FUNCTION extensions.grant_pg_net_access IS 'Grants access to pg_net';

DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_event_trigger
    WHERE evtname = 'issue_pg_net_access'
  ) THEN
    CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end WHEN TAG IN ('CREATE EXTENSION')
    EXECUTE PROCEDURE extensions.grant_pg_net_access();
  END IF;
END
$$;

INSERT INTO khulnasoft_functions.migrations (version) VALUES ('20210809183423_update_grants');

ALTER function khulnasoft_functions.http_request() SECURITY DEFINER;
ALTER function khulnasoft_functions.http_request() SET search_path = khulnasoft_functions;
REVOKE ALL ON FUNCTION khulnasoft_functions.http_request() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION khulnasoft_functions.http_request() TO postgres, anon, authenticated, service_role;

COMMIT;
