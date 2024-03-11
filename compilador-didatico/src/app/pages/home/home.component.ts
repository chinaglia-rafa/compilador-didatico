import { AfterViewInit, Component, ViewChild } from '@angular/core';
import {
  MasterCardComponent,
  MasterCardItem,
} from '../../components/master-card/master-card.component';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MasterCardComponent, NgScrollbarModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements AfterViewInit {
  itemsTest: MasterCardItem[] = [
    { label: 'linhas digitadas', value: '42', color: 'default' },
    { label: 'erros', value: '3', color: 'error' },
  ];

  @ViewChild('codigoFonteCard')
  codigoFonteCardComponent?: MasterCardComponent;
  @ViewChild('analiseLexicaCard')
  analiseLexicaCardComponent?: MasterCardComponent;
  @ViewChild('simbolosCard')
  simbolosCardComponent?: MasterCardComponent;
  @ViewChild('analiseSintaticaCard')
  analiseSintaticaCardComponent?: MasterCardComponent;
  @ViewChild('analiseSemanticaCard')
  analiseSemanticaCardComponent?: MasterCardComponent;
  @ViewChild('geracaoDeCodigoCard')
  geracaoDeCodigoCardComponent?: MasterCardComponent;
  @ViewChild('otimizacaoDeCodigoCard')
  otimizacaoDeCodigoCardComponent?: MasterCardComponent;
  @ViewChild('resultadoFinalCard')
  resultadoFinalCardComponent?: MasterCardComponent;

  /** Lista de todos os cards presentes na tela inicial */
  private cards: (MasterCardComponent | undefined)[] = [];

  ngAfterViewInit(): void {
    this.cards = [
      this.codigoFonteCardComponent,
      this.analiseLexicaCardComponent,
      this.simbolosCardComponent,
      this.analiseSintaticaCardComponent,
      this.analiseSemanticaCardComponent,
      this.geracaoDeCodigoCardComponent,
      this.otimizacaoDeCodigoCardComponent,
      this.resultadoFinalCardComponent,
    ];
  }

  clicked(event: MouseEvent, el: MasterCardComponent): void {
    el.toggleLoading();

    this.cards.map((card) => card?.setSelected(false));

    el.toggleLoading();

    // setTimeout(() => el.toggleLoading(), 2000);
    el.toggle();
  }
}
