import React from 'react';
import {  shallow, configure } from 'enzyme';
import {Form,validate }  from './Form';
import {INPUT, TEXT_AREA} from '../../data/constance';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter(), disableLifecycleMethods: true });
// const INPUT = 'Stay Positive';
// const TEXT_AREA = 'Can Find The Thing that drives you crazy in this world and then you will be happy';

describe('Form', ()=>{
  // const addCard = jest.fn();
  const props = {addCard:jest.fn()};
  const FORM = shallow(<Form  {...props}/>);
  test('Form render correctly', () => expect(FORM).toMatchSnapshot());
  test('render input field',()=>expect(FORM.find('input').exists()).toBe(true));
  test('render textarea field', () => expect(FORM.find('textarea').exists()).toBe(true));
  test('render button element', () => expect(FORM.find('button').exists()).toBe(true));
  test('validate function on initialstate', () => expect(validate(FORM.state())).toBe(false));
  describe('When the text fields are updated', ()=>{
    beforeEach(() => {
      FORM.find('input').simulate('change', {target:{ value: INPUT }});
      FORM.find('textarea').simulate('change', {target:{ value: TEXT_AREA }});
    });
    test('update the text in input field', ()=> expect(FORM.state().title).toEqual(INPUT) );
    test('update the text in textarea field', ()=> expect(FORM.state().description).toEqual(TEXT_AREA));
    describe('When the button has been click', ()=>{
      beforeEach(()=>{FORM.find('button').simulate('click');});
      test('Add Card function was called', ()=>expect(props.addCard).toHaveBeenCalled());
      test('clear title from state', ()=>expect(FORM.state().title).toEqual(""));
      test('clear description from state', ()=> expect(FORM.state().description).toEqual(""));
    });
  });
});
