import { Global, Module } from '@nestjs/common';
import { TypedEventEmitter } from 'src/services/event-emiiter/typed-event-emitter.class';

@Global()
@Module({
  providers: [TypedEventEmitter],
  exports: [TypedEventEmitter],
})
export class TypedEventEmitterModule {}
