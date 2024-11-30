import { Component } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { EnvService } from '@myrmidon/ng-tools';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FileExtensionValidator } from './file-extension.validator';

interface UploadResult {
  importedIds: string[];
  error?: string;
}

@Component({
  selector: 'app-import-thesauri',
  templateUrl: './import-thesauri.component.html',
  styleUrls: ['./import-thesauri.component.css'],
  standalone: false,
})
export class ImportThesauriComponent {
  private _uploadRequest?: HttpRequest<any>;
  private _sub?: Subscription;

  public file: FormControl<File | null>;
  public mode: FormControl<string>;
  public excelSheet: FormControl<number>;
  public excelRow: FormControl<number>;
  public excelColumn: FormControl<number>;
  public dryRun: FormControl<boolean>;
  public form: FormGroup;

  public uploadProgress: number = 0;
  public uploading: boolean = false;
  public result?: UploadResult;

  constructor(
    formBuilder: FormBuilder,
    private http: HttpClient,
    private _env: EnvService
  ) {
    const fileExtensionValidator = new FileExtensionValidator([
      'json',
      'csv',
      'xls',
      'xlsx',
    ]);
    this.file = formBuilder.control(null, [
      Validators.required,
      (control) => fileExtensionValidator.validate(control),
    ]);

    this.mode = formBuilder.control('R', {
      validators: Validators.required,
      nonNullable: true,
    });
    this.excelSheet = formBuilder.control(1, {
      nonNullable: true,
      validators: [Validators.min(1)],
    });
    this.excelRow = formBuilder.control(1, {
      nonNullable: true,
      validators: [Validators.min(1)],
    });
    this.excelColumn = formBuilder.control(1, {
      nonNullable: true,
      validators: [Validators.min(1)],
    });
    this.dryRun = formBuilder.control(false, {
      nonNullable: true,
    });
    this.form = formBuilder.group({
      file: this.file,
      mode: this.mode,
      excelSheet: this.excelSheet,
      excelRow: this.excelRow,
      excelColumn: this.excelColumn,
      dryRun: this.dryRun,
    });
  }

  public onFileSelected(event: any) {
    this.file.setValue(event.target.files[0]);
  }

  public upload() {
    if (!this.form.valid) {
      return;
    }
    this.result = undefined;
    this.uploading = true;

    // form data
    const fd = new FormData();
    fd.append('file', this.file.value!, this.file.value!.name);

    // URL
    const sb: string[] = [];
    sb.push(this._env.get('apiUrl')!);
    sb.push('import/thesauri');
    // mode
    if (this.mode.value !== 'R') {
      sb.push('?mode=');
      sb.push(this.mode.value);
    }
    // excel
    if (this.excelSheet.value !== 1) {
      sb.push('?excelSheet=');
      sb.push(`${this.excelSheet.value}`);
    }
    if (this.excelRow.value !== 1) {
      sb.push('?excelRow=');
      sb.push(`${this.excelRow.value}`);
    }
    if (this.excelColumn.value !== 1) {
      sb.push('?excelColumn=');
      sb.push(`${this.excelColumn.value}`);
    }
    // dry
    if (this.dryRun.value) {
      sb.push('?dryRun=true');
    }

    this._uploadRequest = new HttpRequest('POST', sb.join(''), fd, {
      reportProgress: true,
    });
    this._sub = this.http.request(this._uploadRequest).subscribe((event) => {
      if (event.type === HttpEventType.UploadProgress) {
        this.uploadProgress = Math.round((event.loaded / event.total!) * 100);
      } else if (event.type === HttpEventType.Response) {
        this.uploading = false;
        this.result = event.body as UploadResult;
      }
    });
  }

  public onCancel() {
    // cancel the upload request
    this._sub?.unsubscribe();
    this.uploading = false;
    this.uploadProgress = 0;
  }
}
