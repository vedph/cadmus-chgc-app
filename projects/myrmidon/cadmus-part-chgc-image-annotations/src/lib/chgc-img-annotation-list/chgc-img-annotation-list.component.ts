import { Component } from '@angular/core';
import { ImgAnnotationListComponent } from '@myrmidon/cadmus-img-annotator';

import { ChgcAnnotationPayload } from '../chgc-image-annotations';

@Component({
  selector: 'cadmus-chgc-img-annotation-list',
  templateUrl: './chgc-img-annotation-list.component.html',
  styleUrls: ['./chgc-img-annotation-list.component.css'],
})
export class ChgcImgAnnotationListComponent extends ImgAnnotationListComponent<ChgcAnnotationPayload> {
  public selectAnnotation(annotation: any): void {
    this.list?.selectAnnotation(annotation);
  }

  public removeAnnotation(index: number): void {
    this.list?.removeAnnotation(index);
  }

  public editAnnotation(annotation: any): void {
    this.list?.editAnnotation(annotation);
  }

  public dumpAnnotation(annotation: any): void {
    if (annotation) {
      console.log(JSON.stringify(annotation));
    }
  }
}
