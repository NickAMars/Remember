import React from 'react';
import {  shallow, configure } from 'enzyme';
import {Form}  from './Form';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter(), disableLifecycleMethods: true });

describe('Form', ()=>{
  const form = shallow(<Form/>);
  test('Form render correctly', () => expect(form).toMatchSnapshot());
  test('redner input field', ()=>{
    console.log(form.debug());
  })
});
