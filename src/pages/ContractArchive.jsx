import React, { Component } from 'react';
import {
  Container,
  Row,
  ListGroup,
  ListGroupItem,
  Col,
  ToggleButton,
  ToggleButtonGroup,
  DropdownButton,
  Nav,
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import ContractPosition from '@/components/contracts/ContractPosition';
import { getContractArchive, getStaffNames } from '@/utils/transportFunctions.jsx';
import CustomerSelect from '@/components/CustomerSelect';

import 'react-datepicker/dist/react-datepicker.css';

class ContractArchive extends Component {
  constructor() {
    super();
    this.updateContractsFromDB = this.updateContractsFromDB.bind(this);
    this.dateChange = this.dateChange.bind(this);
    this.onRiderSelect = this.onRiderSelect.bind(this);
    this.setCustomer = this.setCustomer.bind(this);
  }

  state = {
    date: new Date(),
    currentContracts: [],
    riders: [],
    currentRider: { name: 'Alle Fahrer', id: -1 },
    type: 'Tag',
    customer: null,
  };

  updateContractsFromDB() {
    if (this.state.currentRider.id !== -1 && this.state.type === 'Tag') {
      getContractArchive(this.state.date, this.state.type, this.state.currentRider.id, this.state.customer && this.state.customer.id)
        .then((results) => this.setState({ currentContracts: results }));
    } else {
      getContractArchive(this.state.date, this.state.type, null, this.state.customer && this.state.customer.id)
        .then((results) => this.setState({ currentContracts: results }));
    }
  }

  setCustomer(customer) {
    this.setState({ customer }, this.updateContractsFromDB);
  }

  componentDidMount() {
    getStaffNames((results) => { this.setState({ riders: results }); });
    this.updateContractsFromDB();
  }

  dateChange(date) {
    this.setState({ date }, () => {
      this.updateContractsFromDB();
    });
  }

  handleType(name, val) {
    this.setState({ type: name }, () => {
      this.updateContractsFromDB();
    });
  }

  onRiderSelect(event) {
    console.log(this.state.riders);

    const rider = this.state.riders
      ? this.state.riders.find((rider) => rider.id === parseInt(event)) : [];
    if (rider) this.setState({ currentRider: rider }, this.updateContractsFromDB);
    else this.setState({ currentRider: { name: 'Alle Fahrer', id: -1 } }, this.updateContractsFromDB);
  }

  render() {
    return (
      <Container fluid className="contractList bbo contractarchive">
        <Row>
          <Col xs={2}>
            <h3 className="def-headline">Auftragsarchiv</h3>
          </Col>
          <Col xs={1}>
            <h4>
              {this.state.currentContracts.length}
              {' '}
              {this.state.currentContracts.length === 1 ? 'Auftrag' : 'Aufträge'}
            </h4>
          </Col>
          <Col xs={1}>
            <DatePicker
              dateFormat="dd.MM.yyyy"
              selected={this.state.date}
              onChange={this.dateChange}
              className="form-control"
              calendarStartDay={1}
            />
          </Col>
          <Col xs={4}>
            <ToggleButtonGroup
              type="radio"
              value={this.state.type}
              onChange={this.handleType.bind(this)}
              name="typeOptions2"
            >
              <ToggleButton id="tbg-btn-1" value="Jahr">
                nach Jahr
              </ToggleButton>
              <ToggleButton id="tbg-btn-2" value="Monat">
                nach Monat
              </ToggleButton>
              <ToggleButton id="tbg-btn-3" value="Woche">
                nach Woche
              </ToggleButton>
              <ToggleButton id="tbg-btn-4" value="Tag">
                nach Tag
              </ToggleButton>
            </ToggleButtonGroup>
          </Col>
          <Col xs={2}>
            {this.state.type === 'Tag'
              ? (
                <DropdownButton id="rider_dropdown" title={this.state.currentRider.name} name="riders" onSelect={this.onRiderSelect}>
                  <Nav.Link eventKey={-1}>Alle Fahrer</Nav.Link>
                  {this.state.riders && this.state.riders.map((rider, index) => <Nav.Link key={rider.id} eventKey={rider.id}>{rider.name}</Nav.Link>)}
                </DropdownButton>
              )
              : ''}
          </Col>
          <Col xs={2}>
            <CustomerSelect setCustomer={this.setCustomer} />
          </Col>
        </Row>
        <ListGroup>
          {this.state.currentContracts.length === 0 ? <ListGroupItem>Zur Zeit keine Auftraege vorhanden</ListGroupItem> : ''}
          {this.state.currentContracts.map((contract, index) => (
            <ContractPosition
              key={contract.id}
              contract={contract}
              updateContracts={this.updateContractsFromDB}
              riders={[]}
              idx={index}
              archive
            />
          ))}
        </ListGroup>
      </Container>
    );
  }
}

export default ContractArchive;
