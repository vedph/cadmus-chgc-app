import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatDialog,
  MatDialogConfig,
} from '@angular/material/dialog';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  GalleryOptionsService,
  GalleryService,
  IMAGE_GALLERY_SERVICE_KEY,
} from '@myrmidon/cadmus-img-gallery';
import { Subscription, take } from 'rxjs';

import {
  Annotation,
  AnnotationEvent,
  GalleryImage,
  ImgAnnotationList,
  ListAnnotation,
} from '@myrmidon/cadmus-img-annotator';

import { ChgcAnnotationPayload } from '../chgc-image-annotations';
import { ChgcImageAnnotationDialogComponent } from '../chgc-image-annotation-dialog/chgc-image-annotation-dialog.component';

@Component({
  selector: 'cadmus-chgc-gallery-img-annotator',
  templateUrl: './chgc-gallery-img-annotator.component.html',
  styleUrls: ['./chgc-gallery-img-annotator.component.css'],
})
export class ChgcGalleryImgAnnotatorComponent implements OnInit, OnDestroy {
  private _sub?: Subscription;
  private _image?: GalleryImage;
  private _list?: ImgAnnotationList<ChgcAnnotationPayload>;
  private _pendingAnnotations?: ListAnnotation<ChgcAnnotationPayload>[];

  public loading?: boolean;
  public entries: ThesaurusEntry[];
  public annotator?: any;
  public editorComponent = ChgcImageAnnotationDialogComponent;
  public tool: string = 'rect';
  public tabIndex: number = 0;
  public annotationToString: (
    a: ListAnnotation<ChgcAnnotationPayload>
  ) => string = (a: ListAnnotation<ChgcAnnotationPayload>) => {
    return a.payload?.eid || '';
  };

  /**
   * The gallery image to annotate.
   */
  @Input()
  public get image(): GalleryImage | undefined | null {
    return this._image;
  }
  public set image(value: GalleryImage | undefined | null) {
    if (this._image === value) {
      return;
    }
    this._image = value || undefined;
    this.loading = true;
    this.imageChange.emit(this._image);
  }

  /**
   * The annotations being edited.
   */
  @Input()
  public get annotations(): ListAnnotation<ChgcAnnotationPayload>[] {
    return this._list?.getAnnotations() || [];
  }
  public set annotations(value: ListAnnotation<ChgcAnnotationPayload>[]) {
    if (!this.loading && this._list) {
      this._list.setAnnotations(value);
    } else if (value?.length) {
      this._pendingAnnotations = value;
    }
  }

  /**
   * Emitted when image changes.
   */
  @Output()
  public imageChange: EventEmitter<GalleryImage | undefined>;

  /**
   * Emitted whenever annotations change.
   */
  @Output()
  public annotationsChange: EventEmitter<
    ListAnnotation<ChgcAnnotationPayload>[]
  >;

  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DEFAULT_OPTIONS) public dlgConfig: MatDialogConfig,
    @Inject(IMAGE_GALLERY_SERVICE_KEY)
    private _galleryService: GalleryService,
    private _options: GalleryOptionsService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.imageChange = new EventEmitter<GalleryImage | undefined>();
    this.annotationsChange = new EventEmitter<
      ListAnnotation<ChgcAnnotationPayload>[]
    >();

    // mock filter entries
    this.entries = [
      {
        id: 'title',
        value: 'title',
      },
      {
        id: 'dsc',
        value: 'description',
      },
    ];
  }

  public ngOnInit(): void {
    if (!this._image) {
      this.tabIndex = 1;
    }
  }

  public ngOnDestroy(): void {
    this._sub?.unsubscribe();
  }

  public onImageLoad(): void {
    this.loading = false;
    this.tabIndex = 0;

    setTimeout(() => {
      if (this._pendingAnnotations?.length) {
        this._list!.setAnnotations(this._pendingAnnotations || []);
        this._pendingAnnotations = undefined;
      }
    });
  }

  public onToolChange(tool: string): void {
    this.tool = tool;
  }

  public onAnnotatorInit(annotator: any) {
    setTimeout(() => {
      this.annotator = annotator;
      this.changeDetector.detectChanges();
    });
  }

  public onListInit(list: ImgAnnotationList<ChgcAnnotationPayload>) {
    this._list = list;

    // emit annotations whenever they change
    this._sub?.unsubscribe();
    this._sub = this._list.annotations$.subscribe((annotations) => {
      if (this._image && !this.loading) {
        this.annotationsChange.emit(annotations);
      }
    });

    // if (!this.loading && this._pendingAnnotations) {
    //   this._list.setAnnotations(this._pendingAnnotations);
    //   this._pendingAnnotations = undefined;
    // }
  }

  // public setAnnotations(): void {
  //   this._list?.setAnnotations(annotations);
  // }

  public onCreateSelection(annotation: Annotation) {
    this._list?.onCreateSelection(annotation);
  }

  public onSelectAnnotation(annotation: Annotation) {
    this._list?.onSelectAnnotation(annotation);
  }

  public onCancelSelected(annotation: Annotation) {
    this._list?.onCancelSelected(annotation);
  }

  public editAnnotation(index: number): void {
    this._list?.editAnnotation(index);
  }

  public selectAnnotation(index: number): void {
    this._list?.selectAnnotation(index);
  }

  public removeAnnotation(index: number): void {
    this._list?.removeAnnotation(index);
  }

  public onCreateAnnotation(event: AnnotationEvent) {
    this._list?.onCreateAnnotation(event);
  }

  public onUpdateAnnotation(event: AnnotationEvent) {
    this._list?.onUpdateAnnotation(event);
  }

  public onDeleteAnnotation(event: AnnotationEvent) {
    this._list?.onDeleteAnnotation(event);
  }

  public onImagePick(image: GalleryImage): void {
    this._galleryService
      .getImage(image.id, this._options.get())
      .pipe(take(1))
      .subscribe((image) => {
        this.image = image!;
      });
    this.tabIndex = 1;
  }
}
