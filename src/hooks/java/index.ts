import {InitHooker} from './init/index.js';
import {HookerRegistry} from '../../hook/registry.js';
import {CipherHooker} from './crypto/cipher.js';
import {IvParameterSpecHooker} from './crypto/iv-parameter-spec.js';
import {SecretKeySpecHooker} from './crypto/secret-key-spec.js';
import {URLHooker} from './http/url.js';
import {AndroidUrlConnectionHooker} from './http/android-url-connection.js';
import {OkHttpHooker} from './http/okhttp.js';
import {AndroidOkHttpHooker} from './http/android-okhttp.js';

if (Java.available) {
  HookerRegistry.register('java.init', InitHooker);

  // crypto
  HookerRegistry.register('java.crypto.Cipher', CipherHooker);
  HookerRegistry.register('java.crypto.IvParameterSpec', IvParameterSpecHooker);
  HookerRegistry.register('java.crypto.SecretKeySpec', SecretKeySpecHooker);

  // http
  HookerRegistry.register('java.http.URL', URLHooker);
  // HookerRegistry.register('java.http.UrlConnection', AndroidUrlConnectionHooker);
  HookerRegistry.register('java.http.OkHttp', OkHttpHooker);
  // HookerRegistry.register('java.http.AndroidOkHttp', AndroidOkHttpHooker);
}
