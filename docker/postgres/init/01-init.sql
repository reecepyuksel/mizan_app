CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS unaccent;

DO
$$
DECLARE
  use_tr_hunspell boolean := false;
  use_ar_hunspell boolean := false;
BEGIN
  BEGIN
    IF EXISTS (SELECT 1 FROM pg_ts_dict WHERE dictname = 'mizan_tr_hunspell') THEN
      DROP TEXT SEARCH DICTIONARY mizan_tr_hunspell;
    END IF;

    CREATE TEXT SEARCH DICTIONARY mizan_tr_hunspell (
      TEMPLATE = ispell,
      DictFile = tr_tr,
      AffFile = tr_tr,
      StopWords = turkish
    );

    PERFORM ts_lexize('mizan_tr_hunspell', 'test');
    use_tr_hunspell := true;
  EXCEPTION
    WHEN OTHERS THEN
      use_tr_hunspell := false;
      IF EXISTS (SELECT 1 FROM pg_ts_dict WHERE dictname = 'mizan_tr_hunspell') THEN
        DROP TEXT SEARCH DICTIONARY mizan_tr_hunspell;
      END IF;
  END;

  IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'mizan_tr') THEN
    CREATE TEXT SEARCH CONFIGURATION mizan_tr (COPY = simple);
  END IF;

  IF use_tr_hunspell THEN
    ALTER TEXT SEARCH CONFIGURATION mizan_tr
    ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
    WITH unaccent, mizan_tr_hunspell, simple;
  ELSE
    ALTER TEXT SEARCH CONFIGURATION mizan_tr
    ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
    WITH unaccent, turkish_stem;
  END IF;

  BEGIN
    IF EXISTS (SELECT 1 FROM pg_ts_dict WHERE dictname = 'mizan_ar_hunspell') THEN
      DROP TEXT SEARCH DICTIONARY mizan_ar_hunspell;
    END IF;

    CREATE TEXT SEARCH DICTIONARY mizan_ar_hunspell (
      TEMPLATE = ispell,
      DictFile = ar,
      AffFile = ar
    );

    PERFORM ts_lexize('mizan_ar_hunspell', 'test');
    use_ar_hunspell := true;
  EXCEPTION
    WHEN OTHERS THEN
      use_ar_hunspell := false;
      IF EXISTS (SELECT 1 FROM pg_ts_dict WHERE dictname = 'mizan_ar_hunspell') THEN
        DROP TEXT SEARCH DICTIONARY mizan_ar_hunspell;
      END IF;
  END;

  IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'mizan_ar') THEN
    CREATE TEXT SEARCH CONFIGURATION mizan_ar (COPY = simple);
  END IF;

  IF use_ar_hunspell THEN
    ALTER TEXT SEARCH CONFIGURATION mizan_ar
    ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
    WITH unaccent, mizan_ar_hunspell, simple;
  ELSE
    ALTER TEXT SEARCH CONFIGURATION mizan_ar
    ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
    WITH unaccent, simple;
  END IF;
END;
$$;
