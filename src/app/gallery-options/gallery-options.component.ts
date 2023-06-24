import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';

import { ThesaurusService } from '@myrmidon/cadmus-api';
import { ThesaurusEntry } from '@myrmidon/cadmus-core';
import { GalleryOptionsService } from '@myrmidon/cadmus-img-gallery';
import { SimpleIiifGalleryOptions } from '@myrmidon/cadmus-img-gallery-iiif';

export interface ChgcGalleryOptions extends SimpleIiifGalleryOptions {
  id: string;
}

@Component({
  selector: 'app-gallery-options',
  templateUrl: './gallery-options.component.html',
  styleUrls: ['./gallery-options.component.css'],
})
export class GalleryOptionsComponent {
  public source: FormControl<ThesaurusEntry | null>;
  public form: FormGroup;

  public sources: ThesaurusEntry[];

  constructor(
    formBuilder: FormBuilder,
    thesService: ThesaurusService,
    private _optService: GalleryOptionsService,
    private _router: Router
  ) {
    this.source = formBuilder.control(null, Validators.required);
    this.form = formBuilder.group({
      source: this.source,
    });
    this.sources = [];
    thesService
      .getThesaurus('chgc-gallery-sources')
      .pipe(take(1))
      .subscribe((t) => {
        this.sources = t?.entries || [];
        const options = this._optService.get() as ChgcGalleryOptions;
        this.source.setValue(
          this.sources.find((e) => e.id === options.id) || null
        );
      });
  }

  public cancel(): void {
    this._router.navigate(['/items']);
  }

  public save(): void {
    if (!this.form.valid) {
      return;
    }
    this._optService.set({
      ...this._optService.get(),
      id: this.source.value!.id,
      manifestUri: this.source.value!.value,
    } as ChgcGalleryOptions);
    this._router.navigate(['/items']);
  }
}
