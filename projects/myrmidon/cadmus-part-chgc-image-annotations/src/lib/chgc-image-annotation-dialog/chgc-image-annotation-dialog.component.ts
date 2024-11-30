import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ListAnnotation } from '@myrmidon/cadmus-img-annotator';

import { ChgcAnnotationPayload } from '../chgc-image-annotations';

@Component({
  selector: 'cadmus-chgc-image-annotation-dialog',
  templateUrl: './chgc-image-annotation-dialog.component.html',
  styleUrls: ['./chgc-image-annotation-dialog.component.css'],
  standalone: false,
})
export class ChgcImageAnnotationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ChgcImageAnnotationDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: ListAnnotation<ChgcAnnotationPayload>
  ) {}

  onCloseClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(annotation: ListAnnotation<ChgcAnnotationPayload>): void {
    this.dialogRef.close(annotation);
  }
}
