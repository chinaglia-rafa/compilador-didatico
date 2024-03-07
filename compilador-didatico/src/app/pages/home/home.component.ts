import { Component } from '@angular/core';
import {
  MasterCardComponent,
  MasterCardItem,
} from '../../components/master-card/master-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MasterCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  itemsTest: MasterCardItem[] = [
    { label: 'linhas digitadas', value: '42', color: 'default' },
    { label: 'erros', value: '3', color: 'error' },
  ];
}
