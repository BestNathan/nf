const defaultTimeout = 60 * 1000;

export class InstanceContext<T> {
  private map: Map<string, T> = new Map();
  private timerMap: Map<string, NodeJS.Timer> = new Map();

  set(instance: any, value: T, timeout: number = defaultTimeout) {
    const key = instance.toString();

    if (this.timerMap.has(key)) {
      clearTimeout(this.timerMap.get(key));
    }

    this.map.set(key, value);

    const timer = setTimeout(() => {
      if (this.map.has(key) && this.map.get(key) == timer) {
        this.map.delete(key);
        this.timerMap.delete(key);
      }
    }, timeout);

    this.timerMap.set(key, timer);
  }

  get(instance: any): T | null {
    return this.map.get(instance.toString()) ?? null;
  }

  has(instance: any): boolean {
    return this.map.has(instance.toString());
  }

  delete(instance: any) {
    const key = instance.toString();
    this.map.delete(key);
    this.timerMap.delete(key);
  }
}
