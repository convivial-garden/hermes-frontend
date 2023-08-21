import React, { Component } from 'react';
import {
  Modal, Button, Container, Row, Col,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { deleteContract } from '@/utils/transportFunctions.jsx';

class DeleteContractModal extends Component {
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
    // this.props.update();
  }

  open() {
    this.setState({ showModal: true });
  }

  render() {
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
            <Modal.Title>Auftrag wirklich loeschen?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container fluid>
              <Row>
                <Col xs={9}>
                  <Button onClick={() => { deleteContract(this.props.url, () => { this.close(); this.props.update(); }); }}>Ja</Button>
                </Col>
                <Col xs={3}>
                  <Button onClick={this.close}>Nein</Button>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          {/* <Modal.Footer> */}
          {/* <Button onClick={this.close}>Close</Button> */}
          {/* </Modal.Footer> */}
        </Modal>
      </div>
    );
  }
}

export default DeleteContractModal;
