import React, { Component } from 'react';
import {
  Container, Row, Col, FormGroup, FormControl, FormLabel, Button, Alert,
} from 'react-bootstrap';
import axios from 'axios';
import { deleteAddress } from '@/utils/transportFunctions.jsx';

// street = models.CharField(max_length=300, default='')
// number = models.CharField(max_length=10)
// stair = models.CharField(max_length=3)
// level = models.CharField(max_length=3)
// door = models.CharField(max_length=3)
// extra = models.CharField(max_length=300, blank=True)
// postal_code = models.CharField(max_length=4)

class AddressDetail extends Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.saveAddress = this.saveAddress.bind(this);
    this.deleteAddress = this.deleteAddress.bind(this);
  }

  state = {
    id: null,
    url: '',
    data: {
      street: '',
      number: '',
      stair: '',
      level: '',
      door: '',
      extra: '',
      postal_code: '',
    },
    saved: false,
    deleted: false,
  };

  componentDidMount() {
    const { url } = this.props;
    this.setState({ url });
    if (url !== '') {
      Api
        .get(url)
        .then((response) => {
          this.setState({ data: response.data });
        });
    }
  }

  handleChange(event, name) {
    this.setState({ data: { ...this.state.data, [name]: event.target.value } });
  }

  saveAddress() {
    this.setState({ saved: false });
    if (this.state.url !== '') {
      Api
        .put(this.state.url, this.state.data)
        .then((resp) => {
          this.setState({ saved: (resp.status === 200) });
        });
    } else {
      this.props.add(this.state.data, (resp) => {
        this.setState({ saved: (resp.status === 201) });
        this.props.close();
      });
    }
  }

  deleteAddress() {
    if (this.state.url !== '') {
      deleteAddress(this.state.url)
        .then((response) => {
          if (response.status === 204) this.setState({ url: '', deleted: true });
        });
    }
  }

  render() {
    const COL_WIDTH = 6;
    const {
      street, number, stair, level, door, postal_code,
    } = this.state.data;
    return (
      <Container className="AddressDetail">
        <FormGroup controlId="fourth" className="row">
          <Row>
            <Col xs={COL_WIDTH}>
              <FormLabel>Strasse</FormLabel>
              <Form.Control
                type="text"
                placeholder="Strassenname"
                name="street"
                value={street}
                onChange={(event) => this.handleChange(event, 'street')}
              />
            </Col>
            <Col xs={1}>
              <FormLabel>Hausnummer</FormLabel>
              <Form.Control
                type="text"
                placeholder="Hausnummer"
                name="number"
                value={number}
                onChange={(event) => this.handleChange(event, 'number')}
              />
            </Col>
            <Col xs={1}>
              <FormLabel>Stiege</FormLabel>
              <Form.Control
                type="text"
                placeholder="Stiege"
                name="stair"
                value={stair}
                onChange={(event) => this.handleChange(event, 'stair')}
              />
            </Col>
            <Col xs={1}>
              <FormLabel>Stock</FormLabel>
              <Form.Control
                type="text"
                placeholder="Stock"
                name="level"
                value={level}
                onChange={(event) => this.handleChange(event, 'level')}
              />
            </Col>
            <Col xs={1}>
              <FormLabel>Tuer</FormLabel>
              <Form.Control
                type="text"
                placeholder="Tuer"
                name="door"
                value={door}
                onChange={(event) => this.handleChange(event, 'door')}
              />
            </Col>
            <Col xs={1}>
              <FormLabel>Postleitzahl</FormLabel>
              <Form.Control
                type="text"
                placeholder="Postleitzahl"
                name="postal_code"
                value={postal_code}
                onChange={(event) => this.handleChange(event, 'postal_code')}
              />
            </Col>
          </Row>
        </FormGroup>

        <Row>
          <Col xs={3}>
            <Button onClick={this.saveAddress}>Addresse speichern</Button>
            {this.state.url === '' ? '' : <Button onClick={this.deleteAddress}>Addresse loeschen</Button>}
          </Col>
          <Col xs={3}>
            {this.state.saved ? <Alert variant="success">Addresse gespeichert!</Alert> : ''}
            {this.state.deleted ? <Alert variant="success">Addresse geloescht!</Alert> : ''}
          </Col>
        </Row>
      </Container>
    );
  }
}

export default AddressDetail;
/* <Alert bsStyle="danger">Fehler! Addresse konnte nicht gespeichert werden!</Alert>} */
/* <Alert bsStyle="danger">Fehler! Addresse konnte nicht geloescht werden!</Alert>} */
