import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { getDelayedPaymentCustomers } from '../utils/transportFunctions';
import CustomerDetail from '../components/CustomerDetail';

class DelayedPaymentList extends Component {
  constructor() {
    super();

    this.update = this.update.bind(this);
  }

  state = {
    Customer: [],
  };

  componentDidMount() {
    this.update();
  }

  update() {
    getDelayedPaymentCustomers()
      .then((results) => this.setState({ Customer: results }));
  }

  render() {
    return (
      <Container fluid className="contractList bbott">
        <Row>
          <Col xs={3}>
            <h3 className="def-headline">Kunden mit Nachzahlung</h3>
          </Col>
          <Col xs={5}>
            <h4>
              {this.state.Customer.length}
              {' '}
              {this.state.Customer.length === 1 ? 'Kund*Inn' : 'KundInnen'}
            </h4>
          </Col>
          <Col xs={4} />
        </Row>
        {this.state.Customer.map((customer, index) => (
          <CustomerDetail key={customer.id} customer={customer} cl={index % 2 === 0 ? 'blg' : 'blgg'} update={this.update} />
        ))}
      </Container>
    );
  }
}

export default DelayedPaymentList;
