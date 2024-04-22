import { Component, Input, SimpleChanges } from '@angular/core';
import { Token } from '../../services/lexical-analysis/lexical-analysis.service';
import { EDITOR_KEYWORDS } from '../../pages/compiler/code-editor/code-editor.component';

@Component({
  selector: 'app-token',
  standalone: true,
  imports: [],
  templateUrl: './token.component.html',
  styleUrl: './token.component.scss',
})
export class TokenComponent {
  /** Dados da token a ser exibida usando o componente */
  @Input('tokenData') token: Token;
  /** Caso seja true, não adiciona o detalhe no início do componente */
  @Input('isFirst') isFirst: boolean = false;
  /** Caso seja true, não adiciona o detalhe no fim do componente */
  @Input('isEnd') isEnd: boolean = false;

  tokenColors = '';
  empColors = '';

  primaryColored = [
    'programa',
    'procedimento',
    'nova-variável',
    'tipo-inteiro',
    'tipo-booleano',
    'entrada-dado',
    'saida-dado',
    'condicional-se',
    'condicional-então',
    'condicional-se-não',
    'repetição-enquanto',
    'repetição-faça',
  ];

  tertiaryColored = ['identificador-válido'];

  successColored = ['número-natural', 'número-real'];

  errorColored = ['identificador-inválido', 'número-real-mal-formatado'];

  neutralColored = [
    'vírgula',
    'abre-parênteses',
    'fecha-parênteses',
    'dois-pontos',
    'boolean-verdadeiro',
    'boolean-falso',
    'inicio-bloco',
    'fim-bloco',
    'atribuição',
    'comparação-igual',
    'comparação-diferente',
    'comparação-menor',
    'comparação-menor-igual',
    'comparação-maior-igual',
    'comparação-maior',
    'operação-soma',
    'operação-subtração',
    'operação-ou',
    'operação-produto',
    'operação-divisão',
    'operação-e',
    'operação-não',
    'abre-colchete',
    'fecha-colchete',
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['token']?.currentValue.token !==
      changes['token']?.previousValue?.token
    ) {
      const r = this.colorize(changes['token'].currentValue.token);
      this.tokenColors = r.tokenColors;
      this.empColors = r.empColors;
    }
  }

  colorize(token: string): { tokenColors: string; empColors: string } {
    const r = {
      tokenColors: 'neutral',
      empColors: 'surface-variant on-surface-variant-text',
    };
    return r;
    if (this.primaryColored.includes(token)) {
      r.tokenColors = 'primary on-primary-text';
      r.empColors = 'primary-container on-primary-container-text';
    } else if (this.tertiaryColored.includes(token)) {
      r.tokenColors = 'tertiary on-tertiary-text';
      r.empColors = 'tertiary-container on-tertiary-container-text';
    } else if (this.neutralColored.includes(token)) {
      r.tokenColors = 'secondary on-secondary-text';
      r.empColors = 'secondary-container on-secondary-container-text';
    } else if (this.successColored.includes(token)) {
      r.tokenColors = 'tertiary-fixed-container on-tertiary-fixed-text';
      r.empColors = 'tertiary-fixed';
    } else if (this.errorColored.includes(token)) {
      r.tokenColors = 'error on-error-text';
      r.empColors = 'error-container on-error-container-text';
    }

    return r;
  }
}
