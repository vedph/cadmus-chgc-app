import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ErrorService, EnvService } from '@myrmidon/ng-tools';
import { Observable, catchError } from 'rxjs';

export interface ImportResult {
  count: number;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ImportService {
  constructor(
    private _http: HttpClient,
    private _error: ErrorService,
    private _env: EnvService
  ) {}

  /**
   * Imports a group of items into a set of new items.
   *
   * @param id The group's ID.
   * @param xml The XML code representing a source TEI document
   * to patch. When not specified, a new document is created.
   * @returns Result.
   */
  public importGroup(
    id: string,
    xml?: string | null
  ): Observable<ImportResult> {
    const url = `${this._env.get('apiUrl')}import/groups/${id}`;
    return this._http
      .post<ImportResult>(url, { xml: xml || '' })
      .pipe(catchError(this._error.handleError));
  }
}
