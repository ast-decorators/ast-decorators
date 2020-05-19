// TODO: remove eslint-disable when typescript-eslint can handle TS 3.8 properly
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import {NodePath} from '@babel/traverse';
import {
  Decorator,
  Identifier,
  isCallExpression,
  MemberExpression,
} from '@babel/types';
import ImportMetadata from './ImportMetadata';

export default class DecoratorMetadata extends ImportMetadata {
  readonly #args: readonly NodePath[];
  readonly #decorator: NodePath<Decorator>;
  readonly #isCall: boolean;

  // @ts-ignore
  public constructor(decorator: NodePath<Decorator>) {
    const expression = decorator.get('expression');
    const isCall = isCallExpression(expression);

    let memberOrIdentifier: NodePath<MemberExpression> | NodePath<Identifier>;
    let args: readonly NodePath[];

    if (isCall) {
      args = expression.get('arguments') as readonly NodePath[];
      memberOrIdentifier = expression.get('callee') as
        | NodePath<MemberExpression>
        | NodePath<Identifier>;
    } else {
      args = [];
      memberOrIdentifier = expression as
        | NodePath<MemberExpression>
        | NodePath<Identifier>;
    }

    super(memberOrIdentifier);

    this.#isCall = isCall;
    this.#args = args;
    this.#decorator = decorator;
  }

  public get args(): readonly NodePath[] {
    return this.#args;
  }

  public get isCall(): boolean {
    return this.#isCall;
  }

  public remove(): void {
    this.#decorator.remove();
  }
}
