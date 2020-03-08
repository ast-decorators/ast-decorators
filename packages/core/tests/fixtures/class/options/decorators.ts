import {DecorableClass} from '@ast-decorators/utils/lib/commonTypes';
import {ASTDecoratorPluginOptions} from '@ast-decorators/utils/src/commonTypes';
import {NodePath} from '@babel/traverse';
import {
  ClassBody,
  classPrivateProperty,
  classProperty,
  privateName,
  StringLiteral,
} from '@babel/types';

export type FooDecorator = (name: string, value: string) => ClassDecorator;

export const foo: FooDecorator = ((
  name: NodePath<StringLiteral>,
  value: NodePath<StringLiteral>,
) => (
  klass: NodePath<DecorableClass>,
  {privacy}: ASTDecoratorPluginOptions,
) => {
  const _name = name.node.value;

  switch (privacy) {
    case 'hard': {
      const classBody = klass.get('body') as NodePath<ClassBody>;
      const id = classBody.scope.generateUidIdentifier(_name);
      const storage = privateName(id);

      classBody.unshiftContainer('body', [
        classPrivateProperty(storage, value.node),
      ]);
      break;
    }
    default: {
      const classBody = klass.get('body') as NodePath<ClassBody>;
      const id = classBody.scope.generateUidIdentifier(_name);
      classBody.unshiftContainer('body', [classProperty(id, value.node)]);
      break;
    }
  }
}) as any;
