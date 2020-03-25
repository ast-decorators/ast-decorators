export type ObserveDecorator = (
  observer: (value: any) => void,
) => PropertyDecorator;

export const observe: ObserveDecorator = () => () => void 0;
