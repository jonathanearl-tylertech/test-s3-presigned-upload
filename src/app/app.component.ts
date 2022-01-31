import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { catchError, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'test-s3-presigned-upload';
  customerId = 'tide-broker'
  presignedLogoEndpoint = `http://localhost:5010/api/v1/LogoUpload/customer/${this.customerId}/presignedUrl`;
  logoFileName = 'logo';
  url: string | undefined
  file: File | undefined;

  constructor(private _http: HttpClient) {
    this.presignedLogoEndpoint
  }

  handleChange(event: any) {
    const file: File = event.target?.files?.[0];
    this.file = file;
    console.log(`file: ${file.name} has been selected`);
    this.getPresignedUrl(file.type);
  }

  getPresignedUrl(fileType: string) {
    const extension = fileType.split("/").pop();
    const options = {
      params: { extension: `.${extension}` },
      responseType: 'text' as 'json'
    }
    this._http.get<string>(this.presignedLogoEndpoint, options)
      .pipe(tap(url => this.url = url))
      .pipe(tap(url => console.log(`retrieved url: ${url} from endpoint ${this.presignedLogoEndpoint}`)))
      .pipe(catchError(err => {
        console.log(err.error)
        return err;
      }))
      .subscribe()
  }

  uploadImage() {
    console.log('uploading image...', this.url, this.file)
    if(!this.url) { console.log('presigned url missing'); return; }
    if(!this.file) { console.log('file missing'); return; }

    // pull extension off file name
    const extension = this.file.type.split("/").pop();

    // not sure why this is required, but will fail 403 without renaming the file
    const myFile = new File([this.file], `${this.logoFileName}.${extension}`);

    this._http.put(this.url, myFile)
      .pipe(tap(res => console.log(res)))
      .pipe(catchError(err => {
        console.log(JSON.stringify(err))
        return err;
      }))
      .subscribe();
  }
}
