import {Buffer} from 'buffer';

export interface IJavaCryptoIvParameterSpec {
  getIV: Java.MethodDispatcher;
}

export class IvParameterSpecHooker {
  public static className = 'javax.crypto.spec.IvParameterSpec';
  public JavaxCryptoIvParameterSpecWrapper = Java.use<IJavaCryptoIvParameterSpec>(IvParameterSpecHooker.className);

  hook() {
    const hooker = this;

    this.JavaxCryptoIvParameterSpecWrapper.$init.overload('[B').implementation = function (iv: ArrayBuffer) {
      const prefix = `[ ${IvParameterSpecHooker.className} ] [ $init([B) ]`;
      console.log(`${prefix} Iv(Hex):${Buffer.from(iv).toString('hex')}`);
      return this.$init(iv);
    };
  }
}
