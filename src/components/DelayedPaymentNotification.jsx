import React, { Component } from 'react';
import {
  Modal, Button, Container, Row, Col, Glyphicon,
} from 'react-bootstrap';

class DeletePaymentNotification extends Component {
  constructor() {
    super();
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
  }

  state = {
    showModal: false,
  };

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }

  render() {
    return (
      <div>
        <Modal show={this.state.showModal} onHide={this.close} dialogClassName="smallModal">
          <Modal.Header closeButton>
            <Modal.Title>
              Wollen sie die Nachzahlung fuer KundIn
              {customer.name}
              {' '}
              wirklich loeschen?
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container fluid>
              <Row>
                <Col xs={9}>
                  <Button onClick={this.close()}>OK</Button>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default DeletePaymentNotification;
