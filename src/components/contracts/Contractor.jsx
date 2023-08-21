import React, { Component } from 'react';
import { Row, Col,  FormGroup, 
  InputGroup, Form, Button
} from 'react-bootstrap';
import moment from 'moment';
import {
  INITIAL_CONTRACT_FORM_STATE,
  apiResponseToInitialState,
} from '@/constants/initialStates';
import AsyncSelect from 'react-select/async';

moment.updateLocale('en', {
  weekdays: [
    'Sonntag',
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
  ],
});

class Contractor extends Component {
  render() {
    console.log(this.props);
    // get the neccessary data
    if (this.props.customer || this.props.customer !== null) {
      const customer = this.props.customer;
      let data = INITIAL_CONTRACT_FORM_STATE;
      const delayedWarning = this.props.customer?.has_delayed_payment
        ? 'Kund*In hat Nachzahlung!'
        : '';

      return (
        <Row className='contractor2'>
          <Col xs={12}>
            <Row>
              <Col xs={12}>
                <Row>
                  <Col xs={12} className='mh boldf'>
                    <Row>
                      <FormGroup
                        controlId='firstRow'
                        className='row customer-search'
                      >
                        <Col xs={8}>
                          <Row>
                            {data.new_customer ||
                            data.customer_url !== '' ||
                            data.customer_anon ? (
                              <InputGroup style={{ width: '90%' }}>
                                <Form.Control
                                  type='text'
                                  placeholder='Name'
                                  name='customer_name'
                                  value={name.name}
                                  ref={this.props.inputRef}
                                  onChange={(event) =>
                                    setStateOfPosition(id, {
                                      [name.prop]: event.target.value,
                                    })
                                  }
                                  // inputRef={this.props.inputRefTwo}
                                  onKeyPress={this.focusNextOnEnter(
                                    this.streetRef,
                                  )}
                                  style={{ width: '90%' }}
                                />
                                <Button
                                  onClick={() =>
                                    setStateOfPosition(id, {
                                      new_customer: false,
                                      customer_anon: name.prop === 'anon_name',
                                      anon_name: '',
                                      customer_url: '',
                                    })
                                  }
                                >
                                  <FontAwesomeIcon icon={faCircleMinus} />
                                </Button>
                              </InputGroup>
                            ) : (
                              <InputGroup
                                className='highest-z'
                                style={{ width: '100%' }}
                              >
                                <AsyncSelect
                                  name='customer_name'
                                  value={data.customer_name}
                                  loadOptions={this.selectLoadOptions}
                                  ignoreAccents={false}
                                  ignoreCase={false}
                                  ref={this.props.inputRef}
                                  filterOption={this.nameFilter}
                                  onInputKeyDown={
                                    this.onCustomerSelectInputKeyDown
                                  }
                                  onChange={this.selectChangeHandler}
                                  style={{ width: '100%' }}
                                  cacheOptions
                                  defaultOptions
                                  placeholder='Kundenname'
                                />
                              </InputGroup>
                            )}
                          </Row>
                        </Col>
                        <Col xs={3}>
                          {data.new_customer ? (
                            <InputGroup>
                              <Form.Control
                                type='text'
                                placeholder='Kd-Nr'
                                name='customer_number'
                                value={data.customer_number}
                                onChange={this.handleNewId}
                              />
                            </InputGroup>
                          ) : (
                            <AsyncSelect
                              name='customer_number'
                              value={{ label: data.customer_number }}
                              loadOptions={this.selectbyIdLoadOptions}
                              filterOption={this.idFilter}
                              onChange={this.selectChangeHandler}
                              cacheOptions
                              defaultOptions
                              placeholder='KDN-NR'
                            />
                          )}
                        </Col>
                      </FormGroup>
                      <Col xs={8}>
                        {customer !== null
                          ? `${name}  (${customer?.external_id})`
                          : ''}
                      </Col>
                      <Col xs={4} className='red boldf'>
                        {delayedWarning}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      );
    } else {
      return <div>costumer missing</div>;
    }
  }
}

export default Contractor;
