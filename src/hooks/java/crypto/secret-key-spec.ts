import {Buffer} from 'buffer';

export interface IJavaCryptoSecretKeySpec {
  getAlgorithm: Java.MethodDispatcher;
  getEncoded: Java.MethodDispatcher;
}

export class SecretKeySpecHooker {
  public static className = 'javax.crypto.spec.SecretKeySpec';
  public JavaxCryptoSecretKeySpceWrapper = Java.use<IJavaCryptoSecretKeySpec>(SecretKeySpecHooker.className);

  hook() {
    const hooker = this;

    this.JavaxCryptoSecretKeySpceWrapper.$init.overload('[B', 'java.lang.String').implementation = function (
      key: ArrayBuffer,
      spec: string,
    ) {
      const prefix = `[ ${SecretKeySpecHooker.className} ] [ $init([B, java.lang.String) ]`;
      console.log(`${prefix} Spec:${spec}`);
      console.log(`${prefix} Key(UTF8):${Buffer.from(key).toString('utf-8')}`);
      console.log(`${prefix} Key(Hex):${Buffer.from(key).toString('hex')}`);
      return this.$init(key, spec);
    };
  }
}
