import React, { Component } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleMinus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { INITIAL_CONTRACT_FORM_STATE } from '@/constants/initialStates';
import CustomerFormModal from '@/components/CustomerFormModal.jsx';
import {
  getCustomersByNameList,
  getCustomer,
} from '@/utils/transportFunctions.jsx';

class CustomerView extends Component {
  constructor() {
    super();
    this.selectLoadOptions = this.selectLoadOptions.bind(this);
    this.selectChangeHandler = this.selectChangeHandler.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.update = this.update.bind(this);
    this.refresh = this.refresh.bind(this);
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
  componentDidMount() {
    if (this.props.customer) {
      this.setState({ customer: this.props.customer });
    }
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

  update() {
    this.setState({ showModal: false });
  }

  refresh() {
    this.setState({ showModal: false });
  }

  close() {
    this.setState({ showModal: false });
  }

  render() {
    // get the neccessary data
    if (this.state.customer || this.state.customer !== null) {
      const { setCustomer } = this.props;
      const delayedWarning = this.props.customer?.has_delayed_payment
        ? 'Kund*In hat Nachzahlung!'
        : '';
      return (
        <Row className='Customer2 customer-view'>
          <Col xs={12} className='d-flex title'>
            {this.props.hideEditButton ? (
              <></>
            ) : (
              <div className='d-flex'>
                <CustomerFormModal
                  customer={this.state.customer}
                  cl={this.close}
                  update={this.update}
                  refresh={this.refresh}
                />
                <Button
                  onClick={this.props.clearCustomer}
                  variant='danger'
                  className='ms-3'
                >
                  <FontAwesomeIcon icon={faCircleMinus} />
                </Button>
              </div>
            )}
          </Col>
          <Col xs={4} className='boldf'>
            Name:
          </Col>
          <Col xs={8}>{this.state.customer.name}</Col>
          <Col xs={4} className='boldf'>
            Adresse:
          </Col>
          <Col xs={8}>
            {this.state.customer.addresses ? (
              <div>
                {this.state.customer.addresses[0].street}{' '}
                {this.state.customer.addresses[0].number}{' '}
                {this.state.customer.addresses[0].level}{' '}
                {this.state.customer.addresses[0].door}{' '}
              </div>
            ) : (
              ''
            )}
          </Col>
          {this.state.customer.addresses && this.state.customer.addresses[0].opening_hours ? (
            <Col xs={4} className='boldf'>
              Öffnungsztn:
            </Col>
          ) : (
            ''
          )}
          {this.state.customer.addresses && this.state.customer.addresses[0].opening_hours ? (
            <Col xs={8}>{this.state.customer.addresses[0].opening_hours}</Col>
          ) : (
            ''
          )}
          {this.state.customer.phone_1 || this.state.customer.phone_2 ? (
            <Col xs={4} className='boldf'>
              Telefon:
            </Col>
          ) : (
            ''
          )}
          {this.state.customer.phone_1 || this.state.customer.phone_2 ? (
            <Col xs={8}>
              {this.state.customer.phone_1 ? (
                <a href='tel:{this.state.customer.phone_1}'>
                  {this.state.customer.phone_1}
                </a>
              ) : (
                ''
              )}
              {this.state.customer.phone_2 ? (
                <div>
                  <a href='tel:{this.state.customer.phone_2}'>
                    {this.state.customer.phone_2}
                  </a>
                </div>
              ) : (
                ''
              )}
            </Col>
          ) : (
            ''
          )}
                    {this.state.customer.email_1 ? (
            <Col xs={4} className='boldf'>
              E-Mail:
            </Col>
          ) : (
            ''
          )}
          {this.state.customer.email_1 ? (
            <Col xs={8}>
              <a href='mailto:{this.state.customer.email_1}'>
                {this.state.customer.email_1}
              </a>
            </Col>
          ) : (
            ''
          )}
          <Col xs={4} className='boldf'>
            Extra:
          </Col>
          <Col xs={8}>
            {this.state.customer.talk_to}
            {this.state.customer.talk_to_extra}
            {this.state.customer.extra}
          </Col>
          {!this.props.hidePayment ? (
            <Col xs={4} className='boldf'>
              Zahlung:
            </Col>
          ) : (
            ''
          )}
          {!this.props.hidePayment ? (
            <Col xs={8}>{this.state.customer.payment}</Col>
          ) : (
            ''
          )}
          {this.state.customer.has_delayed_payment ? (
            <Col xs={12} className='red boldf'>
              Kund*In hat Nachzahlung! <br />
              {this.state.customer.has_delayed_payment_memo}
            </Col>
          ) : (
            ''
          )}
          <Col xs={12} className='boldf'>
            {this.state.customer.memo}
          </Col>
        </Row>
      );
    }
    return <div>customer missing</div>;
  }
}

export default CustomerView;
