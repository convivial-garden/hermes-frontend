import React, { Component } from 'react';
import {
  Container, Row, ListGroupItem, Col, Button, ToggleButtonGroup, ToggleButton,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import ContractPosition from '@/components/contracts/ContractPosition';
import {
  getAssignedContractSelfByDate,
  getStaffByDate,
  getActiveStaffByDate,
  generateRepeatedContracts,
} from '@/utils/transportFunctions.jsx';

import 'react-datepicker/dist/react-datepicker.css';

class ContractList extends Component {
  constructor() {
    super();
    this.state = {
      date: new Date(),
      currentContracts: [],
      currentRiders: [],
      activeRiders: [],
      selectedRider: -1,
    };
    this.updateContractsFromDB = this.updateContractsFromDB.bind(this);
    this.dateChange = this.dateChange.bind(this);
    this.handleDayBack = this.handleDayBack.bind(this);
    this.handleDayForward = this.handleDayForward.bind(this);
    this.setDateToToday = this.setDateToToday.bind(this);
  }



  updateRidersFromDB(callback) {
    getStaffByDate(
      this.state.date,
      (response) => this.setState(
        { currentRiders: response || [], selectedRider: -1 },
        () => {
          if (callback !== undefined) callback();
        },
      ),
    );
  }

  updateActiveRidersFromDB(callback) {
    return getActiveStaffByDate(
      this.state.date,
      (response) => this.setState(
        { activeRiders: response, selectedRider: -1 },
        () => {
          if (callback !== undefined) callback();
        },
      ),
    );
  }

  componentDidMount() {
    generateRepeatedContracts();
    this.updateActiveRidersFromDB(() => {
      this.updateRidersFromDB(() => {
        this.updateContractsFromDB();
      });
    });
  }

  setRider(id) {
    this.setState({ selectedRider: id }, () => {
      this.updateContractsFromDB();
    });
  }

  dateChange(date) {
    this.setState({ date, selectedRider: -1 }, () => {
      this.updateRidersFromDB(this.updateContractsFromDB);
      this.props.appUpdate(date);
    });
  }

  handleDayBack() {
    const newDate = new Date();
    newDate.setDate(this.state.date.getDate() - 1);
    this.dateChange(newDate);
  }

  handleDayForward() {
    const newDate = new Date();
    newDate.setDate(this.state.date.getDate() + 1);
    this.dateChange(newDate);
  }

  setDateToToday() {
    this.dateChange(new Date());
  }

  updateContractsFromDB() {
    getAssignedContractSelfByDate(this.state.date, (response) => this.setState({ currentContracts: response }));
    this.props.appUpdate(this.state.date);
  }

  render() {
    return (
      <Container fluid className="contractList bbott">
        <Row>
          <Col xs={2}>
            <h3 className="def-headline">Meine Auftragsübersicht</h3>
          </Col>
          <Col xs={6}>
            <Row>
              <Col xs={3}>
                <Button onClick={this.handleDayBack}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </Button>
              </Col>
              <Col xs={4}>
                <DatePicker
                  dateFormat="dd.MM.yyyy"
                  className="form-control"
                  selected={this.state.date}
                  onChange={this.dateChange}
                  calendarStartDay={1}
                />
              </Col>
              <Col xs={4}>
                <Button onClick={this.setDateToToday}>Heute</Button>
                <Button onClick={this.handleDayForward}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </Button>
              </Col>
              <Col xs={1} />
            </Row>
          </Col>
        </Row>
        {this.state.currentContracts && this.state.currentContracts.length === 0
          ? <ListGroupItem>Zur Zeit keine Auftraege vorhanden</ListGroupItem> : ''}

        {this.state.currentContracts
          ? this.state.currentContracts.sort((a, b) => (b.id - a.id)).map((contract, index) => (
            <ContractPosition
              key={contract.id}
              contract={contract}
              updateContracts={this.updateContractsFromDB}
              riders={this.state.activeRiders}
              date={this.state.date}
              idx={index}
            />
          )) : ''}
      </Container>
    );
  }
}

export default ContractList;
