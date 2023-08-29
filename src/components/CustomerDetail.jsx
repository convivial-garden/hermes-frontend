import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import DeleteDelayedPaymentModal from '@/components/DeleteDelayedPaymentModal.jsx';
import CustomerFormModal from './CustomerFormModal.jsx';

const initialAddress = {
  street: '',
  number: '',
  stair: '',
  level: '',
  door: '',
  postal_code: '',
};

function CustomerDetail({ customer, cl, update, refresh }) {
  const address = customer.addresses[0];
  const { street, number, stair, level, door, postal_code } =
    address !== undefined ? address : initialAddress;
  const FIRSTCOLWIDTH = 4;
  const SECONDCOLWIDTH = 8;
  return (
    <Row>
      <Col
        xs={12}
        className={
          customer.has_delayed_payment
            ? `${cl} bto expad delayed-payment`
            : `${cl} bto expad `
        }
      >
        <Row>
          <Col xs={3}>
            <Row>
              <Col xs={1} className='boldf'>
                {customer.external_id === -1 ? '--' : customer.external_id}
              </Col>
              <Col xs={11}>
                {customer.has_delayed_payment && (
                  <FontAwesomeIcon
                    icon={faBell}
                    size='lg'
                    className='text-danger pe-2'
                  />
                )}
                {customer.name}
              </Col>
            </Row>
          </Col>

          <Col xs={3}>
            <Row>
              <Col xs={3} className='boldf'>
                Adresse:
              </Col>
              <Col xs={9}>
                {street} {number}/{stair}/{level}/{door}
                <br />
                {postal_code}
              </Col>
            </Row>
            {customer.email && (
              <Row>
                <Col xs={FIRSTCOLWIDTH} className='boldf'>
                  Email:
                </Col>
                <Col xs={SECONDCOLWIDTH}>
                  <a href={'mailto:'+customer.email}>{customer.email}</a>
                </Col>
              </Row>
            )}
          </Col>
          <Col xs={3}>
            {customer.phone_2 && (
              <Row>
                <Col xs={FIRSTCOLWIDTH} className='boldf'>
                  Telefon 1:
                </Col>
                <Col xs={SECONDCOLWIDTH}>
                  <a href={'tel:'+customer.phone_1}>{customer.phone_1}</a>
                </Col>
              </Row>
            )}
            {customer.phone_2 && (
              <Row>
                <Col xs={FIRSTCOLWIDTH} className='boldf'>
                  Telefon 2:
                </Col>
                <Col xs={SECONDCOLWIDTH}>
                  <a href={'tel:'+customer.phone_2}>{customer.phone_1}</a>
                </Col>
              </Row>
            )}
            {address && address.opening_hours && (
              <Row>
                <Col xs={FIRSTCOLWIDTH} className='boldf'>
                  Öffnungszeiten
                </Col>
                <Col xs={SECONDCOLWIDTH}>{address.opening_hours}</Col>
              </Row>
            )}
          </Col>
          <Col xs={2}>
            <Row>
              <Col xs={6} className='boldf'>
                Zahlungsart:
              </Col>
              <Col xs={6}>{customer.payment}</Col>
            </Row>

            <Row>
              <Col xs={6} className='boldf'>
                Nachzahlung?:
              </Col>
              <Col xs={2}>{customer.has_delayed_payment ? 'Ja' : 'Nein'}</Col>
              {customer.has_delayed_payment ? (
                <Col xs={2}>
                  <DeleteDelayedPaymentModal
                    customer={customer}
                    update={update}
                  />
                </Col>
              ) : (
                ''
              )}
            </Row>

            {customer.has_delayed_payment ? (
              <Row>
                <Col xs={12}>
                  <div className='boldf'>Nachzahlungsmemo:</div>
                  <br />
                  {customer.has_delayed_payment_memo}
                </Col>
              </Row>
            ) : (
              ''
            )}
          </Col>
          <Col xs={1}>
            <CustomerFormModal
              customer={customer}
              cl={cl}
              update={update}
              refresh={refresh}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>&nbsp;</Col>
        </Row>
      </Col>
    </Row>
  );
}

export default CustomerDetail;
