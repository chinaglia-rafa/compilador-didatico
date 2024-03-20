import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import '@material/web/button/text-button';
import { FilemanagerService } from '../../services/filemanager/filemanager.service';

@Component({
  selector: 'open-file',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './open-file.component.html',
  styleUrl: './open-file.component.scss',
})
export class OpenFileComponent {
  constructor(private filemanager: FilemanagerService) {}

  inputChange(arquivo: File | null | undefined): void {
    if (arquivo == null || arquivo == undefined) return;
    this.filemanager.upload(arquivo).catch(() => {
      console.log('ueba, arquivo carregado!');
    });
  }

  open(): void {}
}
