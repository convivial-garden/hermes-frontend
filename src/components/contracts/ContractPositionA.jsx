import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import moment from 'moment';

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

class ContractPositionA extends Component {
  render() {
    // get the neccessary data
    if (this.props.position) {
      const { start_time, start_time_to, address, anon_name } =
        this.props.position;
      let customer = this.props.contract.customer;
      if (
        this.props.position.customer_is_pick_up &&
        this.props.contract.customer
      ) {
        customer = this.props.contract.customer;
      }
      const delayedWarning =
        this.props.position &&
        this.props.position.customer &&
        this.props.position.customer.has_delayed_payment
          ? 'Kund*In hat Nachzahlung!'
          : '';
      const memoWarning =
        this.props.position.memo !== '' ? (
          <span>
            <span className='boldf'>MEMO:</span>
            &nbsp;
            <span>{`${this.props.position.memo.slice(0, 50)}...`}</span>
          </span>
        ) : (
          ''
        );
      let address_tmp = address[0];
      if (
        this.props.position.customer_is_pick_up &&
        this.props.contract.customer
      ) {
        address_tmp = this.props.contract.customer.addresses
          ? this.props.contract.customer.addresses[0]
          : null;
      }
      const { street, number, stair, level, door, postal_code } =
        address_tmp || {};
      const sameDay = moment(start_time).isSame(this.props.date, 'day');
      let nameTmp = customer !== null
        ? customer.name === '_anon'
          ? anon_name
          : customer.name
        : '';
      if (!this.props.position.customer_is_pick_up) {
        nameTmp = this.props.position.customer.name;
      } 
      const name = nameTmp
      let positionTime = '';
      let positionTimeTo = '';
      let positionDate = '';

      if (!sameDay) {
        positionDate = moment(start_time).format('dddd, DD.MM.YY');
        positionTime = moment(start_time).format('HH:mm');
        positionTimeTo = moment(start_time_to).format('HH:mm');
      } else if (!sameDay) {
        positionDate = moment(start_time).format('dddd, DD.MM.YY');
      } else {
        positionTime = moment(start_time).format('HH:mm');
        positionTimeTo = moment(start_time_to).format('HH:mm');
      }

      return (
        <Row className='contractPositionA'>
          <Col xs={3}>
            <Row>
              <Col xs={12}>
                {customer !== null ? `${name}  (${customer.external_id})` : ''}
              </Col>
              <Col xs={12} className='red boldf'>
                {delayedWarning}
              </Col>
            </Row>
          </Col>
          <Col xs={6}>
            <Row
              className={
                (this.props.idx % 2 === 0 ? 'blgg' : 'blg') +
                (this.props.exprs ? ' red' : '')
              }
            >
              <Col xs={12}>
                <Row>
                  <Col xs={2} className='mh boldf'>
                    {postal_code}
                  </Col>
                  <Col xs={10} className='mh d-flex'>
                    <Row>
                      <Col xs={12} className='boldf'>
                        {name}
                      </Col>
                      <Col xs={12}>
                        {street}{' '}
                        {number}
                        {stair ? `/${stair}` : ''}
                        {level ? `/${level}` : ''}
                        {door ? `/${door}` : ''}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
          <Col xs={3} className='timec'>
            {positionDate ? `${positionDate}: ` : ''}
            {positionTime}
            {positionTimeTo !== positionTime ? ' - ' + positionTimeTo : ''}
          </Col>
          <Col xs={12}>{memoWarning}</Col>
        </Row>
      );
    }
  }
}

export default ContractPositionA;
