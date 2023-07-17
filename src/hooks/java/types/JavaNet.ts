export interface JavaNetURL {
  toString: Java.MethodDispatcher;
}

export interface JavaNetHttpUrlConnection {
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
