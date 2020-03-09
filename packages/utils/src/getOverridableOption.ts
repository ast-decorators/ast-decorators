import {ASTDecoratorPluginOptions} from '@ast-decorators/typings';

const getOverridableOption = <
  T extends keyof Omit<ASTDecoratorPluginOptions, 'override'>
>(
  options: ASTDecoratorPluginOptions | undefined,
  optionName: T,
  pluginName: string,
  defaultValue?: ASTDecoratorPluginOptions[T],
): ASTDecoratorPluginOptions[T] | undefined =>
  options?.override?.[pluginName]?.[optionName] ??
  options?.[optionName] ??
  defaultValue;

export default getOverridableOption;
