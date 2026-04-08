CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS unaccent;

DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_ts_config
    WHERE cfgname = 'mizan_tr'
  ) THEN
    CREATE TEXT SEARCH CONFIGURATION mizan_tr (COPY = turkish);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_ts_config
    WHERE cfgname = 'mizan_ar'
  ) THEN
    -- Faz 2'de Hunspell Arapca sozlukleri baglandiginda bu config gelistirilecek.
    CREATE TEXT SEARCH CONFIGURATION mizan_ar (COPY = simple);
  END IF;
END;
$$;
