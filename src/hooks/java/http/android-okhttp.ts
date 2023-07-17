import {Buffer} from 'buffer';
import {randomHexStr} from '../../../utils/random.js';

export interface IAndroidOkHttpChain {
  request: Java.MethodDispatcher;
  proceed: Java.MethodDispatcher;
}

export interface IAndroidOkHttpRequest {
  url: Java.MethodDispatcher;
  method: Java.MethodDispatcher;
  headers: Java.MethodDispatcher;
  body: Java.MethodDispatcher;
}

export interface IAndroidOkHttpResponse {
  request: Java.MethodDispatcher;
  protocol: Java.MethodDispatcher;
  message: Java.MethodDispatcher;
  code: Java.MethodDispatcher;
  headers: Java.MethodDispatcher;
  body: Java.MethodDispatcher;
}

export interface IAndroidOkHttpRequestBody {
  writeTo: Java.MethodDispatcher;
  contentLength: Java.MethodDispatcher;
  contentType: Java.MethodDispatcher;
}

export interface IAndroidOkHttpResponseBody {
  contentLength: Java.MethodDispatcher;
  contentType: Java.MethodDispatcher;
  source: Java.MethodDispatcher;
  bytes: Java.MethodDispatcher;
}

export interface IAndroidOkOkHttpClient {
  interceptors: Java.MethodDispatcher;
  networkInterceptors: Java.MethodDispatcher;
}

export interface IAndroidOkOkHttpEngine {
  interceptors: Java.MethodDispatcher;
  networkInterceptors: Java.MethodDispatcher;
}

export class AndroidOkHttpHooker {
  public ByteStringWrapper = Java.use('okio.ByteString');
  public BufferWrapper = Java.use('okio.Buffer');
  public InterceptorWrapper = Java.use('com.android.okhttp.Interceptor');

  public LoggingInterceptorWrapper!: Java.Wrapper<any>;

  constructor() {
    this.registerLoggingInterceptor();
  }

  private registerLoggingInterceptor() {
    const hooker = this;

    this.LoggingInterceptorWrapper = Java.registerClass({
      name: 'com.nf.okhttp.android.interceptors.LoggingInterceptor',
      implements: [this.InterceptorWrapper],
      methods: {
        intercept: function (chain: Java.Wrapper<IAndroidOkHttpChain>) {
          const prefix = `[ ${randomHexStr(16)} ][ okhttp ]`;

          const requestWrapper: Java.Wrapper<IAndroidOkHttpRequest> = chain.request();
          try {
            console.log(`${prefix} [ Request ] Url: ${requestWrapper.url()}`);
            console.log(`${prefix} [ Request ] Method: ${requestWrapper.method()}`);

            const headerStr: string = requestWrapper.headers().toString();
            const headers = headerStr.split('\n');
            for (const header of headers) {
              header.length && console.log(`${prefix} [ Request ] Header: ${header}`);
            }

            const requestBodyWrapper: Java.Wrapper<IAndroidOkHttpRequestBody> = requestWrapper.body();

            if (requestBodyWrapper && requestBodyWrapper.contentLength() > 0) {
              console.log(`${prefix} [ Request ] Body-Content-Type: ${requestBodyWrapper.contentType()}`);
              console.log(`${prefix} [ Request ] Body-Content-Length: ${requestBodyWrapper.contentLength()}`);

              const bodyBuf = hooker.BufferWrapper.$new();
              requestBodyWrapper.writeTo(bodyBuf);
              const bs = bodyBuf.readByteArray();

              console.log(`${prefix} [ Request ] Body(UTF-8): ${Buffer.from(bs).toString('utf-8')}`);
              console.log(`${prefix} [ Request ] Body(Hex): ${Buffer.from(bs).toString('hex')}`);
            }
          } catch (error) {
            console.log((error as Error).stack);
            // console.log(`${prefix} [ Request ] Hook Error: `, error);
          }

          const responseWrapper: Java.Wrapper<IAndroidOkHttpResponse> = chain.proceed(requestWrapper);

          try {
            console.log(`${prefix} [ Response ] Code: ${responseWrapper.code()}`);

            const headerStr: string = responseWrapper.headers().toString();
            const headers = headerStr.split('\n');
            for (const header of headers) {
              header.length && console.log(`${prefix} [ Response ] Header: ${header}`);
            }

            const responseBodyWrapper: Java.Wrapper<IAndroidOkHttpResponseBody> = responseWrapper.body();

            if (responseBodyWrapper) {
              const contentType = responseBodyWrapper.contentType().toString() as string;
              console.log(`${prefix} [ Response ] Body-Content-Type: ${contentType}`);
              console.log(`${prefix} [ Response ] Body-Content-Length: ${responseBodyWrapper.contentLength()}`);

              if (!contentType.includes('html')) {
                responseBodyWrapper.source().request(Java.use('java.lang.Long').MAX_VALUE.value);

                const cloneBuf = responseBodyWrapper.source().buffer().clone();
                const bs = Java.cast(cloneBuf, hooker.BufferWrapper).readByteArray();

                if (contentType.includes('json')) {
                  console.log(
                    `${prefix} [ Response ] Body(UTF-8): ${JSON.stringify(
                      JSON.parse(Buffer.from(bs).toString('utf-8')),
                    )}`,
                  );
                } else {
                  console.log(`${prefix} [ Response ] Body(UTF-8): ${Buffer.from(bs).toString('utf-8')}`);
                }

                // console.log(`${prefix} [ Response ] Body(Hex): ${Buffer.from(bs).toString('hex')}`);
              }
            } else {
              console.log(`${prefix} [ Response ] No Response Body`);
            }
          } catch (error) {
            console.log((error as Error).stack);
            // console.log(`${prefix} [ Response ] Hook Error: `, error);
          }

          return responseWrapper;
        },
      },
    });
  }

  hook() {
    const hooker = this;
    Java.use<IAndroidOkOkHttpClient>('com.android.okhttp.OkHttpClient').interceptors.overload().implementation =
      function () {
        console.log('interceptors hooked');
        return this.interceptors();
      };

    Java.use<IAndroidOkOkHttpClient>('com.android.okhttp.OkHttpClient').networkInterceptors.overload().implementation =
      function () {
        console.log('networkInterceptors hooked');
        return this.networkInterceptors();
      };
  }
}
