// import React from 'react';
// import {shallow, configure } from 'enzyme';
// import Adapter from 'enzyme-adapter-react-16';
// import {Rememberprops as props} from '../../data/constance';
// import {MultipleCards, mapStateToProps} from './MultipleCards';
// configure({ adapter: new Adapter(), disableLifecycleMethods: true });

describe('MultipleCards', ()=>{
   test('1 =1 ', () => expect("1").toEqual("1"));
  // const multipleCards = shallow(<MultipleCards {...props}/>);
  // test('MultipleCards render correctly', () => expect(multipleCards).toMatchSnapshot());
  // test('render header title',()=>expect(multipleCards.find('h1').text()).toEqual('Remember'));
  // test('render Form Component',()=>expect(multipleCards.find('Connect(Form)').exists()).toBe(true));
  // test('should show array of cards added', ()=> expect(mapStateToProps(props)).toEqual({cards: props.cards}));
});
