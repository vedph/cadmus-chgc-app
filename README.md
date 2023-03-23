# Cadmus CHGC App

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.1.

- [API](https://github.com/vedph/cadmus-chgc-api)

## Docker

🐋 Quick Docker image build:

1. update version in `env.js` and `ng build`.
2. `docker build . -t vedph2020/cadmus-chgc-app:0.0.1 -t vedph2020/cadmus-chgc-app:latest` (replace with the current version).

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

## History

- 2023-03-23:
  - updated Angular.
  - replaced mock gallery with IIIF.
