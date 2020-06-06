import {ASTCallableDecorator} from '@ast-decorators/utils/lib/common';
import {NodePath} from '@babel/traverse';
import {BooleanLiteral, ClassProperty, classProperty} from '@babel/types';

const foo: ASTCallableDecorator<
  [NodePath<BooleanLiteral>?],
  {},
  ClassProperty
> = (shouldReplace) => ({member}) => {
  if (!shouldReplace?.node.value) {
    return;
  }

  const {computed, decorators, key, static: _static, value} = member!.node;

  const replacement = classProperty(
    key,
    value,
    null,
    decorators?.slice(0, -1),
    computed,
    _static,
  );

  member!.replaceWith(replacement);
};

export default () => [[foo, name => name === 'foo']];
