import React from 'react';
import {
  Container, Row, Col, Button,
} from 'react-bootstrap';
import axios from 'axios';
import AddressDetailModal from './AddressDetailModal';
import { postNewAddress } from './transportFunctions';

const FIRST_COLUMN_WIDTH = 4;
const SECOND_COLUMN_WIDTH = 8;

const postNewAddressAndAddToCustomer = (url, address, callback) => {
  address.customer = url;
  postNewAddress(address, callback);
};

function CustomerListEntry({ customer, update }) {
  return (
    <Container fluid>
      <div className="list-group-item">
        <h4>{`Kundennummer ${customer.external_id}`}</h4>
        <Row>
          <Col xs={4}>
            <Row>
              <Col xs={FIRST_COLUMN_WIDTH}>
                Name:
              </Col>
              <Col xs={SECOND_COLUMN_WIDTH}>
                {customer.name}
              </Col>
            </Row>

            {/* <Row> */}
            {/* <Col xs={FIRST_COLUMN_WIDTH}> */}
            {/* Email: */}
            {/* </Col> */}
            {/* <Col xs={SECOND_COLUMN_WIDTH}> */}
            {/* {customer.email} */}
            {/* </Col> */}
            {/* </Row> */}

            {customer.phone_1
              && (
              <Row>
                <Col xs={FIRST_COLUMN_WIDTH}>
                  Telefon 1:
                </Col>
                <Col xs={SECOND_COLUMN_WIDTH}>
                  {customer.phone_1}
                </Col>
              </Row>
              )}

            <Row>
              <Col xs={FIRST_COLUMN_WIDTH}>
                Telefon 2:
              </Col>
              <Col xs={SECOND_COLUMN_WIDTH}>
                {customer.phone_2}
              </Col>
            </Row>
            <Row>
              <Col xs={FIRST_COLUMN_WIDTH}>
                Email:
              </Col>
              <Col xs={SECOND_COLUMN_WIDTH}>
                {customer.email}
              </Col>
            </Row>

            <Row>
              <Col xs={FIRST_COLUMN_WIDTH}>
                Bezahlt mit:
              </Col>
              <Col xs={SECOND_COLUMN_WIDTH}>
                {customer.payment}
              </Col>
            </Row>

            <Row>
              <Col xs={FIRST_COLUMN_WIDTH}>
                Nachzahlung ausstaendig:
              </Col>
              <Col xs={SECOND_COLUMN_WIDTH}>
                {customer.has_delayed_payment ? 'Ja' : 'Nein'}
              </Col>
            </Row>
          </Col>
          <Col xs={8}>
            <h4>Addressen:</h4>
            {customer.addresses.map((address) => (
              <div key={address.id}>
                {
                `${address.street} ${
                  address.number}/${
                  address.stair}/${
                  address.level}/${
                  address.door}/${
                  address.postal_code}, Ansprechperson:${
                  address.talk_to}`
              }
                {/* TODO deletion and then posting new address must be fixed */}
                <AddressDetailModal url={address.url} update={update} label="Bearbeiten" />
              </div>
            ))}
            <div>
              <AddressDetailModal url="" update={update} add={(address, callback) => postNewAddressAndAddToCustomer(customer.url, address, callback)} label="Addresse hinzufuegen" />
            </div>
          </Col>
        </Row>
      </div>
      <Button
        href="#0"
        onClick={
        () => {
          axios
            .delete(customer.url)
            .then(() => update());
        }
      }
      >
        Kunden entfernen
      </Button>
    </Container>
  );
}

export default CustomerListEntry;
