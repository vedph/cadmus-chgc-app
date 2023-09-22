import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  UntypedFormGroup,
} from '@angular/forms';

import { NgToolsValidators } from '@myrmidon/ng-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { EditedObject, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  GalleryOptionsService,
  GalleryService,
  IMAGE_GALLERY_SERVICE_KEY,
} from '@myrmidon/cadmus-img-gallery';
import { GalleryImage, ListAnnotation } from '@myrmidon/cadmus-img-annotator';

import {
  CHGC_IMAGE_ANNOTATIONS_PART_TYPEID,
  ChgcAnnotationPayload,
  ChgcImageAnnotation,
  ChgcImageAnnotationsPart,
} from '../chgc-image-annotations';

/**
 * ChgcImageAnnotationsPart editor component.
 * Thesauri: gallery-image-annotation-filters, chgc-ids.
 */
@Component({
  selector: 'cadmus-chgc-image-annotations-part',
  templateUrl: './chgc-image-annotations-part.component.html',
  styleUrls: ['./chgc-image-annotations-part.component.css'],
})
export class ChgcImageAnnotationsPartComponent
  extends ModelEditorComponentBase<ChgcImageAnnotationsPart>
  implements OnInit
{
  public tabIndex: number;

  // gallery-image-annotation-filters
  public filterEntries: ThesaurusEntry[] | undefined;
  // chgc-ids
  public idEntries: ThesaurusEntry[] | undefined;

  public image?: GalleryImage;
  public annotations: FormControl<ListAnnotation<ChgcAnnotationPayload>[]>;
  public editedIndex: number;
  public editedAnnotation?: ChgcImageAnnotation;

  @ViewChild('editor', { static: false, read: ElementRef })
  public editorRef?: ElementRef;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    // @Inject(IMAGE_GALLERY_SERVICE_KEY)
    // private _galleryService: GalleryService,
    // private _options: GalleryOptionsService
  ) {
    super(authService, formBuilder);
    this.tabIndex = 0;
    this.editedIndex = -1;
    // form
    this.annotations = formBuilder.control([], {
      // at least 1 entry
      validators: NgToolsValidators.strictMinLengthValidator(1),
      nonNullable: true,
    });
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(formBuilder: FormBuilder): FormGroup | UntypedFormGroup {
    return formBuilder.group({
      annotations: this.annotations,
    });
  }

  private updateThesauri(thesauri: ThesauriSet): void {
    let key = 'gallery-image-annotation-filters';
    if (this.hasThesaurus(key)) {
      this.filterEntries = thesauri[key].entries;
    } else {
      this.filterEntries = undefined;
    }
    key = 'chgc-ids';
    if (this.hasThesaurus(key)) {
      this.idEntries = thesauri[key].entries;
    } else {
      this.idEntries = undefined;
    }
  }

  private chgcToListAnnotation(
    source: ChgcImageAnnotation | null
  ): ListAnnotation<ChgcAnnotationPayload> | null {
    if (!source) {
      return null;
    }
    return {
      id: source.id,
      image: source.target,
      value: {
        id: source.id,
        '@context': 'http://www.w3.org/ns/anno.jsonld',
        type: 'Annotation',
        target: {
          source: source.target.uri,
          selector: {
            type: source.selector.startsWith('<')
              ? 'SvgSelector'
              : 'FragmentSelector',
            conformsTo: 'http://www.w3.org/TR/media-frags/',
            value: source.selector,
          },
        },
        // we need a body for Annotorious to work
        body: [
          {
            type: 'TextualBody',
            value: source.eid,
            purpose: 'tagging',
          },
        ],
      },
      payload: {
        eid: source.eid,
        label: source.label,
        note: source.note,
      },
    };
  }

  private listToChgcAnnotation(
    source: ListAnnotation<ChgcAnnotationPayload> | null
  ): ChgcImageAnnotation | null {
    if (!source) {
      return null;
    }
    return {
      id: source.id,
      // defensive: should source.image not yet be set, use the current image
      target: source.image || this.image!,
      selector: source.value.target.selector.value,
      eid: source.payload?.eid || '',
      label: source.payload?.label || '',
      note: source.payload?.note || '',
    };
  }

  private updateForm(part?: ChgcImageAnnotationsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.image = part.image;

    setTimeout(() => {
      this.annotations.setValue(
        part.annotations.map((a) => this.chgcToListAnnotation(a)!) || []
      );
      this.form.markAsPristine();
    });
  }

  protected override onDataSet(
    data?: EditedObject<ChgcImageAnnotationsPart>
  ): void {
    // thesauri
    if (data?.thesauri) {
      this.updateThesauri(data.thesauri);
    }

    // form
    this.updateForm(data?.value);
  }

  protected getValue(): ChgcImageAnnotationsPart {
    let part = this.getEditedPart(
      CHGC_IMAGE_ANNOTATIONS_PART_TYPEID
    ) as ChgcImageAnnotationsPart;
    part.image = this.image;
    part.annotations =
      this.annotations.value.map((a) => this.listToChgcAnnotation(a)!) || [];
    return part;
  }

  public onImageChange(image?: GalleryImage): void {
    this.image = image;
    if (this.image) {
      this.tabIndex = 0;
    }
  }

  public onAnnotationsChange(
    annotations: ListAnnotation<ChgcAnnotationPayload>[]
  ): void {
    this.annotations.setValue(annotations);
    this.annotations.updateValueAndValidity();
    this.annotations.markAsDirty();
  }
}
