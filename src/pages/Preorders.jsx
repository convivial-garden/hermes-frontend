import React, { Component } from 'react';
import {
  Container, Row, ListGroupItem, Col,
} from 'react-bootstrap';
import moment from 'moment';
import ContractPosition from '@/components/contracts/ContractPosition';
import { getPreorders } from '@/utils/transportFunctions.jsx';

import 'react-datepicker/dist/react-datepicker.css';

class Preorders extends Component {
  constructor() {
    super();
    this.updateContractsFromDB = this.updateContractsFromDB.bind(this);
    this.dateChange = this.dateChange.bind(this);
    this.sortByDate = this.sortByDate.bind(this);
    this.reducePositionDates = this.reducePositionDates.bind(this);
    this.sortIntoDateBins = this.sortIntoDateBins.bind(this);
  }

  state = {
    date: new Date(),
    currentContracts: [],
    currentRiders: [],
    dateBins: [],
    selectedRider: -1,
  };

  updateContractsFromDB() {
    getPreorders()
      .then((results) => this.setState({ currentContracts: results }, this.sortIntoDateBins));
  }

  componentDidMount() {
    this.updateContractsFromDB();
    // this.updateRidersFromDB();
  }

  setRider(id) {
    this.setState({ selectedRider: id }, () => {
      this.updateContractsFromDB();
    });
  }

  dateChange(date) {
    this.setState({ date, selectedRider: -1 }, () => {
      this.updateContractsFromDB();
      // this.updateRidersFromDB();
    });
  }

  returnEarliest = (acc, cv) => (moment(cv).isAfter(moment(acc)) ? acc : cv);

  getContractDate(contract) {
    if (contract && contract.positions) {
      return moment(contract.positions.map((pos) => pos.start_time)
        .reduce(this.returnEarliest, contract.positions[0].start_time));
    }
    return moment();
  }

  sortIntoDateBins() {
    const contracts = this.state.currentContracts.sort(this.sortByDate);
    const newDateBins = [];
    let prevDate = this.getContractDate(contracts[0]);
    let tmpDateBin = [];
    contracts.forEach((contract) => {
      const date = this.getContractDate(contract);
      const sameDay = date.isSame(prevDate, 'day');
      if (!sameDay) {
        prevDate = date;
        newDateBins.push(tmpDateBin);
        tmpDateBin = [];
        tmpDateBin.push(contract);
      } else {
        prevDate = date;
        tmpDateBin.push(contract);
      }
    });
    if (tmpDateBin.length !== 0) newDateBins.push(tmpDateBin);
    this.setState({ dateBins: newDateBins });
  }

  reducePositionDates = (posA, posB) => {
    const returnEarliest = (acc, cv) => (moment(cv).isAfter(moment(acc)) ? acc : cv);
    const earliestA = posA.map((pos) => pos.start_time).reduce(returnEarliest, posA[0].start_time);
    const earliestB = posB.map((pos) => pos.start_time).reduce(returnEarliest, posB[0].start_time);
    const earliest = returnEarliest(earliestA, earliestB);
    if (earliest === earliestA) return 1;
    if (earliest === earliestB) return -1;
    return 0;
  };

  sortByDate = (a, b) => this.reducePositionDates(b.positions, a.positions);

  render() {
    moment.locale('de');
    return (
      <Container fluid className="contractList bbott">
        <Row>
          <Col xs={12}>
            <h3 className="def-headline">Vorbestellungen</h3>
          </Col>
        </Row>
        {this.state.currentContracts.length === 0 ? <ListGroupItem>Zur Zeit keine Vorbestellungen vorhanden</ListGroupItem> : ''}
        {this.state.dateBins.map((bin, idx) => {
          const date = this.getContractDate(bin[0]);
          const doW = `${date.format('dddd')},`;

          return (
            <div key={idx}>
              <h4>
                {doW}
                {' '}
                {date.format('DD')}
                .
                {' '}
                {date.format('MMMM')}
                {' '}
                {date.format('YYYY')}
              </h4>
              {bin.map((contract, index) => <ContractPosition key={contract.id} contract={contract} updateContracts={this.updateContractsFromDB} riders={[]} date={this.state.date} idx={index} />)}
            </div>
          );
        })}
      </Container>
    );
  }
}

export default Preorders;
