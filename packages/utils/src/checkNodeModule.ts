const checkNodeModule = (path: string): boolean =>
  !path.startsWith('./') && !path.startsWith('../') && !path.startsWith('/');

export default checkNodeModule;
