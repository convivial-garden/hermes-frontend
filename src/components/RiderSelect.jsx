import React, { Component } from 'react';
import { Form, FormGroup, Button, Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

class RiderSelect extends Component {
  state = {
    thirdField: false,
  };

  componentDidMount() {
    const { selection } = this.props;
    if (selection !== undefined) {
      const needsThirdField = selection[2] !== -1;
      this.setState({ thirdField: needsThirdField });
    }
  }

  render() {
    const { riders, handleSelection, position, selection } = this.props;
    return selection !== undefined ? (
      <Row>
        <Col xs={this.state.thirdField ? 12 : 9}>
          <FormGroup size='sm'>
            <Form.Select
              placeholder='keine FahrerIn'
              name='fahrerSelect'
              value={selection[0]}
              onChange={(event) => handleSelection(position, 0, event)}
            >
              <option value={-1}>keine FahrerIn</option>
              {riders?.map((rider) => (
                <option value={rider.user} key={rider.user}>
                  {rider.times[0].staff_member.user__first_name}
                </option>
              ))}
            </Form.Select>
            <Form.Select
              placeholder='keine FahrerIn'
              name='fahrerSelect'
              value={selection[1]}
              onChange={(event) => handleSelection(position, 1, event)}
            >
              <option value={-1}>keine FahrerIn</option>
              {riders?.map((rider) => (
                <option value={rider.user} key={rider.user}>
                  {rider.times[0].staff_member.user__first_name}
                </option>
              ))}
            </Form.Select>
            {this.state.thirdField ? (
              <Form.Select
                placeholder='keine FahrerIn'
                name='fahrerSelect'
                value={selection[2]}
                onChange={(event) => handleSelection(position, 2, event)}
              >
                <option value={-1}>keine FahrerIn</option>
                {riders.map((rider) => (
                  <option value={rider.user} key={rider.user}>
                    {rider.times[0].staff_member.user__first_name}
                  </option>
                ))}
              </Form.Select>
            ) : (
              ''
            )}
          </FormGroup>
        </Col>
        {!this.state.thirdField ? (
          <Col xs={3}>
            <Button
              size='xsmall'
              onClick={(event) => this.setState({ thirdField: true })}
            >
              <FontAwesomeIcon icon={faPlus} />
            </Button>
          </Col>
        ) : (
          ''
        )}
      </Row>
    ) : (
      <FormGroup size='sm'> </FormGroup>
    );
  }
}

export default RiderSelect;
