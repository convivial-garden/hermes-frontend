import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import moment from 'moment';
import { ADDZONEPRICE } from '@/constants/prices';

class ContractPositionB extends Component {
  render() {
    // get the neccessary data
    const {
      start_time,
      start_time_to,
      customer,
      is_cargo: cargo,
      is_express: express,
      weight_size_bonus: weightsize,
      is_bigbuilding: bigb,
      get_there_bonus: getthere,
      waiting_bonus: waiting,
      zone: pos_zone,
      price: pos_price,
      bonus: pos_bonus,
      anon_name,
    } = this.props.position;
    let address = this.props.position.address;
    if (this.props.position.customer_is_drop_off) {
      if (this.props.contract.customer)
      address = this.props.contract.customer.addresses;
    } else {
      if (
        this.props.position.customer &&
        this.props.position.customer.addresses.length > 0
      )
        address = this.props.position.customer.addresses;
    }

    if (address[0] || customer.addresses[0]) {
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

      const { street, number, stair, level, door, postal_code } = address[0];
      let nameTmp = customer !== null
        ? customer.name === '_anon'
          ? anon_name
          : customer.name
        : '';
        if (this.props.position.customer_is_drop_off && this.props.contract.customer) {
          nameTmp = this.props.contract.customer?.name;
        } 
      const name = nameTmp

      const weightOrSize = weightsize === 'weight' ? 'GZ' : 'GZ';
      const sameDay = moment(start_time).isSame(this.props.date, 'day');
      const cargoStr = cargo ? 'C' : '';
      const expressStr = express ? 'EXP' : '';
      const buildingStr = bigb ? 'GG' : '';
      const anfahrtStr = getthere > 0.0 ? 'ANF' : '';
      const waitingStr = waiting > 0 ? 'WZ' : '';
      const weightsizeStr = weightsize !== '' ? weightOrSize : '';
      const extraStr = (
        <span style={{ color: 'red', fontWeight: 'bolder' }}>
          {cargoStr !== '' ? `${cargoStr}, ` : ''}
          {expressStr !== '' ? `${expressStr}, ` : ''}
          {buildingStr !== '' ? `${buildingStr}, ` : ''}
          {anfahrtStr !== '' ? `${anfahrtStr}, ` : ''}
          {waitingStr !== '' ? `${waitingStr}, ` : ''}
          {weightsizeStr !== '' ? `${weightsizeStr}, ` : ''}
        </span>
      );

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
        <Row className='contract-position-b'>
          <Col xs={4}>
            <Row>
              <Col xs={2} className='mh boldf'>
                {postal_code}
              </Col>
              <Col xs={10} className='mh'>
                <Row>
                  <Col xs={12} className='boldf'>
                    {name}
                  </Col>
                  <Col xs={6}>
                    {street}
                  </Col>
                  <Col xs={4}>
                <Row>
                  <Col xs={4} className='mh'>
                    {number}
                  </Col>
                  <Col xs={1} className='mh'>
                    {stair ? `/${stair}` : ''}
                  </Col>
                  <Col xs={1} className='mh'>
                    {level ? `/${level}` : ''}
                  </Col>
                  <Col xs={1} className='mh'>
                    {door ? `/${door}` : ''}
                  </Col>
                </Row>
              </Col>
                </Row>
              </Col>

            </Row>
          </Col>
          <Col xs={2} className='timec'>
            {positionDate ? `${positionDate}: ` : ''}
            {positionTime}
            {positionTimeTo !== positionTime ? ' - ' + positionTimeTo : ''}
          </Col>
          <Col xs={2} className='bonu_s'>
            {extraStr}
          </Col>
          <Col xs={4}>
            <Row className=''>
              <Col xs={12}>
              {this.props.first ? (
                <div className='gesamt'>
                  <span>Gesamt: </span>
                  <span className='boldf'>
                    {this.props.contract.price} €{' '}
                    {this.props.contract.extra != 0 ? '+zs' : ''}
                  </span>
                </div>
              ) : (
                ''
              )}
              </Col>
            </Row>
            <Row className='ps-3'>
              {Math.floor(this.props.contract.price / ADDZONEPRICE)} Mark.
            </Row>
            <Row
              className={
                (this.props.idx % 2 === 0 ? 'blgg' : 'blg') +
                (this.props.exprs ? ' red' : '')
              }
            >
              <Col xs={12} md={12}>
                <Row>
                  <Col
                    xs={12}
                    style={{
                      border: this.props.first
                        ? '3px solid #000'
                        : '2px solid #000',
                    }}
                  >
                    {this.props.first ? (
                      <Row>
                        <Col xs={12} className='bbo' />
                      </Row>
                    ) : (
                      ''
                    )}
                    <Row>
                      <Col
                        xs={4}
                        className={`bro bbo${this.props.first ? ' bto' : ''}`}
                      >
                        Zn {pos_zone}
                      </Col>
                      <Col
                        xs={8}
                        className={`blo bbo${this.props.first ? ' bto' : ''}`}
                      >
                        {(pos_price + pos_bonus).toFixed(2)} €
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
              {delayedWarning !== '' ? (
              <Col xs={12}>
                <Row>
                  <Col xs={12} className='mh red boldf'>
                    {delayedWarning}
                  </Col>
                </Row>
              </Col>
              ) : (
                ''
              )}
            </Row>
            <Row>
              <Col xs={12}>{memoWarning}</Col>
            </Row>
          </Col>
        </Row>
      );
    }
    return (
      <Row>
        <Col xs={12}>
          <div className='warning'>
            <b> Falsche Adresse/ Lieferadresse existiert nicht (mehr).</b>
          </div>
        </Col>
      </Row>
    );
  }
}

export default ContractPositionB;
