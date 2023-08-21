import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import moment from 'moment';

moment.updateLocale('en', {
  weekdays: [
    'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag',
  ],
});

class ContractPositionA extends Component {
  render() {
    // get the neccessary data
    if (this.props.position) {
      const {
        start_mode,
        start_time,
        address,
        customer,
        anon_name,
      } = this.props.position;
      const delayedWarning = this.props.position && this.props.position.customer && this.props.position.customer.has_delayed_payment ? 'Kund*In hat Nachzahlung!' : '';
      const memoWarning = this.props.position.memo !== ''
        ? (
          <span>
            <span className="boldf">MEMO:</span>
&nbsp;
            <span>{`${this.props.position.memo.slice(0, 50)}...`}</span>
          </span>
        ) : '';
      const {
        street,
        number,
        stair,
        level,
        door,
        postal_code,
      } = address[0]? address[0] : {};

      const sameDay = moment(start_time).isSame(this.props.date, 'day');
      const name = customer !== null ? (customer.name === '_anon' ? anon_name : customer.name) : '';
      let positionTime = '';
      let positionDate = '';

      if (!sameDay && start_mode !== '') {
        positionDate = moment(start_time).format('dddd, DD.MM.YY');
        positionTime = moment(start_time).format('HH:mm');
      } else if (!sameDay) {
        positionDate = moment(start_time).format('dddd, DD.MM.YY');
      } else if (start_mode !== '') {
        positionTime = moment(start_time).format('HH:mm');
      }

      return (
        <Row className='contractPositionA' >
          <Col xs={12}>
            <Row>
              <Col xs={12} className="minmarg">
                <span className="boldf">
                  #
                  {this.props.contract.id}
                </span>
              </Col>
            </Row>
            <Row className={(this.props.idx % 2 === 0 ? 'blgg' : 'blg') + (this.props.exprs ? ' red' : '')}>
              <Col xs={12}>
                <Row>
                  <Col xs={12} className="mh boldf">
                    <Row>
                      <Col xs={8}>{customer !== null ? `${name}  (${customer.external_id})` : ''}</Col>
                      <Col xs={4} className="red boldf">{delayedWarning}</Col>
                    </Row>
                  </Col>
                </Row>
                <Row>
                  <Col xs={2} className="mh boldf">
                    {postal_code}
                  </Col>
                  <Col xs={5} className="mh">
                    {street}
                  </Col>
                  <Col xs={5}>
                    <Row>
                      <Col xs={4} className="mh">
                        {number}
                      </Col>
                      <Col xs={1} className="mh">
                        {stair ? `/${stair}` : ''}
                      </Col>
                      <Col xs={1} className="mh">
                        {level ? `/${level}` : ''}
                      </Col>
                      <Col xs={1} className="mh">
                        {door ? `/${door}` : ''}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              {(positionTime !== '' || positionDate !== '')
                ? (
                  <Col xs={2} className="timec">
                    {positionDate}
                    {' '}
                    {start_mode}
                    {' '}
                    {positionTime}
                  </Col>
                )
                : ''}
              <Col xs={8}>
                {memoWarning}
              </Col>
            </Row>
          </Col>
        </Row>
      );
    }
  }
}

export default ContractPositionA;
