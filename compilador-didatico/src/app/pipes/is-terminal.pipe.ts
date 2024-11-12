import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isTerminal',
  standalone: true,
})
export class IsTerminalPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): boolean {
    return value.match(/<.+>/g) === null;
  }
}
