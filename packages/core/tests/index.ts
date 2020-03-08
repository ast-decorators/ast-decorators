import {compare as _compare} from '../../../utils/testing';
import options from './fixtures/options';

describe('@ast-decorators/core', () => {
  describe('class', () => {
    const compare = async (fixture: string): Promise<void> =>
      _compare(__dirname, 'class', fixture, options);

    it('compiles decorator for a class', async () => {
      await compare('default');
    });

    it('compiles multiple decorators for a class', async () => {
      await compare('multiple-decorators');
    });

    it('compiles decorators imported as namespace', async () => {
      await compare('namespace');
    });

    it('compiles decorators with params', async () => {
      await compare('params');
    });

    describe('options', () => {
      const compareOptions = async (
        fixture: string,
        optionsFileName: string,
      ): Promise<void> =>
        _compare(__dirname, 'class', fixture, optionsFileName);

      it('compiles if privacy set to "hard"', async () => {
        await compareOptions('options', 'optionsHard');
      });

      it('compiles if privacy set to "none"', async () => {
        await compareOptions('options', 'optionsNone');
      });
    });
  });

  describe('class-member', () => {
    const compare = async (fixture: string): Promise<void> =>
      _compare(__dirname, 'class-member', fixture, options);

    it('compiles decorator for a public property', async () => {
      await compare('public-property');
    });

    it('compiles decorator for a private property', async () => {
      await compare('private-property');
    });

    it('compiles decorator for a public method', async () => {
      await compare('public-method');
    });

    it('compiles decorator for a private method', async () => {
      await compare('private-method');
    });

    it('compiles multiple decorators for a method', async () => {
      await compare('multiple-decorators');
    });

    it('compiles decorators imported as a namespace for a method', async () => {
      await compare('namespace');
    });
  });
});
