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
  Modal,
  Card,
} from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import { faTrash, faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ContractFormTimesForm from '@/components/contracts/ContractFormTimesForm.jsx';
import Customer from '@/components/contracts/Customer.jsx';
import ContractBonusButtons from '@/components/contracts/ContractBonusButtons.jsx';
import {
  INITIAL_CONTRACT_FORM_STATE,
  emptyContractForm,
} from '@/constants/initialStates.js';
import {
  getStreetNamesFast,
  putDelayedPayment,
  postNewCustomer,
  getCustomersByExternalIdList,
  getSettings,
} from '@/utils/transportFunctions.jsx';
import 'react-datepicker/dist/react-datepicker.css';
import { CustomerDetailEdit } from './CustomerDetailEdit';

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
  };

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }

  setNewCustomer() {
    this.props.setStateOfPosition(this.props.position.id, {
      new_customer: true,
      ...emptyContractForm,
    });
  }

  handleBonusButtonChange(id, event, buttonState) {
    const value =
      buttonState !== undefined ? buttonState : String(event.target.value);
    const { name } = event.target;
    this.props.setStateOfPosition(id, { [name]: value }, () => {});
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
    this.props.setStateOfPosition(
      this.props.position.id,
      newPositionObject,
      () => {
        this.bzRef && this.bzRef.focus && this.bzRef.focus();
      },
    );
  }

  handleDelayedPayement() {
    this.props.setStateOfPosition(
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
      this.props.setStateOfPosition(this.props.position.id, {
        [val.target.name]: val.target.value,
      });
    }
  }

  saveCustomer() {
    if (
      this.props.position.data.customer_url === '' &&
      this.props.position.data.new_customer === true
    ) {
      postNewCustomer(this.props.position.data).then((resp) => {
        const { url, id: id_, external_id } = resp;
        this.props.setStateOfPosition(this.props.position.id, {
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
    console.log('setCustomer', customer);
    this.props.setStateOfPosition(this.props.position.id, customer);
  };

  render() {
    const { position, setStateOfPosition, removePosition } = this.props;
    const { data, id } = position;
    let name = { name: data.customer_name, prop: 'customer_name' };
    if (data.customer_name === "_anon") data.customer_anon = true;
    if (data.customer_anon) name = { name: data.anon_name, prop: 'anon_name' };
    return (
      <Card
        className={data.hasDelayedPayment ? 'delayed-payment-customer' : ''}
      >
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
                {position.id == 0 ? (
                  <Form.Check
                    type='checkbox'
                    label='Abholung bei Auftraggeber:in'
                    name='customer_is_pick_up'
                    checked={data.customer_is_pick_up}
                    onChange={({ target }) =>
                      setStateOfPosition(id, {
                        [target.name]: target.checked,
                      })
                    }
                  />
                ) : (
                  <Form.Check
                    type='checkbox'
                    label='Abgeben bei Auftraggeber:in'
                    name='customer_is_drop_off'
                    checked={data.customer_is_drop_off}
                    onChange={({ target }) =>
                      setStateOfPosition(id, {
                        [target.name]: target.checked,
                      })
                    }
                  />
                )}
                {(data.customer_is_pick_up && position.id == 0) ||
                (data.customer_is_drop_off && position.id !== 0) ? (
                  ''
                ) : (
                  <Customer setCustomer={this.setCustomer} customer={data} />
                )}
                {data.new_customer || data.customer_anon ? (
                  <FormGroup controlId='secondRow' className='row'>
                    <CustomerDetailEdit
                      customer={data}
                      setCustomer={(event) => {
                        console.log('setCustomer', event);
                        setStateOfPosition(id, event);
                      }}
                    ></CustomerDetailEdit>
                  </FormGroup>
                ) : (
                  ''
                )}
                <Row>
                  <Col xs={12} xl={8}>
                    <FormGroup controlId='fourth' className='row'>
                      <ContractFormTimesForm
                        start_time={data.start_time}
                        start_time_to={data.start_time_to}
                        setStateOfPosition={setStateOfPosition}
                        id={id}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={12} xl={4}>
                    {data.memo !== '' ? (
                      <Button
                        onClick={() => setStateOfPosition(id, { memo: '' })}
                      >
                        - Memo
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setStateOfPosition(id, { memo: ' ' })}
                      >
                        + Memo
                      </Button>
                    )}
                    {!data.hasDelayedPayment ? (
                      <div></div>
                    ) : (
                      // <Button
                      //   name="hasDelayedPayment"
                      //   active={data.hasDelayedPayment}
                      //   onClick={() => {
                      //     this.handleDelayedPayement();
                      //   }}
                      // >
                      //   + Nachzahlung
                      // </Button>
                      <Button
                        name='hasDelayedPayment'
                        onClick={() => {
                          this.handleDelayedPayement();
                        }}
                      >
                        - Nachzahlung
                      </Button>
                    )}
                    {id > 0 && !this.state.hasBonus ? (
                      <Button
                        name='hasBonus'
                        onClick={() => {
                          this.setState({ hasBonus: true });
                        }}
                      >
                        + Bonus
                      </Button>
                    ) : (
                      ''
                    )}
                  </Col>
                  {id > 0 && data && this.state.hasBonus ? (
                    <Col xs={12} xl={12}>
                      <ContractBonusButtons
                        handler={this.handleBonusButtonChange}
                        id={id}
                        position={data}
                      />
                    </Col>
                  ) : (
                    ''
                  )}
                </Row>

                {data.memo !== '' ? (
                  <div>
                    <FormGroup controlId='fifth'>
                      <FormLabel>MEMO</FormLabel>
                      <Form.Control
                        as='textarea'
                        placeholder='MEMO'
                        name='notes'
                        // value={data.memo}
                        onChange={({ target }) =>
                          setStateOfPosition(id, {
                            [target.name]: target.value,
                          })
                        }
                        // inputRef={ref => this.memoRef = ref}
                        onKeyPress={this.focusNextOnEnter(null)}
                      />
                    </FormGroup>
                  </div>
                ) : (
                  ''
                )}
              </Form>
            </Col>
          </Row>
          <Row>
            {id > 1 ? (
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
            ) : (
              ''
            )}
          </Row>
        </Container>
        <div>
          <Modal
            show={this.state.showModal}
            onHide={this.close}
            dialogClassName='smallModal'
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <span className='red'>Dieser Kunde hat eine Nachzahlung!</span>
              </Modal.Title>
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
