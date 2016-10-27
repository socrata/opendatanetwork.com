
# Sitemap

To generate a new sitemap, go to the base of the project and run the following:

```
% node scripts/sitemap/sitemap
sitemap index written to views/static/sitemap.xml
sitemaps written to views/static/sitemap/
```

This will generate a sitemap for each entity type-variable combination
and link them together with a sitemap index.

To configure the variables used, see `variables.json`.
Note that only variables will data for every entity should be used.

To configure the entity types used, see `entity-types.json`.

