import * as actions from './index';
import {card} from '../data/constance.js'

const ADDCARD = {
  type: actions.ADD_CARD,
  payload: card
};



describe('actions', ()=>{
  test('create action to add card',()=>expect(actions.addCard(card)).toEqual(ADDCARD));
})
