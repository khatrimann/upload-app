import { ImageService } from './services/image.service';
import { Component, OnInit } from '@angular/core';
import {  FileUploader, FileSelectDirective, FileUploadModule, FileItem } from 'ng2-file-upload/ng2-file-upload';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import {HttpClient, HttpResponse, HttpEventType, HttpEvent} from "@angular/common/http";
import { DomSanitizer, SafeUrl} from '@angular/platform-browser';
import { ElementRef } from '@angular/core';
import {ChangeDetectorRef} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  uploadForm: FormGroup;
  public filePreviewPath: SafeUrl;
  pathimg: string;
  public uploadPercentage = 0;
  ppath: SafeUrl[] = [];
  warning = false;
  limitWarning = false;
  images: string[];

  public uploader: FileUploader = new FileUploader({
    isHTML5: true,
    itemAlias: 'imageFile',
  });

  title = 'Angular File Upload';
  constructor(private fb: FormBuilder, private http: HttpClient, private sanitizer: DomSanitizer, private imageService: ImageService ) {

    this.uploader.onAfterAddingFile = (fileItem) => {
      if (fileItem._file.size > 10000000) {
        this.warning = true;
      } else {
        this.warning = false;
      }
      if (this.uploader.queue.length >= 6) {
        this.limitWarning = true;
      } else {
        this.limitWarning = false;
      }
      this.filePreviewPath  = this.sanitizer.bypassSecurityTrustUrl((window.URL.createObjectURL(fileItem._file)));
      this.ppath.push(this.filePreviewPath);
    };

    this.imageService.getImages().subscribe(res => this.images = res);
   }

  uploadSubmit() {
        for (let i = 0; i < this.uploader.queue.length; i++) {
          let fileItem = this.uploader.queue[i]._file;
          console.log(fileItem);
          if (fileItem.size > 10000000){
            alert('Each File should be less than 10 MB of size.');
            return;
          }
        }
        for (let j = 0; j < this.uploader.queue.length; j++) {
          let data = new FormData();
          let fileItem = this.uploader.queue[j]._file;
          console.log(fileItem);
          data.append('imageFile', fileItem);
          data.append('fileSeq', 'seq'+j);
          data.append( 'dataType', this.uploadForm.controls.type.value);
          this.uploadFile(data).subscribe(event => {
            console.log(event);
            if (event.type == HttpEventType.UploadProgress) {
            console.log('uplaod progress');
            const percentage = Math.round(100 * event.loaded / event.total);
            this.uploadPercentage = percentage;
            console.log(percentage);
            console.log(`file is ${percentage}% uploaded`);
            } else if (event instanceof HttpResponse) {
              console.log('File is completely uploaded');
              setTimeout(() => {
                this.uploadPercentage = 0;
              }, 1000);
            }
          });
        }
        this.uploader.clearQueue();
        this.ppath.splice(0, this.ppath.length);
        // this.uploadPercentage = 0;
        setTimeout(() => {this.imageService.getImages().subscribe(res => this.images = res)}, 2000);

  }

  uploadFile(data: FormData): Observable<any>{

    console.log(data);
    return this.http.post<any>('http://localhost:3000/upload', data,  {
      reportProgress: true, observe: 'events'
     });
  }

  ngOnInit() {
    this.uploadForm = this.fb.group({
      document: [null, null],
      type:  [null, Validators.compose([Validators.required])]
    });
  }
  removeIndex(index: number) {
    console.log(index);
    console.log(this.ppath[index]);
    delete this.ppath[index];
  }
  deleteImage(id: string, index: any) {
    console.log(id);
    console.log(index);
    this.images.splice(index, 1);
    console.log('deleting');
    this.imageService.removeImage(id).subscribe(res => console.log(res));
  }

}
