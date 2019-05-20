import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private http: HttpClient) { }

  getImages(): Observable<string[]> {
      return this.http.get<string[]>('http://localhost:3000/');
  }

  removeImage(id: string): Observable<any> {
    console.log('removing...' + 'http://localhost:3000/' + id);
    return this.http.delete<any>('http://localhost:3000/' + id);
  }
}
