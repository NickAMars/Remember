import React from 'react';
import {  mount, configure } from 'enzyme';
import  {Card}  from './Card';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter(), disableLifecycleMethods: true });

const cardToken= {title: 'KFC', description: 'The Chicken is so good'};
describe('Card', ()=>{
  const card = mount(<Card {...cardToken}/>);
  test('Card render correctly', () =>expect(card).toMatchSnapshot());
  test('render card element',()=>expect(card.find('.container-card').exists()).toBe(true));
  test('render front title',()=>expect(card.find('.card__side--front').text()).toEqual(cardToken.title));
  // test('render back title',()=>expect(card.find('.card__title--border').text()).toEqual(cardToken.title));
  test('render back description',()=>expect(card.find('.card__description').text()).toEqual(cardToken.description));
});
// test('console.debug method',()=>{
//   console.log(card.debug());
// });
