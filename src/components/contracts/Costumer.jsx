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
import { faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import AsyncSelect from 'react-select/async';
import { INITIAL_CONTRACT_FORM_STATE } from '@/constants/initialStates';
import {
  getCustomersByNameList,
  getCustomer,
} from '@/utils/transportFunctions.jsx';

class Costumer extends Component {
  constructor() {
    super();
    this.selectLoadOptions = this.selectLoadOptions.bind(this);
    this.selectChangeHandler = this.selectChangeHandler.bind(this);
    this.open = this.open.bind(this);
    this.state = {
      customer: INITIAL_CONTRACT_FORM_STATE,
    };
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
        this.props.customer
        && this.props.customer.customer_name !== this.state.customer.customer_name
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
      const {
        value, label, url, name,
      } = val;
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
        <Row className="Costumer2">
          <FormGroup controlId="firstRow" className="row customer-search">
            <Col xs={8}>
              <Row>
                {this.state.customer.new_customer
                || this.state.customer.customer_url !== ''
                || this.state.customer.customer_anon ? (
                  <InputGroup style={{ width: '85%' }}>
                    <Form.Control
                      type="text"
                      placeholder="Name"
                      name="customer_name"
                      value={this.state.customer.customer_name}
                      ref={this.props.inputRef}
                      onChange={(event) => {
                        this.state.customer.customer_name = event.target.value;
                        setCustomer(this.state.customer);
                        console.log('event.target.value', event.target.value);
                      }}
                      style={{ width: '85%' }}
                    />
                    <Button
                      onClick={() => setCustomer({
                        new_customer: false,
                        customer_anon: name.prop === 'anon_name',
                        anon_name: '',
                        customer_url: '',
                      })}
                    >
                      <FontAwesomeIcon icon={faCircleMinus} />
                    </Button>
                  </InputGroup>
                  ) : (
                    <InputGroup className="highest-z" style={{ width: '100%' }}>
                      <AsyncSelect
                        name="customer_name"
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
                        placeholder="Kundenname"
                      />
                    </InputGroup>
                  )}
              </Row>
            </Col>
            <Col xs={3}>
              {this.state.customer.new_customer ? (
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Kd-Nr"
                    name="customer_number"
                    value={this.state.customer.customer_number}
                    onChange={this.handleNewId}
                  />
                </InputGroup>
              ) : (
                <AsyncSelect
                  name="customer_number"
                  value={{ label: this.state.customer.customer_number }}
                  loadOptions={this.selectbyIdLoadOptions}
                  filterOption={this.idFilter}
                  onChange={this.selectChangeHandler}
                  cacheOptions
                  defaultOptions
                  placeholder="KDN-NR"
                />
              )}
            </Col>
          </FormGroup>
          <Col xs={4} className="red boldf">
            {delayedWarning}
          </Col>
        </Row>
      );
    }
    return <div>costumer missing</div>;
  }
}

export default Costumer;
