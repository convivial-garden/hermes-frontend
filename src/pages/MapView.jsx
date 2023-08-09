import React, { Component } from 'react';
import {
  MapContainer, TileLayer, Marker, useMap,
} from 'react-leaflet';
import { Row, Col, Container } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import * as R from 'ramda';
import { getStreetNamesFast } from '../utils/transportFunctions';

const DEFAULT_VIEWPORT = {
  center: [48.216625, 16.385063],
  zoom: 17,
};

export default class MapView extends Component {
  state = {
    lat: 48.216625,
    lng: 16.385063,
    viewport: DEFAULT_VIEWPORT,
    street: {
      name: '',
      number: '',
      lat: 48.216625,
      lon: 16.385063,
    },
  };

  streetFilter(option, filter) {
    let hasSubstring = false;
    if (filter.includes(' ')) {
      const parts = filter.split(' ');
      parts.forEach((part) => {
        if (option.label.toLowerCase().includes(part.toLowerCase())) hasSubstring = true;
      });
    } else if (option.label.toLowerCase().includes(filter.toLowerCase())) hasSubstring = true;
    return hasSubstring;
  }

  selectStreetLoadOptions(input, callback) {
    setTimeout(() => {
      getStreetNamesFast(input)
        .then((resp) => {
          callback(resp.data);
        });
    }, 200);
  }

  handleStreetSelect(val) {
    this.setState((prevState) => R.mergeDeepRight(
      prevState,
      {
        street:
        {
          lat: val.data.lat,
          long: val.data.lon,
        },
        lat: val.data.lat,
        lng: val.data.lon,
        viewport: {
          center: [val.data.lat, val.data.lon],
          zoom: 17,
        },
      },
    ));
  }

  render() {
    const position = [this.state.lat, this.state.lng];
    return (
      <Container fluid>
        <Row>
          <Col xs={10}>
            <MapContainer
              center={this.state.viewport.center}
              zoom={17} // viewport={this.state.viewport}
              style={{ height: '800px' }}
            >
              <TileLayer
                url="https://{s}.wien.gv.at/basemap/geolandbasemap/normal/google3857/{z}/{y}/{x}.png"
                subdomains={['maps', 'maps1', 'maps2', 'maps3']}
                minZoom="1"
                maxZoom="18"
                // attribution="123"

              />
              <Marker position={position} />
            </MapContainer>
          </Col>
          <Col xs={2}>
            <AsyncSelect
              name="street_name"
              value={this.state.street.name}
              loadOptions={this.selectStreetLoadOptions}
              autoload={false}
              filterOption={this.streetFilter}
              onChange={(val) => {
                this.handleStreetSelect(val);
              }}
              ignoreCase={false}
              ignoreAccents={false}
              style={{ zIndex: 1000 }}
              cacheOptions
              defaultOptions
            />
          </Col>
        </Row>
      </Container>
    );
  }
}
