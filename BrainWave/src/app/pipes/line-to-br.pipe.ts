import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'lineToBr'
})
export class LineToBrPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';
    
    const replaced = value.replace(/\n/g, '<br />');
    return this.sanitizer.bypassSecurityTrustHtml(replaced);
  }
}
