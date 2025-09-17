-- Migration pour s'assurer que pgcrypto est activé
-- Cette extension est nécessaire pour les fonctions crypt() et gen_salt()

-- Activer l'extension pgcrypto si elle n'existe pas déjà
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Vérifier que les fonctions sont disponibles
DO $$
BEGIN
    -- Test de la fonction crypt
    PERFORM crypt('test', gen_salt('bf'));
    RAISE NOTICE 'Extension pgcrypto activée avec succès - fonctions crypt() et gen_salt() disponibles';
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erreur lors de l''activation de pgcrypto: %', SQLERRM;
END $$;
