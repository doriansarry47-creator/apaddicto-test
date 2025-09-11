# Outils DB & Debug

## Scripts
```bash
npm run quick-check
npm run db:seed
npm run db:generate
npm run db:push
```

## Routes (sous `/api`)
- GET `/api/debug/tables`
- GET `/api/debug/tables/counts`
- DELETE `/api/debug/tables/purge` (à protéger / désactiver en prod)

## Notes
- Ajouter auth / clé si public.
- `quick-check` : test connexion + liste des tables.
- `seed` refusé en production.
