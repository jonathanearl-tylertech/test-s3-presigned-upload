import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  api = 'http://tide-broker-admin.localdev.tcpci.com:5000/api/Branding/logo/presignedUrl'

  url: string | undefined
  file: File | undefined;

  constructor(private _http: HttpClient) {
  }

  async handleChange(event: any) {
    const file: File = event.target?.files?.[0];
    this.file = file;
    console.log(`file: ${file.name} has been selected`);
    await this.getPresignedUrl(file.type);
  }

  async getPresignedUrl(fileType: string) {
    console.log('retrieveing presigned url');
    const extension = fileType.split("/").pop();
    const options = {
      params: { extension: `.${extension}` },
      responseType: 'text' as 'json'
    }
    const result = await firstValueFrom(this._http.get<string>(this.api, options));
    console.log({ result });
    this.url = result;
  }

  async uploadImage() {
    console.log('uploading image...', this.url, this.file)
    if (!this.url) { console.log('presigned url missing'); return; }
    if (!this.file) { console.log('file missing'); return; }

    // pull extension off file name
    const extension = this.file.type.split("/").pop();

    // not sure why this is required, but will fail 403 without renaming the file
    const myFile = new File([this.file], `logo.${extension}`);

    await firstValueFrom(this._http.put(this.url, myFile));
    // not implemented
    console.log('cant publish not implemented')
    // await firstValueFrom(
    //   this._http.post<string>(`${this.api}/customer/${this.customerId}/publishStaged`, null)
    // )
  }
}
