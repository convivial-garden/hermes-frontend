import React, { Component } from 'react';
import {
  Col, ToggleButtonGroup, ToggleButton, Button,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import TimeInput from './TimeInput';

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
        <Col xs={2} style={{ paddingTop: '5px' }}>
          <ToggleButtonGroup
            type="radio"
            size="xsmall"
            value={this.props.mode}
            name="start_mode"
          >
            <ToggleButton
              value="ab"
              id={`radio-${this.uniqueId()}`}
              onChange={(event) => {
                this.props.setStateOfPosition(this.props.id, { start_mode: event.target.value }, this.focusStartRef);
              }}
            >
              Ab
            </ToggleButton>
            <ToggleButton
              value="um"
              id={`radio-${this.uniqueId()}`}
              onChange={(event) => {
                this.props.setStateOfPosition(this.props.id, { start_mode: event.target.value }, this.focusStartRef);
              }}
            >
              Um
            </ToggleButton>
            <ToggleButton
              value="bis"
              id={`radio-${this.uniqueId()}`}
              onChange={(event) => {
                this.props.setStateOfPosition(this.props.id, { start_mode: event.target.value }, this.focusStartRef);
              }}
            >
              Bis
            </ToggleButton>
          </ToggleButtonGroup>
        </Col>
        <Col xs={3}>
          {this.props.mode !== ''
            ? (
              <TimeInput
                time={this.props.time}
                callback={(value) => { this.props.setStateOfPosition(this.props.id, { start_time: value }); }}
                irefSetter={this.setStartRef}
                iref={this.startRef}
                next={() => 0}
                size="sm"
              />
            )
            : ''}
        </Col>
        <Col xs={1}>
          {this.props.mode !== ''
            ? (
              <Button size="sm" onClick={(event) => this.props.setStateOfPosition(this.props.id, { start_mode: '' })}>
                <FontAwesomeIcon icon={faCircleMinus} />
              </Button>
            )
            : ''}
        </Col>
      </div>
    );
  }
}

export default ContractFormTimesForm;
