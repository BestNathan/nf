import {Buffer} from 'buffer';
import {IAndroidOkHttpRequest, IAndroidOkHttpResponse, IAndroidOkHttpResponseBody} from './android-okhttp.js';
import {TracingContext} from '../../../context/tracing-context.js';

export interface IJavaNetHttpUrlConnection {
  getURL: Java.MethodDispatcher;
  getRequestMethod: Java.MethodDispatcher;
  setRequestMethod: Java.MethodDispatcher;
  connect: Java.MethodDispatcher;
  disconnect: Java.MethodDispatcher;
  getResponseCode: Java.MethodDispatcher;
  getContentType: Java.MethodDispatcher;
  getInputStream: Java.MethodDispatcher;
  getOutputStream: Java.MethodDispatcher;
  toString: Java.MethodDispatcher;
}

export interface IAndroidOkHttpHttpEngine {
  getResponse: Java.MethodDispatcher;
  getRequest: Java.MethodDispatcher;
  unzip: Java.MethodDispatcher;
}

export class AndroidUrlConnectionHooker {
  public AndroidHttpURLConnectionImplWrapper = Java.use<IJavaNetHttpUrlConnection>(
    'com.android.okhttp.internal.huc.HttpURLConnectionImpl',
  );

  public AndroidHttpsURLConnectionImplWrapper = Java.use<IJavaNetHttpUrlConnection>(
    'com.android.okhttp.internal.huc.HttpsURLConnectionImpl',
  );

  public AndroidDelegatingHttpsURLconnectionWrapper = Java.use(
    'com.android.okhttp.internal.huc.DelegatingHttpsURLConnection',
  );

  public AndroidOkHttpHttpEngineWrapper = Java.use<IAndroidOkHttpHttpEngine>(
    'com.android.okhttp.internal.http.HttpEngine',
  );

  public BufferWrapper = Java.use('com.android.okhttp.okio.Buffer');

  private tracingContext = new TracingContext();

  private _tryGetEngine(that: any) {
    try {
      const httpImpl = this._castHttpsImpl2HttpImpl(that);
      return httpImpl.httpEngine.value;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  private _castHttpsImpl2HttpImpl(that: any) {
    return Java.cast(that.$super.delegate.value, this.AndroidHttpURLConnectionImplWrapper);
  }

  hook() {
    const hooker = this;

    this.AndroidOkHttpHttpEngineWrapper.$init.overload(
      'com.android.okhttp.OkHttpClient',
      'com.android.okhttp.Request',
      'boolean',
      'boolean',
      'boolean',
      'com.android.okhttp.internal.http.StreamAllocation',
      'com.android.okhttp.internal.http.RetryableSink',
      'com.android.okhttp.Response',
    ).implementation = function (c, req, b1, b2, b3, sa, sink, res) {
      const reqBuilder = req.newBuilder();
      reqBuilder.header('Accept-Encoding', 'identity');
      req = reqBuilder.build();
      return this.$init(c, req, b1, b2, b3, sa, sink, res);
    };

    for (const wrapper of [this.AndroidHttpsURLConnectionImplWrapper] as Java.Wrapper<IJavaNetHttpUrlConnection>[]) {
      wrapper.getInputStream.overload().implementation = function () {
        const engine = hooker._tryGetEngine(this);
        if (!engine) {
          return this.getInputStream();
        }

        const prefix = `[ ${hooker.tracingContext.get(engine)} ][ AndroidOkHttp ]`;

        const requestWrapper: Java.Wrapper<IAndroidOkHttpRequest> = engine.getRequest();
        if (requestWrapper) {
          console.log(`${prefix}[ Request ] Url: ${requestWrapper.url()}`);
          console.log(`${prefix}[ Request ] Method: ${requestWrapper.method()}`);

          const headerStr: string = requestWrapper.headers().toString();
          const headers = headerStr.split('\n');
          for (const header of headers) {
            header.length && console.log(`${prefix}[ Request ] Header: ${header}`);
          }
        } else {
          console.log(`${prefix}[ Request ] No Request`);
        }

        const responseWrapper: Java.Wrapper<IAndroidOkHttpResponse> = engine.unzip(engine.getResponse());
        if (responseWrapper) {
          console.log(`${prefix}[ Response ] Code: ${responseWrapper.code()}`);

          const headerStr: string = responseWrapper.headers().toString();
          const headers = headerStr.split('\n');
          for (const header of headers) {
            header.length && console.log(`${prefix}[ Response ] Header: ${header}`);
          }

          const responseBodyWrapper: Java.Wrapper<IAndroidOkHttpResponseBody> = responseWrapper.body();

          if (responseBodyWrapper) {
            const contentType = responseBodyWrapper.contentType().toString() as string;
            console.log(`${prefix}[ Response ] Body-Content-Type: ${contentType}`);
            console.log(`${prefix}[ Response ] Body-Content-Length: ${responseBodyWrapper.contentLength()}`);

            if (!contentType.includes('html')) {
              responseBodyWrapper.source().request(Java.use('java.lang.Long').MAX_VALUE.value);

              const cloneBuf = responseBodyWrapper.source().buffer().clone();
              const bs = Java.cast(cloneBuf, hooker.BufferWrapper).readByteArray();

              let buf = Buffer.from(bs);

              try {
                if (contentType.includes('json')) {
                  console.log(
                    `${prefix}[ Response ] Body(UTF-8): ${JSON.stringify(JSON.parse(buf.toString('utf-8')))}`,
                  );
                } else {
                  console.log(`${prefix}[ Response ] Body(UTF-8): ${buf.toString('utf-8')}`);
                }
              } catch (error) {
                console.log(`${prefix}[ Response ] Body(Base64): ${buf.toString('base64')}`);
                console.log(`${prefix}[ Response ] Body(Hex): ${buf.toString('hex')}`);
              }
            }
          } else {
            console.log(`${prefix}[ Response ] No Response Body`);
          }
        }

        return this.getInputStream();
      };

      wrapper.getOutputStream.overload().implementation = function () {
        const op = this.getOutputStream();

        const engine = hooker._tryGetEngine(this);
        if (!engine) {
          return op;
        }

        const prefix = `[ ${hooker.tracingContext.get(engine)} ][ AndroidOkHttp ]`;

        let buf = Buffer.alloc(0);

        op.write.overload('[B', 'int', 'int').implementation = function (b: any, offset: any, length: any) {
          buf = Buffer.concat([buf, Buffer.from(b, offset, length)]);
          return this.write(b, offset, length);
        };

        op.write.overload('[B').implementation = function (b: any) {
          buf = Buffer.concat([buf, Buffer.from(b)]);
          return this.write(b);
        };

        op.flush.overload().implementation = function () {
          if (buf && buf.length > 0) {
            console.log(`${prefix}[ Request ] Byte(UTF-8): ${buf.toString('utf-8')}`);
            console.log(`${prefix}[ Request ] Byte(Hex): ${buf.toString('hex')}`);
            console.log(`${prefix}[ Request ] Byte(Base64): ${buf.toString('base64')}`);

            buf = Buffer.alloc(0);
          }

          return this.flush();
        };

        return op;
      };
    }
  }
}
