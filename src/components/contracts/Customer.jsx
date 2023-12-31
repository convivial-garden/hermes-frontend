import React, { Component } from 'react';
import {
  Row,
  Col,
  FormGroup,
  InputGroup,
  Form,
  Button,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleMinus, faUserNinja } from '@fortawesome/free-solid-svg-icons';
import AsyncSelect from 'react-select/async';
import { INITIAL_CONTRACT_FORM_STATE } from '@/constants/initialStates';
import {
  getCustomersByNameList,
  getCustomer,
  getCustomersByExternalIdList,
} from '@/utils/transportFunctions.jsx';
import CustomerFormModal from '../CustomerFormModal';

class Customer extends Component {
  constructor() {
    super();
    this.selectLoadOptions = this.selectLoadOptions.bind(this);
    this.selectChangeHandler = this.selectChangeHandler.bind(this);
    this.selectbyIdLoadOptions = this.selectbyIdLoadOptions.bind(this);
    this.open = this.open.bind(this);
    this.state = {
      customer: INITIAL_CONTRACT_FORM_STATE,
    };
  }
  selectbyIdLoadOptions(input, callback) {
    setTimeout(() => {
      const options = [];
      if (input.length > 0) {
        getCustomersByExternalIdList(input, (response) => {
          response.forEach((customer) => {
            const { id, external_id, name, url } = customer;
            options.push({
              value: id,
              label: `${external_id} ${name}`,
              url,
              name,
              external_id,
            });
          });
          options.push({ value: 'neu', label: 'Neuer Kunde' });
          callback(options);
        });
      } else {
        options.push({ value: 'neu', label: 'Neuer Kunde' });
        callback(options);
      }
    }, 100);
  }

  selectLoadOptions(input, callback) {
    setTimeout(() => {
      const options = [];
      getCustomersByNameList(input, (response) => {
        response.forEach((customer) => {
          const { id, name, url } = customer;
          options.push({ value: id, label: name, url });
        });
        options.push({ value: 'neu', label: 'Neuer Kunde' });
        options.push({ value: 'anon', label: 'Anonym' });
        callback(options);
      });
    }, 100);
  }

  componentDidUpdate(prevProps) {
    if (this.props.customer !== null && this.props.customer !== '') {
      if (
        this.props.customer &&
        this.props.customer.customer_name !== this.state.customer.customer_name
      ) {
        this.setState({ customer: this.props.customer });
      }
    }
  }

  selectChangeHandler(val) {
    if (val === null || val.value === 'neu' || val.value === 'anon') {
      this.props.setCustomer({
        ...INITIAL_CONTRACT_FORM_STATE,
        new_customer: val.value === 'neu',
        customer_anon: val.value === 'anon',
        customer_is_pick_up: false,
        customer_is_drop_off: false,
      });
      this.setState({
        customer: {
          ...INITIAL_CONTRACT_FORM_STATE,
          new_customer: val.value === 'neu',
          customer_anon: val.value === 'anon',
          customer_is_pick_up: false,
          customer_is_drop_off: false,
        },
      });
    } else {
      const { value, label, url, name } = val;
      getCustomer(value, (response) => {
        const address = response.addresses[0];
        const obj = {
          customer_url: url,
          customer_name: name || label,
          customer_number: response.external_id,
          customer_id: response.id,
          street_name: address.street,
          street_selected: true,
          postal_code: address.postal_code,
          number: address.number,
          level: address.level,
          stair: address.stair,
          door: address.door,
          phone_1: response.phone_1,
          phone_2: response.phone_2,
          payment: response.payment,
          label,
          lat: address.lat,
          long: address.lon,
          talk_to: address.talk_to,
          talk_to_extra: address.talk_to_extra,
          status: 'saved',
          hasDelayedPayment: response.has_delayed_payment,
          hasDelayedPaymentMemo: response.has_delayed_payment_memo,
          customer_is_pick_up: false,
          customer_is_drop_off: false,
        };
        if (response.has_delayed_payment) this.open();

        this.props.setCustomer(obj);
      });
    }
  }

  open() {
    this.setState({ showModal: true });
  }

  render() {
    // get the neccessary data
    if (this.state.customer || this.state.customer !== null) {
      const { setCustomer } = this.props;
      const delayedWarning = this.props.customer?.has_delayed_payment
        ? 'Kund*In hat Nachzahlung!'
        : '';
      return (
        <Row className='Customer2'>
          <FormGroup controlId='firstRow' className='row customer-search'>
            <Col xs={9}>
              <div>
                {this.state.customer.new_customer ||
                this.state.customer.customer_url !== '' ||
                this.state.customer.customer_anon ? (
                  <InputGroup style={{ flexWrap: 'nowrap' }}>
                    <Form.Control
                      type='text'
                      placeholder='Neue:r Kund:in Name'
                      name='customer_name'
                      value={this.state.customer.customer_name}
                      ref={this.props.inputRef}
                      onChange={(event) => {
                        this.state.customer.customer_name = event.target.value;
                        setCustomer(this.state.customer);
                        console.log('event.target.value', event.target.value);
                      }}
                      style={{ width: '85%' }}
                    />
                    <div className='d-flex'>
                      {this.state.customer.customer_anon ? (
                        <Button>
                          <FontAwesomeIcon icon={faUserNinja} />
                        </Button>
                      ) : (
                        <div>
                          {!this.state.customer.new_customer ? (
                            <CustomerFormModal
                              customer={this.state.customer}
                            />
                          ) : (
                            ''
                          )}
                        </div>
                      )}
                      <Button
                        variant='danger'
                        className='ms-1'
                        onClick={() => {
                          setCustomer({
                            ...INITIAL_CONTRACT_FORM_STATE,
                            customer_anon: false,
                          });
                          this.setState({
                            customer: {
                              ...INITIAL_CONTRACT_FORM_STATE,
                              customer_anon: false,
                            },
                          });
                        }}
                      >
                        <FontAwesomeIcon icon={faCircleMinus} />
                      </Button>
                    </div>
                  </InputGroup>
                ) : (
                  <InputGroup className='highest-z' style={{ width: '100%' }}>
                    <AsyncSelect
                      name='customer_name'
                      value={this.state.customer.customer_name}
                      loadOptions={this.selectLoadOptions}
                      ignoreAccents={false}
                      ignoreCase={false}
                      ref={this.props.inputRef}
                      filterOption={this.nameFilter}
                      onInputKeyDown={this.onCustomerSelectInputKeyDown}
                      onChange={this.selectChangeHandler}
                      style={{ width: '100%' }}
                      cacheOptions
                      defaultOptions
                      placeholder='Kund:innenname'
                    />
                  </InputGroup>
                )}
              </div>
            </Col>
            <Col xs={3}>
              {this.state.customer.new_customer ? (
                <InputGroup>
                  <Form.Control
                    type='text'
                    placeholder='Kd-Nr'
                    name='customer_number'
                    value={this.state.customer.customer_number}
                    onChange={this.handleNewId}
                  />
                </InputGroup>
              ) : (
                <AsyncSelect
                  name='customer_number'
                  value={{ label: this.state.customer.customer_number }}
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
          <Col xs={4} className='red boldf'>
            {delayedWarning}
          </Col>
        </Row>
      );
    }
    return <div>customer missing</div>;
  }
}

export default Customer;
