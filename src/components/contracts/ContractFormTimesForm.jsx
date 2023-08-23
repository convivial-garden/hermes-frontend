import React, { Component } from 'react';
import { Col, Row, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import TimeInput from '@/components/TimeInput';

class ContractFormTimesForm extends Component {
  constructor(props) {
    super(props);
    this.startRef = null;
    this.endRef = null;
    this.setStartRef = this.setStartRef.bind(this);
    this.focusStartRef = this.focusStartRef.bind(this);
  }

  setStartRef(elem) {
    this.startRef = elem;
  }

  focusStartRef() {
    this.startRef && this.startRef.focus();
    this.startRef && this.startRef.select();
  }

  uniqueId() {
    return Math.random().toString(16).slice(2);
  }

  render() {
    return (
      <div>
        <Row>
          <Col xs={6}>
            Von
            <TimeInput
              time={this.props.start_time}
              callback={(value) => {
                if (value > this.props.start_time_to || this.props.start_time_to === '') {
                  this.props.setStateOfPosition(this.props.id, {
                    start_time: value,
                    start_time_to: value,
                  });
                } else {
                  this.props.setStateOfPosition(this.props.id, {
                    start_time: value,
                  });
                }
              }}
              irefSetter={this.setStartRef}
              iref={this.startRef}
              next={() => 0}
              size="sm"
            />
          </Col>
          <Col xs={6}>
            Bis
            <TimeInput
              time={this.props.start_time_to}
              callback={(value) => {
                this.props.setStateOfPosition(this.props.id, {
                  start_time_to: value,
                });
              }}
              irefSetter={this.setStartRef}
              iref={this.startRef}
              next={() => 0}
              size="sm"
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default ContractFormTimesForm;
