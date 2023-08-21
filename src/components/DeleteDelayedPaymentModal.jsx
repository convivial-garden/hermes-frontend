import React, { Component } from 'react';
import {
  Modal, Button, Container, Row, Col,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { putDelayedPayment } from '@/utils/transportFunctions.jsx';

class DeleteDelayedPaymentModal extends Component {
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
    const { customer, update } = this.props;
    return (
      <div>
        <Button
          onClick={this.open}
          size="small"
        >
          <FontAwesomeIcon icon={faTrash} />
        </Button>

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
                  <Button onClick={() => {
                    putDelayedPayment(customer.id, { id: customer.id, has_delayed_payment: false, has_delayed_payment_memo: '' })
                      .then((resp) => {
                        update();
                        this.close();
                      });
                  }}
                  >
                    Ja
                  </Button>
                </Col>
                <Col xs={3}>
                  <Button focus onClick={this.close}>Nein</Button>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default DeleteDelayedPaymentModal;
