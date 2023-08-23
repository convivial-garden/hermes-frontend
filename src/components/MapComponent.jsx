import React, { Component } from 'react';
import {
  MapContainer, TileLayer, Marker, Circle, Polyline,
} from 'react-leaflet';

export default class MapComponent extends Component {
  render() {
    return (
      this.props.positions.length > 0
      && (
      <MapContainer center={this.props.position} zoom={this.props.viewport.zoom} style={{ height: this.props.height, width: this.props.width }}>
        <TileLayer
          url="https://{s}.wien.gv.at/basemap/geolandbasemap/normal/google3857/{z}/{y}/{x}.png"
          subdomains={['maps', 'maps1', 'maps2', 'maps3']}
          minZoom="1"
          maxZoom="18"
        />
        {this.props.positions.map((pos) => (
          <Marker position={pos} key={pos} />
        ))}
        <Circle center={this.props.viewport.center} radius={3000} fill={false} weight={2} color="#ff7677" />
        <Circle center={this.props.viewport.center} radius={5000} fill={false} weight={2} color="#ff474b" />
        <Circle center={this.props.viewport.center} radius={7000} fill={false} weight={2} color="#ff1d23" />
        <Circle center={this.props.viewport.center} radius={9000} fill={false} weight={2} color="#ff000b" />
        <Circle center={this.props.viewport.center} radius={11000} fill={false} weight={2} color="#ff000b" />
        <Circle center={this.props.viewport.center} radius={13000} fill={false} weight={2} color="#db0007" />
        <Circle center={this.props.viewport.center} radius={15000} fill={false} weight={2} color="#980006" />
        <Circle center={this.props.viewport.center} radius={17000} fill={false} weight={2} color="#5e0004" />
        <Polyline positions={this.props.positions} color="#67ff38" opacity={0.5} />
      </MapContainer>
      )
    );
  }
}
