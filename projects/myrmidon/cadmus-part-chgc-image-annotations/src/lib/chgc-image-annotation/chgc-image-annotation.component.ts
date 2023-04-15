import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { renderLabelFromLastColon } from '@myrmidon/cadmus-ui';

import { ChgcImageAnnotation } from '../chgc-image-annotations';

/**
 * Editor for CHGC image annotations metadata.
 */
@Component({
  selector: 'cadmus-chgc-image-annotation',
  templateUrl: './chgc-image-annotation.component.html',
  styleUrls: ['./chgc-image-annotation.component.css'],
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
  // chgc-renditions
  @Input()
  public rendEntries: ThesaurusEntry[] | undefined;

  @Output()
  public editorClose: EventEmitter<void>;

  @Output()
  public annotationChange: EventEmitter<ChgcImageAnnotation>;

  public eid: FormControl<string>;
  public renditions: FormControl<ThesaurusEntry[]>;
  public lineCount: FormControl<number>;
  public hasCallSign: FormControl<boolean>;
  public note: FormControl<string | null>;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    // form
    this.eid = formBuilder.control('', {
      validators: [Validators.required, Validators.maxLength(50)],
      nonNullable: true,
    });
    this.renditions = formBuilder.control([], {
      nonNullable: true,
    });
    this.lineCount = formBuilder.control(0, { nonNullable: true });
    this.hasCallSign = formBuilder.control(false, { nonNullable: true });
    this.note = formBuilder.control(null, Validators.maxLength(1000));
    this.form = formBuilder.group({
      eid: this.eid,
      renditions: this.renditions,
      lineCount: this.lineCount,
      hasCallSign: this.hasCallSign,
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
    this.eid.setValue(annotation.eid);
    this.renditions.setValue(
      annotation.renditions?.map(
        (id) => this.rendEntries?.find((e) => e.id === id) || { id, value: id }
      ) || []
    );
    this.lineCount.setValue(annotation.lineCount || 0);
    this.hasCallSign.setValue(annotation.hasCallSign || false);
    this.note.setValue(annotation.note || null);
    this.form.markAsPristine();
  }

  private getModel(): ChgcImageAnnotation {
    return {
      ...this._annotation!,
      eid: this.eid.value,
      renditions: this.renditions.value.map((e) => e.id),
      lineCount: this.lineCount.value,
      hasCallSign: this.hasCallSign.value,
      note: this.note.value || undefined,
    };
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

  public onEntryChange(entry: ThesaurusEntry): void {
    const renditions = [...this.renditions.value];
    if (renditions.find((e) => e.id === entry.id)) {
      return;
    }
    renditions.push(entry);
    renditions.sort((a, b) => a.value.localeCompare(b.value));
    this.renditions.setValue(renditions);
    this.renditions.markAsDirty();
    this.renditions.updateValueAndValidity();
  }

  public removeRendition(index: number): void {
    const renditions = [...this.renditions.value];
    renditions.splice(index, 1);
    this.renditions.setValue(renditions);
    this.renditions.markAsDirty();
    this.renditions.updateValueAndValidity();
  }

  public renderLabel(label: string): string {
    return renderLabelFromLastColon(label);
  }
}
