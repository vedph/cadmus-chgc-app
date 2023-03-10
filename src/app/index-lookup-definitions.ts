import { IndexLookupDefinitions } from '@myrmidon/cadmus-core';
import {
  GALLERY_IMAGE_ANNOTATIONS_PART_TYPEID,
  METADATA_PART_TYPEID,
} from '@myrmidon/cadmus-part-general-ui';

export const INDEX_LOOKUP_DEFINITIONS: IndexLookupDefinitions = {
  // human-friendly ID for items
  site: {
    typeId: METADATA_PART_TYPEID,
    name: 'eid',
  },
  // gallery
  img_anno_eid: {
    typeId: GALLERY_IMAGE_ANNOTATIONS_PART_TYPEID,
    name: 'eid',
  },
};
