import { Pipe, PipeTransform } from '@angular/core';

/**
 * Inverte uma lista!
 */
@Pipe({
  name: 'reverse',
  standalone: true
})
export class ReversePipe implements PipeTransform {

  transform<T>(value: Array<T>): Array<T> {
    return value.slice().reverse();
  }

}
