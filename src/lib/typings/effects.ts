import { Observable } from 'rxjs';
import { BotFormReducerState } from './reducer';

export type BotFormFulfillment<DTO = any, P = any> = (
  state: BotFormReducerState<DTO, P>
) => Observable<P>;
