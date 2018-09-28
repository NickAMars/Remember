// import React, { Component } from 'react';
// // import GoogleMapReact from 'google-map-react';
// import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
// // const AnyReactComponent = ({ text }) => <div>{text}</div>;
//
// class SimpleMap extends Component {
//
//     state = {
//       showingInfoWindow: false,
//       activeMarker: {},
//       selectedPlace: {},
//     };
//
//   static defaultProps = {
//     center: {
//       lat: 36.0678, // n
//       lng: -94.1737 // w
//     },
//     zoom: 15
//   };
//   onMarkerClick = (props, marker, e) =>
//     this.setState({
//       selectedPlace: props,
//       activeMarker: marker,
//       showingInfoWindow: true
//     });
//     onMapClicked = (props) => {
//   if (this.state.showingInfoWindow) {
//     this.setState({
//       showingInfoWindow: false,
//       activeMarker: null
//     })
//   }
// };
//   render() {
//     return (<Map google={this.props.google}
//        style={{ height: '100vh', width: '100%' }}
//       initialCenter={this.props.center}
//       zoom={16}
//       >
//       <Marker
//          title={'The marker`s title will appear as a tooltip.'}
//          onClick={this.onMarkerClick}
//          name={'UofA'}
//          position={{lat: 36.0678, lng: -94.1737}} />
//          <InfoWindow
//             marker={this.state.activeMarker}
//             visible={this.state.showingInfoWindow}>
//               <div>
//                 <h1>{this.state.selectedPlace.name}</h1>
//               </div>
//           </InfoWindow>
//
//     </Map>
//   );
//
//   }
// }
//
// // export default SimpleMap;
// export default GoogleApiWrapper({
//   apiKey: process.env.REACT_APP_GOOGLE_MAP_KEY
// })(SimpleMap)


// <InfoWindow onClose={this.onInfoWindowClose}>
//   <div>
//     <h1>{this.state.selectedPlace.name}</h1>
//   </div>
// </InfoWindow>

//   return (
//     // Important! Always set the container height explicitly
//     <div style={{ height: '100vh', width: '100%' }}>
//       <GoogleMapReact
//         bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAP_KEY }}
//         defaultCenter={this.props.center}
//         defaultZoom={this.props.zoom}>
//         {/*<AnyReactComponent
//           lat={36.0678}
//           lng={-94.1737}
//           // text={'University of Arkansas'}
//         />*/}
//       </GoogleMapReact>
//     </div>
//   );
