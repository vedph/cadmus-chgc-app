import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ChgcImageAnnotation } from '../chgc-image-annotations';
import { IdLookupService } from './id-lookup.service';

/**
 * Editor for CHGC image annotations metadata.
 */
@Component({
  selector: 'cadmus-chgc-image-annotation',
  templateUrl: './chgc-image-annotation.component.html',
  styleUrls: ['./chgc-image-annotation.component.css'],
  providers: [IdLookupService],
})
export class ChgcImageAnnotationComponent {
  private _annotation: ChgcImageAnnotation | undefined;

  /**
   * The annotation to edit.
   */
  @Input()
  public get annotation(): ChgcImageAnnotation | undefined | null {
    return this._annotation;
  }
  public set annotation(value: ChgcImageAnnotation | undefined | null) {
    if (this._annotation === value) {
      return;
    }
    this._annotation = value || undefined;
    this.updateForm(this._annotation);
  }

  // chgc-ids
  @Input()
  public idEntries: ThesaurusEntry[] | undefined;

  @Output()
  public editorClose: EventEmitter<void>;

  @Output()
  public annotationChange: EventEmitter<ChgcImageAnnotation>;

  public eid: FormControl<ThesaurusEntry | null>;
  public label: FormControl<string | null>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(
    formBuilder: FormBuilder,
    public idLookupService: IdLookupService
  ) {
    // form
    this.eid = formBuilder.control(null, Validators.required);
    this.label = formBuilder.control(null, Validators.maxLength(100));
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      eid: this.eid,
      label: this.label,
      note: this.note,
    });
    // events
    this.annotationChange = new EventEmitter<ChgcImageAnnotation>();
    this.editorClose = new EventEmitter<void>();
  }

  private updateForm(annotation?: ChgcImageAnnotation): void {
    if (!annotation) {
      this.form.reset();
      return;
    }
    // in CHGC id is always equal to value
    this.eid.setValue({ id: annotation.eid, value: annotation.eid });
    this.label.setValue(annotation.label || null);
    this.note.setValue(annotation.note || null);
    this.form.markAsPristine();
  }

  private getModel(): ChgcImageAnnotation {
    return {
      ...this._annotation!,
      eid: this.eid.value?.id || '',
      label: this.label.value || undefined,
      note: this.note.value || undefined,
    };
  }

  public onItemChange(item: ThesaurusEntry | undefined) {
    this.eid.setValue(item || null);
    this.eid.markAsDirty();
    this.eid.updateValueAndValidity();
  }

  public cancel(): void {
    this.editorClose.emit();
  }

  public save(): void {
    if (!this.form.valid) {
      return;
    }
    this._annotation = this.getModel();
    this.annotationChange.emit(this._annotation);
  }
}
