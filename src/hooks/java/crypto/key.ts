export interface IJavaSecurityKey {
  getAlgorithm: Java.MethodDispatcher;
  getEncoded: Java.MethodDispatcher;
}

export class JavaSecurityKeyHooker {
  public static className = 'java.security.Key';
  public JavaSecurityKeyWrapper = Java.use<IJavaSecurityKey>(JavaSecurityKeyHooker.className);
}
