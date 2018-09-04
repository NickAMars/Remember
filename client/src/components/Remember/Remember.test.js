import React from 'react';
import {shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import {Rememberprops as props} from '../../data/constance';
import {Remember, mapStateToProps} from './Remember';
configure({ adapter: new Adapter(), disableLifecycleMethods: true });

describe('Remember', ()=>{
  const remember = shallow(<Remember {...props}/>);
  test('Remember render correctly', () => expect(remember).toMatchSnapshot());
  test('render header title',()=>expect(remember.find('h1').text()).toEqual('Remember'));
  test('render Form Component',()=>expect(remember.find('Connect(Form)').exists()).toBe(true));
  test('should show array of cards added', ()=> expect(mapStateToProps(props)).toEqual({cards: props.cards}));
});
