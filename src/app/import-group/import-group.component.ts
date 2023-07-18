import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ImportService } from '../import.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs';

@Component({
  selector: 'app-import-group',
  templateUrl: './import-group.component.html',
  styleUrls: ['./import-group.component.css'],
})
export class ImportGroupComponent {
  public groupId: FormControl<string | null>;
  public form: FormGroup;
  public busy?: boolean;
  public xml: FormControl<string | null>;
  public addedCount: number;

  public editorOptions = {
    theme: 'vs-light',
    language: 'xml',
    wordWrap: 'on',
    // https://github.com/atularen/ngx-monaco-editor/issues/19
    automaticLayout: true,
  };

  constructor(
    formBuilder: FormBuilder,
    private _service: ImportService,
    private _snackbar: MatSnackBar
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
    this.addedCount = 0;
  }

  public import(): void {
    if (this.busy || this.form.invalid) {
      return;
    }
    this.busy = true;
    this._service
      .importGroup(this.groupId.value!, this.xml.value)
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.busy = false;
          if (result.error) {
            this._snackbar.open(result.error, 'OK');
          } else {
            this.addedCount = result.count;
          }
        },
        error: (error) => {
          this.busy = false;
          if (error) {
            console.error(JSON.stringify(error));
          }
          this._snackbar.open(error.message || 'Error importing group', 'OK');
        },
      });
  }
}
