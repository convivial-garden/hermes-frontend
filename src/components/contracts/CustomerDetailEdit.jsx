import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  FormLabel,
  InputGroup,
} from 'react-bootstrap';
import * as R from 'ramda';

import AsyncSelect from 'react-select/async';
import { faTrash, faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  INITIAL_CONTRACT_FORM_STATE,
  emptyContractForm,
} from '@/constants/initialStates.js';
import {
  getStreetNamesFast,
  putDelayedPayment,
  postNewCustomer,
  getSettings,
} from '@/utils/transportFunctions.jsx';
import 'react-datepicker/dist/react-datepicker.css';

class CustomerDetailEdit extends Component {
  constructor() {
    super();
    this.selectLoadOptions = this.selectLoadOptions.bind(this);
    this.handleStreetSelect = this.handleStreetSelect.bind(this);
    this.streetFilter = this.streetFilter.bind(this);
    this.nameFilter = this.nameFilter.bind(this);
    this.focusNameSelect = this.focusNameSelect.bind(this);
    this.setNewCustomer = this.setNewCustomer.bind(this);
    this.handleDelayedPayement = this.handleDelayedPayement.bind(this);
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    this.focusCustomerInput = this.focusCustomerInput.bind(this);
    this.saveCustomer = this.saveCustomer.bind(this);
    this.focusNextOnEnter = this.focusNextOnEnter.bind(this);
    this.onCustomerSelectInputKeyDown =
      this.onCustomerSelectInputKeyDown.bind(this);
    this.selectChangeHandler = this.selectChangeHandler.bind(this);
    this.handleNewId = this.handleNewId.bind(this);
    this.setCustomer = this.setCustomer.bind(this);
    this.hasDelayedPayment = null;
    this.bzRef = null;
    this.numberRef = null;
    this.handleBonusButtonChange = this.handleBonusButtonChange.bind(this);

    getSettings().then((response) => this.setState({ settings: response }));
  }

  state = {
    street: '',
    showModal: false,
    settings: null,
    hasBonus: false,
    customer: null
  };

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }

  setNewCustomer() {
    this.props.setCustomer(this.props.position.id, {
      new_customer: true,
      ...emptyContractForm,
    });
  }

  handleBonusButtonChange(id, event, buttonState) {
    const value =
      buttonState !== undefined ? buttonState : String(event.target.value);
    const { name } = event.target;
    this.props.setCustomer({ [name]: value }, () => {});
  }

  componentDidUpdate() {
    this.nameRef = this.props.getInputRef;
  }

  selectLoadOptions(input, callback) {
    console.log('selectLoadOptions shoudnt be used');
  }

  selectChangeHandler(val) {
    console.log('selectChangeHandler shouldnt be used');
  }

  selectStreetLoadOptions(input, callback) {
    if (input.length < 4) return;
    setTimeout(() => {
      getStreetNamesFast(input).then((resp) => {
        callback(resp.data);
      });
    }, 200);
  }

  handleStreetSelect(val) {
    let newPositionObject = {};
    let nr = '';
    if (val !== null) {
      console.log('val', val);
      if (val.data.nr !== null) nr = `${val.data.nr}`;
      else nr = '-1';
      newPositionObject = {
        street_name: val.data.name,
        number: nr,
        postal_code: val.data.postal_code,
        lat: val.data.lat,
        long: val.data.lon,
        street_selected: true,
      };
    } else {
      newPositionObject = {
        street_name: '',
        number: '',
        postal_code: '',
        street_selected: false, 
      };
    }
    this.setCustomer({

      ...this.props.customer,
      ...newPositionObject,
    });
  }

  handleDelayedPayement() {
    this.props.setCustomer(
      this.props.position.id,
      { hasDelayedPayment: !this.props.position.data.hasDelayedPayment },
      () => {
        if (this.props.position.data.customer_url !== '') {
          putDelayedPayment(this.props.position.data.customer_url, {
            has_delayed_payment: this.props.position.data.hasDelayedPayment,
          });
        }
      },
    );
  }

  streetFilter(option, filter) {
    let hasSubstring = false;
    if (filter.includes(' ')) {
      const parts = filter.split(' ');
      parts.forEach((part) => {
        if (option.label.toLowerCase().includes(part.toLowerCase()))
          hasSubstring = true;
      });
    } else if (option.label.toLowerCase().includes(filter.toLowerCase()))
      hasSubstring = true;
    return hasSubstring;
  }

  nameFilter(option, filter) {
    let hasSubstring = false;
    if (filter.includes(' ')) {
      const parts = filter.split(' ');
      parts.forEach((part) => {
        if (option.label.toLowerCase().includes(part.toLowerCase()))
          hasSubstring = true;
      });
    } else if (option.label.toLowerCase().includes(filter.toLowerCase()))
      hasSubstring = true;
    return hasSubstring;
  }

  focusNameSelect() {
    this.props.focus(this.props.position.id);
  }

  focusCustomerInput() {
    const domNode = ReactDOM.findDOMNode(this.customerInput);
    if (domNode !== null) domNode.focus();
  }

  handleNewId(val) {
    if (this.props.position.data.new_customer === true) {
      this.props.setCustomer(this.props.position.id, {
        [val.target.name]: val.target.value,
      });
    }
  }

  saveCustomer() {
    if (
      this.state.customer.customer_url === '' &&
      this.state.customer.new_customer === true
    ) {
      postNewCustomer(this.state.customer).then((resp) => {
        const { url, id: id_, external_id } = resp;
        this.setCustomer({
          customer_url: url,
          customer_number: external_id,
          customer_id: id_,
          new_customer: false,
          status: 'saved',
        });
      });
    }
  }

  focusNextOnEnter = (ref) => (event) => {
    if (event.key === 'Enter' && event.ctrlKey === true) {
      this.props.focus(this.props.position.id + 1);
    } else if (event.key === 'Enter' && ref !== null) {
      ref && ref.focus && ref.focus();
    }
  };

  onCustomerSelectInputKeyDown(event) {
    if (event.key === 'Enter' && event.ctrlKey === true) {
      this.props.nextRef && this.props.nextRef.focus();
    }
  }

  onStreetSelectInputKeyDown(event) {
    if (event.key === 'Enter') {
      this.bzRef && this.bzRef.focus();
    }
  }

  idFilter(option, filter) {
    return true;
  }

  setCustomer = (customer) => {
    let merged_customer = R.mergeRight(this.state.customer, customer);
    console.log('setCustomer',this.state.customer, merged_customer);
    this.props.setCustomer(merged_customer);
    this.setState({ customer: merged_customer });
  };

  render() {
    const { position, removePosition } = this.props;
    let name = {
      name: this.props.customer.customer_name,
      prop: 'customer_name',
    };
    let data = this.props.customer;
    if (this.state.customer === null)
    this.setState({ customer: data });
    if (this.props.customer.customer_anon)
      name = { name: data.anon_name, prop: 'anon_name' };
    return (
      <Container fluid>
        <Row>
          <Col xs={12}>
            <Form>
              {data.new_customer || data.customer_anon ? (
                <FormGroup controlId='secondRow' className='row'>
                  <Col xs={12}>
                    {data.street_selected ? (
                      <InputGroup style={{ width: '100%' }} className='second'>
                        <Form.Control
                          type='text'
                          placeholder='Strasse'
                          name='street_name'
                          value={data.street_name}
                          onChange={(event) =>
                            this.setCustomer( {
                              [event.target.name]: event.target.value,
                            })
                          }
                          onKeyPress={this.focusNextOnEnter(this.bzRef)}
                        />
                        <Button
                          onClick={() =>
                            this.setCustomer( {

                              street_selected: false,
                            })
                          }
                        >
                          <FontAwesomeIcon icon={faCircleMinus} />
                        </Button>
                      </InputGroup>
                    ) : (
                      <AsyncSelect
                        name='street_name'
                        value={data.street_name}
                        loadOptions={this.selectStreetLoadOptions}
                        autoload={false}
                        filterOption={this.streetFilter}
                        onChange={this.handleStreetSelect}
                        ignoreCase={false}
                        ignoreAccents={false}
                        ref={(ref) => (this.streetRef = ref)}
                        cacheOptions
                        defaultOptions
                        placeholder='Straße'
                      />
                    )}
                  </Col>
                </FormGroup>
              ) : (
                ''
              )}
              {data.new_customer || data.customer_anon ? (
                <FormGroup controlId='thirdRow' className='row'>
                  <Col xs={3}>
                    <Form.Control
                      type='text'
                      placeholder='BZ'
                      name='postal_code'
                      value={data.postal_code}
                      onChange={({ target }) =>
                        this.setCustomer({
                          [target.name]: target.value,
                        })
                      }
                      onKeyPress={this.focusNextOnEnter(this.numberRef)}
                      // inputRef={(ref) => this.bzRef = ref}
                    />
                  </Col>
                  <Col xs={3}>
                    <Form.Control
                      type='text'
                      placeholder='Hausnummer'
                      name='number'
                      value={data.number}
                      onChange={({ target }) =>
                        this.setCustomer({
                          [target.name]: target.value,
                        })
                      }
                      // inputRef={ref => this.numberRef = ref}
                      onKeyPress={this.focusNextOnEnter(this.stairRef)}
                    />
                  </Col>
                  <Col xs={2}>
                    <Form.Control
                      type='text'
                      placeholder='Stiege'
                      name='stair'
                      value={data.stair}
                      onChange={({ target }) =>
                        this.setCustomer({
                          [target.name]: target.value,
                        })
                      }
                      // inputRef={ref => this.stairRef = ref}
                      onKeyPress={this.focusNextOnEnter(this.levelRef)}
                    />
                  </Col>
                  <Col xs={2}>
                    <Form.Control
                      type='text'
                      placeholder='Stock'
                      name='level'
                      value={data.level}
                      onChange={({ target }) =>
                        this.setCustomer({
                          [target.name]: target.value,
                        })
                      }
                      // inputRef={ref => this.levelRef = ref}
                      onKeyPress={this.focusNextOnEnter(this.doorRef)}
                    />
                  </Col>
                  <Col xs={2}>
                    <Form.Control
                      type='text'
                      placeholder='Tuer'
                      name='door'
                      value={data.door}
                      onChange={({ target }) =>
                        this.setCustomer({
                          [target.name]: target.value,
                        })
                      }
                      // inputRef={ref => this.doorRef = ref}
                      onKeyPress={this.focusNextOnEnter(this.talkToRef)}
                    />
                  </Col>
                </FormGroup>
              ) : (
                ''
              )}
              {data.new_customer || data.customer_anon ? (
                <FormGroup controlId='fourth' className='row'>
                  <Col xs={6}>
                    <Form.Control
                      type='text'
                      placeholder='Ansprechperson'
                      name='talk_to'
                      value={data.talk_to}
                      onChange={({ target }) =>
                        this.setCustomer({
                          [target.name]: target.value,
                        })
                      }
                      // inputRef={ref => this.talkToRef = ref}
                      onKeyPress={this.focusNextOnEnter(this.phoneOneRef)}
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Control
                      type='text'
                      placeholder='Tel.'
                      name='phone_1'
                      value={data.phone_1}
                      onChange={({ target }) =>
                        this.setCustomer({
                          [target.name]: target.value,
                        })
                      }
                      // inputRef={ref => this.phoneOneRef = ref}
                      onKeyPress={this.focusNextOnEnter(this.phoneTwoRef)}
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Control
                      type='text'
                      placeholder='Tel.2'
                      name='phone_2'
                      value={data.phone_2}
                      onChange={({ target }) =>
                        this.setCustomer({
                          [target.name]: target.value,
                        })
                      }
                      // inputRef={ref => this.phoneTwoRef = ref}
                      onKeyPress={this.focusNextOnEnter(this.memoRef)}
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Control
                      type='text'
                      placeholder='E-Mail'
                      name='email'
                      value={data.email}
                      onChange={({ target }) =>
                      this.setCustomer({
                          [target.name]: target.value,
                        })
                      }
                      // inputRef={ref => this.phoneTwoRef = ref}
                      onKeyPress={this.focusNextOnEnter(this.memoRef)}
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Control
                      type='text'
                      placeholder='Öffnugszeiten'
                      name='email'
                      value={data.opening_hours}
                      onChange={({ target }) =>
                      this.setCustomer({
                          [target.name]: target.value,
                        })
                      }
                      // inputRef={ref => this.phoneTwoRef = ref}
                      onKeyPress={this.focusNextOnEnter(this.memoRef)}
                    />
                  </Col>
                </FormGroup>
              ) : (
                ''
              )}
            </Form>
          </Col>
        </Row>
        <Row>
          <Col xs={10}>
            {data.new_customer ? (
              <Button onClick={this.saveCustomer}>KundIn speichern</Button>
            ) : (
              ''
            )}
            {false ? `Lat = ${data.lat}, Long = ${data.long}` : ''}
            {data.hasDelayedPayment ? (
              <FormGroup controlId='fifth'>
                <FormLabel className='red'>Achtung Nachzahlung!</FormLabel>
                <Form.Control
                  as='textarea'
                  placeholder='Memo'
                  name='hasDelayedPaymentMemo'
                  value={data.hasDelayedPaymentMemo}
                  onChange={({ target }) =>
                  this.setCustomer({ [target.name]: target.value })
                  }
                />
              </FormGroup>
            ) : (
              ''
            )}
          </Col>
          {data.new_customer ? (

          <Col xs={2} style={{ float: 'right' }}>
            <Button
              onClick={(event) => {
                this.setCustomer(INITIAL_CONTRACT_FORM_STATE.customer);
              }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </Col>
          ) : (
            ''
          )}
        </Row>
      </Container>
    );
  }
}

export { CustomerDetailEdit };
