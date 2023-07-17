import {HookerCtor, IHooker} from './hook/hooker.js';
import {HookerRegistry} from './hook/registry.js';
import './hooks/index.js';

~(function () {
  const javaHooks: [string, HookerCtor][] = [];

  for (const [name, ctor] of HookerRegistry.getAll()) {
    if (name.toLowerCase().includes('java')) {
      javaHooks.push([name, ctor]);
    }
  }

  if (Java.available) {
    Java.perform(() => {
      for (const [name, ctor] of javaHooks) {
        console.log(`register hooker: ${name}`);
        try {
          new ctor().hook();
        } catch (error) {
          console.warn(`register hooker: ${name}, error: `, error);
        }
      }
    });
  }
})();
