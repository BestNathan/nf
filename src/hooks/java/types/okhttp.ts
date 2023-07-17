export interface OkHttpChain {
  request: Java.MethodDispatcher;
  proceed: Java.MethodDispatcher;
}

export interface OkHttpRequest {
  url: Java.MethodDispatcher;
  method: Java.MethodDispatcher;
  headers: Java.MethodDispatcher;
  body: Java.MethodDispatcher;
}

export interface OkHttpResponse {
  request: Java.MethodDispatcher;
  protocol: Java.MethodDispatcher;
  message: Java.MethodDispatcher;
  code: Java.MethodDispatcher;
  headers: Java.MethodDispatcher;
  body: Java.MethodDispatcher;
}

export interface OkHttpRequestBody {
  writeTo: Java.MethodDispatcher;
  contentLength: Java.MethodDispatcher;
  contentType: Java.MethodDispatcher;
}

export interface OkHttpResponseBody {
  contentLength: Java.MethodDispatcher;
  contentType: Java.MethodDispatcher;
  source: Java.MethodDispatcher;
  bytes: Java.MethodDispatcher;
}

export interface OkHttpClientBuilder {
  build: Java.MethodDispatcher;
}
