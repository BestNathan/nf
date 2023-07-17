import {Buffer} from 'buffer';
import {TracingContext} from '../../../context/tracing-context.js';
import {IvParameterSpecHooker} from './iv-parameter-spec.js';
import {OpMode} from './constant.js';
import {JavaSecurityKeyHooker} from './key.js';
import {IHooker} from '../../../hook/hooker.js';
import {IJavaCryptoSecretKeySpec} from './secret-key-spec.js';

export interface JavaCryptoCipher {
  getInstance: Java.MethodDispatcher;
  doFinal: Java.MethodDispatcher;
  init: Java.MethodDispatcher;
}

export interface JavaCryptoAlgorithmParameterSpec {}

export class CipherHooker implements IHooker {
  private tracingContext: TracingContext = new TracingContext();

  public static className = 'javax.crypto.Cipher';
  public JavaxCryptoCipherWrapper = Java.use<JavaCryptoCipher>(CipherHooker.className);

  hook() {
    this.hookStatic();
    this.hookPublic();
  }

  private hookStatic() {
    this.hookGetInstance();
  }

  private hookPublic() {
    this.hookInit();
    this.hookDoFinal();
  }

  private hookGetInstance() {
    const hooker = this;

    this.JavaxCryptoCipherWrapper.getInstance.overload('java.lang.String').implementation = function getInstanceImpl(
      spec: string,
    ) {
      const instance = this.getInstance(spec);
      const method = `.getInstance(java.lang.String)`;
      const prefix = `[ ${hooker.tracingContext.get(instance)} ][ ${this.$className} ][ ${method} ]`;
      console.log(`${prefix} Spec: ${spec}`);
      return instance;
    };
  }

  private hookInit() {
    const hooker = this;

    this.JavaxCryptoCipherWrapper.init.overload(
      'int',
      'java.security.Key',
      'java.security.spec.AlgorithmParameterSpec',
    ).implementation = function (
      opmode: number,
      key: Java.Wrapper<IJavaCryptoSecretKeySpec>,
      param: Java.Wrapper<JavaCryptoAlgorithmParameterSpec>,
    ) {
      const method = `.init(int, java.security.Key, java.security.spec.AlgorithmParameterSpec)`;
      const prefix = `[ ${hooker.tracingContext.get(this)} ][ ${this.$className} ][ ${method} ]`;

      const sk = Java.cast(key, new JavaSecurityKeyHooker().JavaSecurityKeyWrapper);
      const iv = Java.cast(param, new IvParameterSpecHooker().JavaxCryptoIvParameterSpecWrapper);
      console.log(`${prefix} OpMode: ${opmode}(${OpMode[opmode] ?? 'UnKnown'})`);
      console.log(`${prefix} KeyAlg: ${sk.getAlgorithm()}`);
      console.log(`${prefix} Key(UTF8): ${Buffer.from(sk.getEncoded()).toString('utf-8')}`);
      console.log(`${prefix} Key(Hex): ${Buffer.from(sk.getEncoded()).toString('hex')}`);
      console.log(`${prefix} Key(Base64): ${Buffer.from(sk.getEncoded()).toString('base64')}`);
      console.log(`${prefix} Iv(Hex): ${Buffer.from(iv.getIV()).toString('hex')}`);

      return this.init(...arguments);
    };

    this.JavaxCryptoCipherWrapper.init.overload('int', 'java.security.Key').implementation = function (
      opmode: number,
      key: Java.Wrapper<IJavaCryptoSecretKeySpec>,
    ) {
      const method = `.init(int, java.security.Key)`;
      const prefix = `[ ${hooker.tracingContext.get(this)} ][ ${this.$className} ][ ${method} ]`;

      const sk = Java.cast(key, new JavaSecurityKeyHooker().JavaSecurityKeyWrapper);
      console.log(`${prefix} OpMode: ${opmode}(${OpMode[opmode] ?? 'UnKnown'})`);
      console.log(`${prefix} KeyAlg: ${sk.getAlgorithm()}`);
      console.log(`${prefix} Key(UTF8): ${Buffer.from(sk.getEncoded()).toString('utf-8')}`);
      console.log(`${prefix} Key(Hex): ${Buffer.from(sk.getEncoded()).toString('hex')}`);
      console.log(`${prefix} Key(Base64): ${Buffer.from(sk.getEncoded()).toString('base64')}`);

      return this.init(...arguments);
    };
  }

  private hookDoFinal() {
    const hooker = this;

    this.JavaxCryptoCipherWrapper.doFinal.overload('[B').implementation = function (data: ArrayBuffer) {
      const prefix = `[ ${hooker.tracingContext.get(this)} ][ ${this.$className} ][ .doFinal([B) ]`;

      console.log(`${prefix} Data(UTF8): ${Buffer.from(data).toString('utf-8')}`);
      console.log(`${prefix} Data(HEX): ${Buffer.from(data).toString('hex')}`);

      const final = this.doFinal(data);

      console.log(`${prefix} Res(HEX): ${Buffer.from(final).toString('hex')}`);
      console.log(`${prefix} Res(Base64): ${Buffer.from(final).toString('base64')}`);

      hooker.tracingContext.delete(this);
      return final;
    };

    this.JavaxCryptoCipherWrapper.doFinal.overload().implementation = function () {
      const prefix = `[ ${hooker.tracingContext.get(this)} ][ ${this.$className} ][ .doFinal() ]`;
      const final = this.doFinal();

      console.log(`${prefix} Res(HEX): ${Buffer.from(final).toString('hex')}`);
      console.log(`${prefix} Res(Base64): ${Buffer.from(final).toString('base64')}`);

      hooker.tracingContext.delete(this);
      return final;
    };
  }
}
