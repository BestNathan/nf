export interface IJavaNetURL {
  toString: Java.MethodDispatcher;
}

export class URLHooker {
  public static className = 'java.net.URL';
  public JavaNetURLWrapper = Java.use<IJavaNetURL>(URLHooker.className);

  public hook() {
    this.hookCtor();
  }

  private hookCtor() {
    this.JavaNetURLWrapper.$init.overload('java.lang.String').implementation = function (spec: string) {
      console.log(`[ ${URLHooker.className} ][ .$init(java.lang.String) ] Spec: ${spec}`);
      return this.$init(...arguments);
    };
  }
}
