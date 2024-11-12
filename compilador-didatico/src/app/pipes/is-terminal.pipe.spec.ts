import { IsTerminalPipe } from './is-terminal.pipe';

describe('IsTerminalPipe', () => {
  it('create an instance', () => {
    const pipe = new IsTerminalPipe();
    expect(pipe).toBeTruthy();
  });
});
