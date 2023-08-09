import React, { Component } from 'react';
import {
  Row, Col, FormLabel, Form, Button,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import TimeInput from './TimeInput';

class StaffDetailTimesForm extends Component {
  constructor(props) {
    const end = new Date().setHours(18);
    super(props);
    this.startRef = new Date();
    this.endRef = end;
    this.focusEndTimeInput = this.focusEndTimeInput.bind(this);
    this.setStartRef = this.setStartRef.bind(this);
    this.setEndRef = this.setEndRef.bind(this);
  }

  setStartRef(elem) {
    this.startRef = elem;
  }

  setEndRef(elem) {
    this.endRef = elem;
  }

  focusEndTimeInput() {
    // this.endRef && this.endRef.focus();
  }

  render() {
    return (
      <Row>
        <Col xs={4}>
          <FormLabel>Schichtstart</FormLabel>
          <Form>
            <TimeInput
              time={this.props.start_datetime}
              callback={this.props.timeInputCallback('start_datetime')}
              irefSetter={this.setStartRef}
              iref={this.startRef}
              next={this.focusEndTimeInput}
            />
          </Form>
        </Col>
        <Col xs={4}>
          <FormLabel>Schichtende</FormLabel>
          <Form>
            <TimeInput
              time={this.props.end_datetime}
              callback={this.props.timeInputCallback('end_datetime')}
              irefSetter={this.setEndRef}
              iref={this.endRef}
              next={() => 0}
            />
          </Form>
        </Col>
        {this.props.end_datetime !== ''
          ? (
            <Col xs={4}>
              <FormLabel className="mr-3"> Endzeit löschen?</FormLabel>
              <Button onClick={() => this.props.setEntry(this.props.pos, { end_datetime: '' })}>
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </Col>
          )
          : ''}
      </Row>
    );
  }
}

export default StaffDetailTimesForm;
