export interface IHooker {
  hook(): void;
}

export interface HookerCtor {
  new (): IHooker;
}
