import {IHooker} from '../../../hook/hooker';

export class InitHooker implements IHooker {
  hook(): void {
    if (!Java.available) {
      return;
    }

    Java.enumerateClassLoadersSync().forEach((w) => {
      console.log(
        `[ init ][ ClassLoader ] ClassName:${w.$className} SuperClassName: ${w.$super?.$className ?? 'None'}`,
      );
    });

    // Java.enumerateLoadedClassesSync().forEach((w) => {
    //   console.log(`[ init ][ Class ] ClassName:${w}`);
    // });
  }
}
