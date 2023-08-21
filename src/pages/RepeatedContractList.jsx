import React, { Component } from 'react';
import {
  Container,
  Row,
  ListGroupItem,
  Col,
  ToggleButtonGroup,
  ToggleButton,
} from 'react-bootstrap';
import RepeatedContractPosition from '@/components/contracts/RepeatedContractPosition';
import {
  getRepeatedContracts,
  getTerminatedRepeatedContracts,
} from '@/utils/transportFunctions.jsx';

class RepeatedContractList extends Component {
  constructor() {
    super();
    this.updateContractsFromDB = this.updateContractsFromDB.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleWeekdayToggle = this.handleWeekdayToggle.bind(this);
  }

  state = {
    currentContracts: [],
    whichContracts: 0,
    weekday: 'All',
  };

  updateContractsFromDB() {
    if (this.state.whichContracts === 0) {
      getRepeatedContracts(this.state.weekday).then((response) => this.setState({ currentContracts: response }));
    } else {
      getTerminatedRepeatedContracts(this.state.weekday).then((response) => this.setState({ currentContracts: response }));
    }
  }

  componentDidMount() {
    this.updateContractsFromDB();
  }

  handleToggle(event) {
    this.setState({ whichContracts: event }, this.updateContractsFromDB);
  }

  handleWeekdayToggle(event) {
    this.setState({ weekday: event }, this.updateContractsFromDB);
  }

  render() {
    return (
      <Container fluid className="contractList bbott">
        <Row>
          <Col md={2}>
            <h3 className="def-headline">Daueraufträge</h3>
          </Col>
          <Col md={4}>
            <ToggleButtonGroup value={this.state.whichContracts} name="toggle_old_new" type="radio" onChange={(event) => { this.handleToggle; }}>
              <ToggleButton value={0} onClick={() => this.handleToggle(0)}>Laufende Auftraege</ToggleButton>
              <ToggleButton value={1} onClick={() => this.handleToggle(1)}>Beendete Auftraege</ToggleButton>
            </ToggleButtonGroup>
          </Col>
          <Col md={6}>
            <ToggleButtonGroup value={this.state.weekday} name="toggle_weekday" type="radio">
              <ToggleButton value="All" onClick={() => this.handleWeekdayToggle('All')}>Alle Wochentage</ToggleButton>
              <ToggleButton value="Monday" onClick={() => this.handleWeekdayToggle('Monday')}>Montag</ToggleButton>
              <ToggleButton value="Tuesday" onClick={() => this.handleWeekdayToggle('Tuesday')}>Dienstag</ToggleButton>
              <ToggleButton value="Wednesday" onClick={() => this.handleWeekdayToggle('Wednesday')}>Mittwoch</ToggleButton>
              <ToggleButton value="Thursday" onClick={() => this.handleWeekdayToggle('Thursday')}>Donnerstag</ToggleButton>
              <ToggleButton value="Friday" onClick={() => this.handleWeekdayToggle('Friday')}>Freitag</ToggleButton>
            </ToggleButtonGroup>
          </Col>
        </Row>
        {this.state.currentContracts.length === 0 ? (
          <ListGroupItem>Zur Zeit keine Auftraege vorhanden</ListGroupItem>
        ) : (
          ''
        )}
        {this.state.currentContracts
          .sort((a, b) => b.id - a.id)
          .map((contract, index) => (
            <RepeatedContractPosition
              key={contract.id}
              contract={contract}
              updateContracts={this.updateContractsFromDB}
              date={this.state.date}
              idx={index}
            />
          ))}
      </Container>
    );
  }
}

export default RepeatedContractList;
