import React, { Component } from 'react';
import {
  Container, Row, Col, Button, ButtonGroup,
  ToggleButtonGroup, ToggleButton, DropdownButton, Nav,
  ListGroup, ListGroupItem,
} from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker-cssmodules.css';
import Datepicker from 'react-datepicker';
import moment from 'moment';
import {
  ADDZONEPRICE, ADDZONESTRING, BASEZONEPRICE, BASEZONESTRING,
} from './constants/prices';

class ContractHeader extends Component {
  constructor() {
    super();
    const now = new Date(Date.now());
    this.handleDateChange = this.handleDateChange.bind(this);
    this.state = {
      startDate: moment(),
      positions: [],
      contract: '',
    };
    this.createContract();
    this.createTwoPositions();
    this.addPosition = this.addPosition.bind(this);
  }

  render() {
    return (
      <Container fluid>
        <Row>
          <Col xs={5}>
            <ListGroup style={{ textAlign: 'center' }}>
              <ListGroupItem>{this.state.contract}</ListGroupItem>
              <ListGroupItem>
                <Datepicker
                  selected={this.state.startDate}
                  onChange={this.handleDateChange}
                />
              </ListGroupItem>
              <ListGroupItem>Dauerauftrag</ListGroupItem>
            </ListGroup>
          </Col>
          <Col xs={2}>
            <ListGroup style={{ textAlign: 'center' }}>
              <ListGroupItem>Zone</ListGroupItem>
              <ListGroupItem>Preis Netto</ListGroupItem>
              <ListGroupItem>Zuschlag</ListGroupItem>
              <ListGroupItem>Marken</ListGroupItem>
            </ListGroup>
          </Col>
          <Col xs={5}>
            <Col xs={4}>
              <ToggleButtonGroup type="checkbox" vertical block>
                <ToggleButton value="gewicht">Gewicht/Groesse</ToggleButton>
                <ToggleButton value="cargo">Cargo</ToggleButton>
                <ToggleButton value="gebaeude">Grossgebaeude</ToggleButton>
                <ToggleButton value="vorlaeufig">Vorlaeufig</ToggleButton>
              </ToggleButtonGroup>
            </Col>
            <Col xs={4}>
              <ButtonGroup vertical block>
                <DropdownButton title="Anfahrt" id="vertical-drop-1">
                  <Nav.Link eventKey="1">{ADDZONESTRING}</Nav.Link>
                  <Nav.Link eventKey="2">{BASEZONESTRING}</Nav.Link>
                </DropdownButton>
                <DropdownButton title="Wartezeit" id="vertical-drop-1">
                  <Nav.Link eventKey="1">{ADDZONESTRING}</Nav.Link>
                  <Nav.Link eventKey="2">{BASEZONESTRING}</Nav.Link>
                </DropdownButton>
                <DropdownButton title="Nachkassieren" id="vertical-drop-1">
                  <Nav.Link eventKey="1">{ADDZONESTRING}</Nav.Link>
                  <Nav.Link eventKey="2">{BASEZONESTRING}</Nav.Link>
                </DropdownButton>
                <Button value="express">EXPRESS</Button>
              </ButtonGroup>
            </Col>
            <Col xs={4}>
              <div>
                <Button variant="danger" block style={{ marginTop: '10px' }}> Abbrechen </Button>
              </div>
              <div>
                <Button variant="success" size="large" block style={{ marginTop: '10px' }}> Los! </Button>
              </div>
            </Col>
          </Col>
        </Row>
      </Container>
    );
  }
}

export { ContractHeader };
