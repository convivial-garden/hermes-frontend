import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
import AddressDetail from './AddressDetail';

class AddressDetailModal extends Component {
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
    this.props.update();
  }

  open() {
    this.setState({ showModal: true });
  }

  render() {
    return (
      <div>
        <Button
          variant="primary"
          size="xs"
          onClick={this.open}
        >
          {this.props.label}
        </Button>

        <Modal show={this.state.showModal} onHide={this.close} dialogClassName="wideModal">
          <Modal.Header closeButton>
            <Modal.Title>Addresse bearbeiten</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <AddressDetail id={this.props.id} url={this.props.url} add={this.props.add} close={this.close} />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default AddressDetailModal;
