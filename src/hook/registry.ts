import {HookerCtor} from './hooker';

class Registry {
  private map: Map<string, HookerCtor> = new Map();

  register(name: string, ctor: HookerCtor) {
    if (this.map.has(name)) {
      return;
    }

    this.map.set(name, ctor);
  }

  get(name: string): HookerCtor | null {
    return this.map.get(name) ?? null;
  }

  has(name: string): boolean {
    return this.map.has(name);
  }

  getAll(): Map<string, HookerCtor> {
    return this.map;
  }
}

export const HookerRegistry = new Registry();
