import {Buffer} from 'buffer';
import {randomHexStr} from '../../../utils/random.js';

export interface IOkHttpChain {
  request: Java.MethodDispatcher;
  proceed: Java.MethodDispatcher;
}

export interface IOkHttpRequest {
  url: Java.MethodDispatcher;
  method: Java.MethodDispatcher;
  headers: Java.MethodDispatcher;
  body: Java.MethodDispatcher;
}

export interface IOkHttpResponse {
  request: Java.MethodDispatcher;
  protocol: Java.MethodDispatcher;
  message: Java.MethodDispatcher;
  code: Java.MethodDispatcher;
  headers: Java.MethodDispatcher;
  body: Java.MethodDispatcher;
}

export interface IOkHttpRequestBody {
  writeTo: Java.MethodDispatcher;
  contentLength: Java.MethodDispatcher;
  contentType: Java.MethodDispatcher;
}

export interface IOkHttpResponseBody {
  contentLength: Java.MethodDispatcher;
  contentType: Java.MethodDispatcher;
  source: Java.MethodDispatcher;
  bytes: Java.MethodDispatcher;
}

export interface IOkHttpClientBuilder {
  build: Java.MethodDispatcher;
}

export class OkHttpHooker {
  public ByteStringWrapper = Java.use('okio.ByteString');
  public BufferWrapper = Java.use('okio.Buffer');
  public InterceptorWrapper = Java.use('okhttp3.Interceptor');

  public LoggingInterceptorWrapper!: Java.Wrapper<any>;

  constructor() {
    this.registerLoggingInterceptor();
  }

  private registerLoggingInterceptor() {
    const hooker = this;

    this.LoggingInterceptorWrapper = Java.registerClass({
      name: 'com.nf.okhttp.interceptors.LoggingInterceptor',
      implements: [this.InterceptorWrapper],
      methods: {
        intercept: function (chain: Java.Wrapper<IOkHttpChain>) {
          const prefix = `[ ${randomHexStr(16)} ][ okhttp ]`;

          const requestWrapper: Java.Wrapper<IOkHttpRequest> = chain.request();
          try {
            console.log(`${prefix}[ Request ] Url: ${requestWrapper.url()}`);
            console.log(`${prefix}[ Request ] Method: ${requestWrapper.method()}`);

            const headerStr: string = requestWrapper.headers().toString();
            const headers = headerStr.split('\n');
            for (const header of headers) {
              header.length && console.log(`${prefix}[ Request ] Header: ${header}`);
            }

            const requestBodyWrapper: Java.Wrapper<IOkHttpRequestBody> = requestWrapper.body();

            if (requestBodyWrapper && requestBodyWrapper.contentLength() > 0) {
              console.log(`${prefix}[ Request ] Body-Content-Type: ${requestBodyWrapper.contentType()}`);
              console.log(`${prefix}[ Request ] Body-Content-Length: ${requestBodyWrapper.contentLength()}`);

              const bodyBuf = hooker.BufferWrapper.$new();
              requestBodyWrapper.writeTo(bodyBuf);
              const bs = Buffer.from(bodyBuf.readByteArray());

              console.log(`${prefix}[ Request ] Body(UTF-8): ${bs.toString('utf-8')}`);
              console.log(`${prefix}[ Request ] Body(Hex): ${bs.toString('hex')}`);
            }
          } catch (error) {
            console.log((error as Error).stack);
            // console.log(`${prefix} [ Request ] Hook Error: `, error);
          }

          const responseWrapper: Java.Wrapper<IOkHttpResponse> = chain.proceed(requestWrapper);

          try {
            console.log(`${prefix}[ Response ] Code: ${responseWrapper.code()}`);

            const headerStr: string = responseWrapper.headers().toString();
            const headers = headerStr.split('\n');
            for (const header of headers) {
              header.length && console.log(`${prefix}[ Response ] Header: ${header}`);
            }

            const responseBodyWrapper: Java.Wrapper<IOkHttpResponseBody> = responseWrapper.body();

            if (responseBodyWrapper && responseBodyWrapper.contentType()) {
              const contentType = responseBodyWrapper.contentType().toString() as string;
              console.log(`${prefix}[ Response ] Body-Content-Type: ${contentType}`);
              console.log(`${prefix}[ Response ] Body-Content-Length: ${responseBodyWrapper.contentLength()}`);

              if (!contentType.includes('html')) {
                responseBodyWrapper.source().request(Java.use('java.lang.Long').MAX_VALUE.value);

                const cloneBuf = responseBodyWrapper.source().buffer().clone();
                const bs = Buffer.from(Java.cast(cloneBuf, hooker.BufferWrapper).readByteArray());

                try {
                  if (contentType.includes('json')) {
                    console.log(
                      `${prefix}[ Response ] Body(UTF-8): ${JSON.stringify(JSON.parse(bs.toString('utf-8')))}`,
                    );
                  } else {
                    console.log(`${prefix}[ Response ] Body(UTF-8): ${bs.toString('utf-8')}`);
                  }
                } catch (error) {
                  console.log(`${prefix}[ Response ] Body(Base64): ${bs.toString('base64')}`);
                  console.log(`${prefix}[ Response ] Body(Hex): ${bs.toString('hex')}`);
                }
              }
            } else {
              console.log(`${prefix}[ Response ] No Response Body`);
            }
          } catch (error) {
            console.log((error as Error).stack);
            console.log(`${prefix} [ Response ] Hook Error: `, error);
          }

          return responseWrapper;
        },
      },
    });
  }

  hook() {
    const hooker = this;
    Java.use<IOkHttpClientBuilder>('okhttp3.OkHttpClient$Builder').build.implementation = function () {
      this.interceptors().add(hooker.LoggingInterceptorWrapper.$new());
      return this.build();
    };
  }
}
