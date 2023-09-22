import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ExportService } from '../export.service';
import { take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GroupRefLookupService } from '../services/group-ref-lookup.service';

@Component({
  selector: 'app-export-group',
  templateUrl: './export-group.component.html',
  styleUrls: ['./export-group.component.css'],
})
export class ExportGroupComponent {
  public groupId: FormControl<string | null>;
  public form: FormGroup;
  public busy?: boolean;
  public xml: FormControl<string | null>;

  public editorOptions = {
    theme: 'vs-light',
    language: 'xml',
    wordWrap: 'on',
    // https://github.com/atularen/ngx-monaco-editor/issues/19
    automaticLayout: true,
  };

  constructor(
    formBuilder: FormBuilder,
    private _service: ExportService,
    private _snackbar: MatSnackBar,
    public lookupService: GroupRefLookupService
  ) {
    this.groupId = new FormControl(null, [
      Validators.required,
      Validators.maxLength(100),
    ]);
    this.xml = formBuilder.control(null, Validators.maxLength(50000));
    this.form = formBuilder.group({
      groupId: this.groupId,
      xml: this.xml,
    });
  }

  public onGroupChange(groupId: string): void {
    this.groupId.setValue(groupId);
    this.groupId.updateValueAndValidity();
    this.groupId.markAsDirty();
  }

  public export(): void {
    if (this.busy || this.form.invalid) {
      return;
    }
    this.busy = true;
    this._service
      .exportGroup(this.groupId.value!, this.xml.value)
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.busy = false;
          if (result.error) {
            this._snackbar.open(result.error, 'OK');
          } else {
            this.xml.setValue(result.xml || '');
          }
        },
        error: (error) => {
          this.busy = false;
          if (error) {
            console.error(JSON.stringify(error));
          }
          this._snackbar.open(error.message || 'Error exporting group', 'OK');
        },
      });
  }

  public save() {
    if (this.busy || this.form.invalid || !this.xml.value) {
      return;
    }
    const blob = new Blob([this.xml.value], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.groupId.value + '.xml';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
