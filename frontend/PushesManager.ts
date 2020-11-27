import Mold from './Mold';
import {PushMessage} from '../interfaces/PushMessage';


export type PushIncomeMessage = string | PushMessage | PushMessage[]



//   // If set and action doesn't set it means find items with specified id in
//   // all the requests all the actions of this set. And do new requests on of those
//   // which contain specified item id.
//   // If action and itemId are set it means find only at specified action.
//   id?: number | string;


export default class PushesManager {
  private readonly mold: Mold;


  constructor(mold: Mold) {
    this.mold = mold;
  }

  destroy() {
  }


  incomePush(backend: string, message: PushIncomeMessage) {
    console.log(5555555555, backend, message);

    // const validMessages: PushMessage[] = this.parseMessage(message);
    //
    // for (let item of validMessages) {
    //   this.handleMessage(item);
    // }
  }


  private handleMessage(message: PushMessage) {
    // TODO: если указан action - то его полностью перезапрашиваем, все его реквесты
    // TODO: если не указан action, а указан itemId
    //       - то ищем в хранилище этого set во всех action и request элементы с указанным itemId
    //       - если нашли то перезапрашиваем запрос request
  }

  private parseMessage(message: PushIncomeMessage): PushMessage[] {
    const result: PushMessage[] = [];

    if (typeof message === 'string') {
      let result: any;

      try {
        result = JSON.parse(message);
      }
      catch (e) {
        throw new Error(`Can't parse json push message: "${JSON.stringify(message)}". ${e}`);
      }

      this.parseMessage(result);
    }
    else if (Array.isArray(message)) {
      for (let item of message) {
        this.validateMessage(item);

        result.push(item);
      }
    }
    else if (typeof message === 'object') {
      this.validateMessage(message);

      result.push(message);
    }
    else {
      throw new Error(`Can't parse push message: "${JSON.stringify(message)}"`)
    }

    return result;
  }

  private validateMessage(message: PushMessage) {
    // TODO: check it and rise an error
    // TODO: set обязателен
  }

}
