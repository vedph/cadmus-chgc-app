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
import { take } from 'rxjs';

import { NgToolsValidators } from '@myrmidon/ng-tools';
import { AuthJwtService } from '@myrmidon/auth-jwt-login';
import { EditedObject, ModelEditorComponentBase } from '@myrmidon/cadmus-ui';
import { ThesauriSet, ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  GalleryImage,
  GalleryOptionsService,
  GalleryService,
  IMAGE_GALLERY_SERVICE_KEY,
} from '@myrmidon/cadmus-img-gallery';
import {
  BarCustomAction,
  BarCustomActionRequest,
} from '@myrmidon/cadmus-ui-custom-action-bar';

import {
  CHGC_IMAGE_ANNOTATIONS_PART_TYPEID,
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
  public annotations: FormControl<ChgcImageAnnotation[]>;
  public editedIndex: number;
  public editedAnnotation?: ChgcImageAnnotation;
  public actions: BarCustomAction[];

  @ViewChild('editor', { static: false })
  public editorRef?: ElementRef;

  constructor(
    authService: AuthJwtService,
    formBuilder: FormBuilder,
    @Inject(IMAGE_GALLERY_SERVICE_KEY)
    private _galleryService: GalleryService,
    private _options: GalleryOptionsService
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
    // actions
    this.actions = [
      {
        id: 'edit-meta',
        tip: 'Edit metadata',
        iconId: 'list_alt',
      },
    ];
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

  private updateForm(part?: ChgcImageAnnotationsPart | null): void {
    if (!part) {
      this.form.reset();
      return;
    }
    this.image = part.annotations?.length
      ? part.annotations[0].target
      : undefined;
    this.annotations.setValue(part.annotations || []);
    this.form.markAsPristine();
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
    part.annotations = this.annotations.value || [];
    return part;
  }

  public onImagePick(image: GalleryImage): void {
    // get the single image as we need the "full" size
    const options = { ...this._options, width: 600, height: 800 };

    this._galleryService
      .getImage(image.id, this._options.get())
      .pipe(take(1))
      .subscribe((image) => {
        this.image = image!;
      });
    this.tabIndex = 0;
  }

  public onAnnotationsChange(annotations: ChgcImageAnnotation[]): void {
    this.annotations.setValue(annotations);
    this.annotations.updateValueAndValidity();
    this.annotations.markAsDirty();
  }

  private scrollTo(element: HTMLElement) {
    element.scrollIntoView();
  }

  public editAnnotation(annotation: ChgcImageAnnotation, index: number): void {
    this.editedAnnotation = annotation;
    this.editedIndex = index;
    setTimeout(() => {
      if (this.editorRef?.nativeElement) {
        this.scrollTo(this.editorRef.nativeElement);
        this.editorRef.nativeElement.focus();
      }
    }, 0);
  }

  public closeAnnotation(): void {
    this.editedAnnotation = undefined;
    this.editedIndex = -1;
  }

  public saveAnnotation(annotation: ChgcImageAnnotation): void {
    if (this.editedIndex === -1) {
      return;
    }
    const annotations = [...this.annotations.value];
    annotations[this.editedIndex] = annotation;
    this.annotations.setValue(annotations);
    this.annotations.updateValueAndValidity();
    this.annotations.markAsDirty();
    this.closeAnnotation();
  }

  public onActionRequest(action: BarCustomActionRequest): void {
    if (action.id === 'edit-meta') {
      const i = +action.payload;
      this.editAnnotation(this.annotations.value[i], i);
    }
  }
}
