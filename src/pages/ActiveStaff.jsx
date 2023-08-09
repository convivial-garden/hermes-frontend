import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import {
  ListGroup, ListGroupItem,
  Container, Row, Col,
} from 'react-bootstrap';
import ActiveStaffEntry from '../components/ActiveStaffEntry';
import AddStaffModal from '../components/AddStaffModal';
import { getTimesByDate } from '../utils/transportFunctions';

class ActiveStaff extends Component {
  constructor() {
    super();
    this.dateChange = this.dateChange.bind(this);
    this.updateList = this.updateList.bind(this);
    this.state = {
      date: new Date(),
      currentTimes: [],
    };
  }

  componentDidMount() {
    this.updateList(new Date());
  }

  updateList(date) {
    const dateX = date || this.state.date;

    getTimesByDate(dateX, (results) => {
      this.setState(
        { currentTimes: results },
      );
    });
  }

  dateChange(date) {
    this.setState({ date }, this.updateList(date));
  }

  render() {
    return (
      <Container className="activeStaffForm" fluid>
        <Row className="mb-3">
          <Col xs={5}>
            <AddStaffModal size="lg" date={this.state.date} label="Fahrer:innen bearbeiten" update={this.updateList} times={this.state.currentTimes} />
          </Col>
          <Col xs={7} className="d-flex align-items-center">
            Datum:
            <DatePicker
              dateFormat="dd.MM.yyyy"
              selected={this.state.date}
              onChange={this.dateChange}
              className="form-control"
            />
          </Col>
        </Row>
        <Row style={{ marginBottom: '10px' }}>
          <Col xs={3}><h3>Name</h3></Col>
          <Col xs={3}><h3>Dienstbeginn</h3></Col>
          <Col xs={3}><h3>Dienstende</h3></Col>
          <Col xs={1}><h3>Dauer</h3></Col>
          <Col xs={1}>&nbsp;</Col>
        </Row>
        {(this.state.currentTimes && this.state.currentTimes.length > 0)

          ? this.state.currentTimes.map((data, index) => (
            <ActiveStaffEntry
              index={index}
              key={data.id}
              data={data}
              update={this.updateList}
            />
          ))
          : (
            <ListGroup>
              <ListGroupItem>
                <Row>
                  Kein Personal an diesem Tag
                </Row>
              </ListGroupItem>
            </ListGroup>
          )}
      </Container>
    );
  }
}

export default ActiveStaff;
