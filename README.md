# Cadmus CHGC App

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.1.

- [API](https://github.com/vedph/cadmus-chgc-api)

## Docker

🐋 Quick **Docker image** build:

1. `npm run build-lib`;
2. update version in `env.js` and then `ng build`;
3. `docker build . -t vedph2020/cadmus-chgc-app:2.0.5 -t vedph2020/cadmus-chgc-app:latest` (replace with the current version).

## IIIF

- reference website: <https://parker.stanford.edu/parker/catalog/xj710dc7305>
- manifest: <https://dms-data.stanford.edu/data/manifests/Parker/xj710dc7305/manifest.json>

Paths in manifest:

- list: `sequences[0]/canvases`
- resource: `images[0]/resource` with properties:
  - `@id` = URI, e.g. <https://stacks.stanford.edu/image/iiif/xj710dc7305/029_fob_TC_46/full/full/0/default.jpg>
  - `height`
  - `width`
- label: `label`

Quick reference for [IIIF pattern](https://iiif.io/api/image/3.0/#image-request-uri-syntax):

```txt
{baseURL}/{identifier}/{region}/{size}/{rotation}/{quality}.{format}
```

- baseURL: The URL of the IIIF image server
- identifier: The identifier of the image resource
- region: The region of the full image that should be returned
- size: The size of the returned image
- rotation: The rotation applied to the returned image
- quality: The quality of the returned image
- format: The format of the returned image

### Alternative Source

Naples (version `0.0.2-na`): <https://www.dante.unina.it/images/ms/CNMD0000263308/manifest.json>.

## History

### 2.0.5

- 2023-09-22:
  - updated packages.
  - added autocomplete for group ID export.
  - added temporary dump button to annotations to inspect their content in the console.
  - enforced the presence of a target in annotations when saving them.

### 2.0.4

- 2023-09-20: updated Angular and packages.
- 2023-09-01: updated Angular.

### 2.0.3

- 2023-08-09: added import thesauri page.

### 2.0.2

- 2023-07-28: fixed image not updated on annotations part.
- 2023-07-26: updated Angular.

### 2.0.1

- 2023-07-18:
  - added `image` to CHGC image annotations part.
  - added importer.

### 2.0.0

- 2023-07-15: **breaking changes**: refactored image annotation using new headless infrastructure.

### 1.0.2

- 2023-07-10:
  - updated Angular and packages.
  - moved metadata editor after annotations list.

### 1.0.1

- 2023-07-01: added export.
- 2023-06-24:
  - added scroll behavior in editor.
  - added gallery options page.
- 2023-06-23: updated Angular and packages.

### 1.0.0

- 2023-06-17: refactored part.
- 2023-06-13: updated Angular and packages.
- 2023-05-11: updated to Angular 16.

### 0.0.2

- 2023-04-16: added CHGC parts libraries.
- 2023-04-13: updated Angular and packages.
- 2023-03-27: updated packages.

### 0.0.1

- 2023-03-23:
  - updated Angular.
  - replaced mock gallery with IIIF.
