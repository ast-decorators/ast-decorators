import minimatch from 'minimatch';
import {dirname, join, resolve} from 'path';
import checkNodeModule from './checkNodeModule';

const cwd = process.cwd();

export type DecoratorSuitabilityFactors = Readonly<{
  names?: ReadonlyArray<RegExp | string>;
  nodeModules?: ReadonlyArray<RegExp | string>;
  paths?: readonly string[];
}>;

export type DecoratorInfo = Readonly<{
  name?: string;
  source?: string;
}>;

const checkDecoratorSuitability = (
  {name, source}: DecoratorInfo,
  {names, nodeModules, paths}: DecoratorSuitabilityFactors,
  filename: string,
): boolean => {
  if (
    name &&
    names &&
    names.some(rule =>
      typeof rule === 'string' ? rule === name : rule.test(name),
    )
  ) {
    return true;
  }

  if (!source) {
    return false;
  }

  const isNodeModule = checkNodeModule(source);

  if (paths && !isNodeModule) {
    const fullPath = resolve(dirname(filename), source);

    if (paths.some(rule => minimatch(fullPath, join(cwd, rule)))) {
      return true;
    }
  }

  if (nodeModules && isNodeModule) {
    if (
      nodeModules.some(rule =>
        typeof rule === 'string'
          ? source.startsWith(rule) || minimatch(source, rule)
          : rule.test(source),
      )
    ) {
      return true;
    }
  }

  return false;
};

export default checkDecoratorSuitability;
