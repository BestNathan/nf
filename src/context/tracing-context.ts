import {randomHexStr} from '../utils/random.js';
import {InstanceContext} from './instance-context.js';

export class TracingContext extends InstanceContext<string> {
  get(instance: any): string {
    if (this.has(instance)) {
      return super.get(instance)!;
    }

    const traceId = randomHexStr(16);
    this.set(instance, traceId);
    return traceId;
  }
}
