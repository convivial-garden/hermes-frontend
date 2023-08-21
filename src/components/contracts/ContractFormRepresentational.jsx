import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {
  Container, Row, Col, Button, Form,
  FormGroup, FormLabel,
  InputGroup,
  Modal, Card,
} from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import { faTrash, faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ContractFormTimesForm from '@/components/contracts/ContractFormTimesForm.jsx';
import { INITIAL_CONTRACT_FORM_STATE } from '@/constants/initialStates.js';
import {
  getCustomersByNameList,
  getCustomer,
  getStreetNamesFast,
  putDelayedPayment,
  postNewCustomer,
  getCustomersByExternalIdList,
  getSettings,
} from '@/utils/transportFunctions.jsx';
import 'react-datepicker/dist/react-datepicker.css';

const emptyContractForm = {
  customer_url: '',
  customer_name: '',
  customer_number: '-1',
  street_name: '',
  postal_code: '',
  number: '',
  level: '',
  stair: '',
  door: '',
  phone_1: '',
  email: '',
  payment: 'Bar',
};

class ContractFormRepresentational extends Component {
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
    this.onCustomerSelectInputKeyDown = this.onCustomerSelectInputKeyDown.bind(this);
    this.selectChangeHandler = this.selectChangeHandler.bind(this);
    this.handleNewId = this.handleNewId.bind(this);
    this.hasDelayedPayment = null;
    this.bzRef = null;
    this.numberRef = null;
    getSettings().then((response) => this.setState({ settings: response }));
  }

  state = {
    street: '',
    showModal: false,
    settings: null,
  };

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }

  setNewCustomer() {
    this.props.setStateOfPosition(this.props.position.id, { new_customer: true, ...emptyContractForm });
  }

  componentDidUpdate() {
    this.nameRef = this.props.getInputRef;
  }

  selectChangeHandler(val) {
    if (val === null || val.value === 'neu' || val.value === 'anon') {
      if (this.props.position.id === 0) {
        this.props.setStateOfContract('customer', '');
      }
      this.props.setStateOfPosition(
        this.props.position.id,
        {

          ...INITIAL_CONTRACT_FORM_STATE,
          new_customer: val.value === 'neu',
          customer_anon: (val.value === 'anon'),
        },
        this.focusNameSelect,
      );
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
        };
        if (response.has_delayed_payment) this.open();

        if (this.props.position.id === 0) {
          this.props.setStateOfContract('customer', url);
        }
        this.props.setStateOfPosition(this.props.position.id, obj, () => { this.streetRef && this.streetRef.focus && this.streetRef.focus(); });
      });
    }
  }

  selectLoadOptions(input, callback) {
    setTimeout(() => {
      const options = [];
      getCustomersByNameList(input, ((response) => {
        response.forEach((customer) => {
          const { id, name, url } = customer;
          options.push({ value: id, label: name, url });
        });
        options.push({ value: 'neu', label: 'Neuer Kunde' });
        options.push({ value: 'anon', label: 'Anonym' });
        callback(options);
      }));
    }, 100);
  }

  selectStreetLoadOptions(input, callback) {
    if (input.length < 4) return;
    setTimeout(() => {
      getStreetNamesFast(input)
        .then((resp) => {
          callback(resp.data);
        });
    }, 200);
  }

  handleStreetSelect(val) {
    let newPositionObject = {};
    let nr = '';
    if (val !== null) {
      if (val.data.nr_bis !== null) nr = `${val.data.nr_von}-${val.data.nr_bis}`;
      else nr = val.data.nr_von;
      newPositionObject = {
        street_name: val.data.name_street,
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
    this.props.setStateOfPosition(this.props.position.id, newPositionObject, () => { this.bzRef && this.bzRef.focus && this.bzRef.focus(); });
  }

  handleDelayedPayement() {
    this.props.setStateOfPosition(this.props.position.id, { hasDelayedPayment: !this.props.position.data.hasDelayedPayment }, () => {
      if (this.props.position.data.customer_url !== '') putDelayedPayment(this.props.position.data.customer_url, { has_delayed_payment: this.props.position.data.hasDelayedPayment });
    });
  }

  streetFilter(option, filter) {
    let hasSubstring = false;
    if (filter.includes(' ')) {
      const parts = filter.split(' ');
      parts.forEach((part) => {
        if (option.label.toLowerCase().includes(part.toLowerCase())) hasSubstring = true;
      });
    } else if (option.label.toLowerCase().includes(filter.toLowerCase())) hasSubstring = true;
    return hasSubstring;
  }

  nameFilter(option, filter) {
    let hasSubstring = false;
    if (filter.includes(' ')) {
      const parts = filter.split(' ');
      parts.forEach((part) => {
        if (option.label.toLowerCase().includes(part.toLowerCase())) hasSubstring = true;
      });
    } else if (option.label.toLowerCase().includes(filter.toLowerCase())) hasSubstring = true;
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
      this.props.setStateOfPosition(this.props.position.id, { [val.target.name]: val.target.value });
    }
  }

  saveCustomer() {
    if (this.props.position.data.customer_url === '' && this.props.position.data.new_customer === true) {
      postNewCustomer(this.props.position.data)
        .then((resp) => {
          const { url, id: id_, external_id } = resp;
          this.props.setStateOfPosition(
            this.props.position.id,
            {
              customer_url: url,
              customer_number: external_id,
              customer_id: id_,
              new_customer: false,
              status: 'saved',
            },
          );
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

  selectbyIdLoadOptions(input, callback) {
    setTimeout(() => {
      const options = [];
      if (input.length > 2) {
        getCustomersByExternalIdList(input, ((response) => {
          response.forEach((customer) => {
            const {
              id, external_id, name, url,
            } = customer;
            options.push({
              value: id, label: `${external_id} ${name}`, url, name, external_id,
            });
          });
          options.push({ value: 'neu', label: 'Neuer Kunde' });
          callback(options);
        }));
      } else {
        options.push({ value: 'neu', label: 'Neuer Kunde' });
        callback(options);
      }
    }, 100);
  }

  idFilter(option, filter) {
    return true;
  }

  render() {
    const { position, setStateOfPosition, removePosition } = this.props;
    const { data, id } = position;
    let name = { name: data.customer_name, prop: 'customer_name' };
    if (data.customer_anon) name = { name: data.anon_name, prop: 'anon_name' };

    return (

      <Card className={data.hasDelayedPayment ? 'delayed-payment-customer' : ''}>
        <Container fluid>
          {data.hasDelayedPayment}
          <Row style={{ textAlign: 'center' }}>
            <Col xs={12} style={{ paddingTop: '5px', paddingBottom: '10px' }}>
              {/* <ToggleButtonGroup type="radio" value={data.payment}
                name="payment"
                onChange={(event) => setStateOfPosition(id, { payment: event })}
              >
                <ToggleButton value={"Scheck"}>
                  Scheck
                </ToggleButton>
                <ToggleButton value={'Marken'}>
                  Marken
                </ToggleButton>
                <ToggleButton value={'Bar'}>
                  Bar
                </ToggleButton>
                <ToggleButton value={'Liste'}>
                  Liste
                </ToggleButton>
              </ToggleButtonGroup> */}
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Form>
                <FormGroup controlId="firstRow" className="row customer-search">
                  <Col xs={8}>
                    <Row>
                      {(data.new_customer || data.customer_url !== '' || data.customer_anon)
                        ? (
                          <InputGroup style={{ width: '90%' }}>
                            <Form.Control
                              type="text"
                              placeholder="Name"
                              name="customer_name"
                              value={name.name}
                              ref={this.props.inputRef}
                              onChange={(event) => setStateOfPosition(id, { [name.prop]: event.target.value })}
                            // inputRef={this.props.inputRefTwo}
                              onKeyPress={this.focusNextOnEnter(this.streetRef)}
                              style={{ width: '90%' }}
                            />
                            <Button
                              onClick={() => setStateOfPosition(id, {
                                new_customer: false,
                                customer_anon: name.prop === 'anon_name',
                                anon_name: '',
                                customer_url: '',
                              })}
                            >
                              <FontAwesomeIcon icon={faCircleMinus} />
                            </Button>
                          </InputGroup>
                        )
                        : (
                          <InputGroup className="highest-z" style={{ width: '100%' }}>
                            <AsyncSelect
                              name="customer_name"
                              value={data.customer_name}
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
                    {data.new_customer
                      ? (
                        <InputGroup>
                          <Form.Control
                            type="text"
                            placeholder="Kd-Nr"
                            name="customer_number"
                            value={data.customer_number}
                            onChange={this.handleNewId}
                          />
                        </InputGroup>
                      )
                      : (
                        <AsyncSelect
                          name="customer_number"
                          value={{ label: data.customer_number }}
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

                <FormGroup controlId="secondRow" className="row">
                  <Col xs={12}>
                    {data.street_selected
                      ? (
                        <InputGroup style={{ width: '100%' }} className="second">
                          <Form.Control
                            type="text"
                            placeholder="Strasse"
                            name="street_name"
                            value={data.street_name}
                            onChange={(event) => setStateOfPosition(id, { [event.target.name]: event.target.value })}
                            onKeyPress={this.focusNextOnEnter(this.bzRef)}
                          />
                          <Button
                            onClick={() => setStateOfPosition(id, { street_selected: false })}
                          >
                            <FontAwesomeIcon icon={faCircleMinus} />
                          </Button>
                        </InputGroup>
                      )
                      : (
                        <AsyncSelect
                          name="street_name"
                          value={data.street_name}
                          loadOptions={this.selectStreetLoadOptions}
                          autoload={false}
                          filterOption={this.streetFilter}
                          onChange={this.handleStreetSelect}
                          ignoreCase={false}
                          ignoreAccents={false}
                          ref={(ref) => this.streetRef = ref}
                          cacheOptions
                          defaultOptions
                          placeholder="Straße"
                        />
                      )}

                  </Col>
                </FormGroup>

                <FormGroup controlId="thirdRow" className="row">
                  <Col xs={3}>
                    <Form.Control
                      type="text"
                      placeholder="BZ"
                      name="postal_code"
                      value={data.postal_code}
                      onChange={({ target }) => setStateOfPosition(id, { [target.name]: target.value })}
                      onKeyPress={this.focusNextOnEnter(this.numberRef)}
                      // inputRef={(ref) => this.bzRef = ref}
                    />
                  </Col>
                  <Col xs={3}>
                    <Form.Control
                      type="text"
                      placeholder="Hausnummer"
                      name="number"
                      value={data.number}
                      onChange={({ target }) => setStateOfPosition(id, { [target.name]: target.value })}
                      // inputRef={ref => this.numberRef = ref}
                      onKeyPress={this.focusNextOnEnter(this.stairRef)}
                    />
                  </Col>
                  <Col xs={2}>
                    <Form.Control
                      type="text"
                      placeholder="Stiege"
                      name="stair"
                      value={data.stair}
                      onChange={({ target }) => setStateOfPosition(id, { [target.name]: target.value })}
                      // inputRef={ref => this.stairRef = ref}
                      onKeyPress={this.focusNextOnEnter(this.levelRef)}
                    />
                  </Col>
                  <Col xs={2}>
                    <Form.Control
                      type="text"
                      placeholder="Stock"
                      name="level"
                      value={data.level}
                      onChange={({ target }) => setStateOfPosition(id, { [target.name]: target.value })}
                      // inputRef={ref => this.levelRef = ref}
                      onKeyPress={this.focusNextOnEnter(this.doorRef)}
                    />
                  </Col>
                  <Col xs={2}>
                    <Form.Control
                      type="text"
                      placeholder="Tuer"
                      name="door"
                      value={data.door}
                      onChange={({ target }) => setStateOfPosition(id, { [target.name]: target.value })}
                      // inputRef={ref => this.doorRef = ref}
                      onKeyPress={this.focusNextOnEnter(this.talkToRef)}
                    />
                  </Col>
                </FormGroup>

                <FormGroup controlId="fourth" className="row">
                  <Col xs={6}>
                    <Form.Control
                      type="text"
                      placeholder="Ansprechperson"
                      name="talk_to"
                      value={data.talk_to}
                      onChange={({ target }) => setStateOfPosition(id, { [target.name]: target.value })}
                      // inputRef={ref => this.talkToRef = ref}
                      onKeyPress={this.focusNextOnEnter(this.phoneOneRef)}
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Control
                      type="text"
                      placeholder="Tel."
                      name="phone_1"
                      value={data.phone_1}
                      onChange={({ target }) => setStateOfPosition(id, { [target.name]: target.value })}
                      // inputRef={ref => this.phoneOneRef = ref}
                      onKeyPress={this.focusNextOnEnter(this.phoneTwoRef)}
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Control
                      type="text"
                      placeholder="Tel.2"
                      name="phone_2"
                      value={data.phone_2}
                      onChange={({ target }) => setStateOfPosition(id, { [target.name]: target.value })}
                      // inputRef={ref => this.phoneTwoRef = ref}
                      onKeyPress={this.focusNextOnEnter(this.memoRef)}
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Control
                      type="text"
                      placeholder="E-Mail"
                      name="email"
                      value={data.email}
                      onChange={({ target }) => setStateOfPosition(id, { [target.name]: target.value })}
                      // inputRef={ref => this.phoneTwoRef = ref}
                      onKeyPress={this.focusNextOnEnter(this.memoRef)}
                    />
                  </Col>
                </FormGroup>

                <FormGroup controlId="fourth" className="row">
                  <ContractFormTimesForm
                    time={data.start_time}
                    setStateOfPosition={setStateOfPosition}
                    mode={data.start_mode}
                    id={id}
                  />

                </FormGroup>

                <FormGroup controlId="fifth">
                  <FormLabel>MEMO</FormLabel>
                  <Form.Control
                    as="textarea"
                    placeholder="MEMO"
                    name="notes"
                    value={data.notes}
                    onChange={({ target }) => setStateOfPosition(id, { [target.name]: target.value })}
                    // inputRef={ref => this.memoRef = ref}
                    onKeyPress={this.focusNextOnEnter(null)}
                  />
                </FormGroup>

              </Form>
            </Col>
          </Row>
          <Row>
            <Col xs={10}>
              {data.new_customer
                ? (
                  <Button
                    onClick={this.saveCustomer}
                  >
                    KundIn speichern
                  </Button>
                )
                : ''}
              {false
                ? (`Lat = ${data.lat}, Long = ${data.long}`)
                : ''}
              <Button
                name="hasDelayedPayment"
                active={data.hasDelayedPayment}
                onClick={() => { this.handleDelayedPayement(); }}
              >
                Nachzahlung
              </Button>
              {data.hasDelayedPayment
                ? (
                  <FormGroup controlId="fifth">
                    <FormLabel className="red">Achtung Nachzahlung!</FormLabel>
                    <Form.Control
                      as="textarea"
                      placeholder="Memo"
                      name="hasDelayedPaymentMemo"
                      value={data.hasDelayedPaymentMemo}
                      onChange={({ target }) => setStateOfPosition(id, { [target.name]: target.value })}
                    />
                  </FormGroup>
                )
                : ''}
            </Col>
            <Col xs={2} style={{ float: 'right' }}>
              <Button
                onClick={(event) => {
                  if (id > 1) removePosition(id);
                  else setStateOfPosition(id, INITIAL_CONTRACT_FORM_STATE);
                }}
              >
                <FontAwesomeIcon icon={faTrash} />

              </Button>
            </Col>
          </Row>
        </Container>
        <div>
          <Modal show={this.state.showModal} onHide={this.close} dialogClassName="smallModal">
            <Modal.Header closeButton>
              <Modal.Title><span className="red">Dieser Kunde hat eine Nachzahlung!</span></Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Button onClick={this.close}>OK</Button>
            </Modal.Body>
          </Modal>
        </div>
      </Card>
    );
  }
}

export { ContractFormRepresentational };
