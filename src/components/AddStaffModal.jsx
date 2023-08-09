import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
import StaffDetail from './StaffDetail';

class AddStaffModal extends Component {
  constructor() {
    super();
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    this.state = {
      showModal: false,
    };
  }

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
          size={this.props.size}
          onClick={this.open}
        >
          {this.props.label}
        </Button>

        <Modal show={this.state.showModal} onHide={this.close} dialogClassName="wideModal rider-modal" size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Personaleinsatz bearbeiten</Modal.Title>
          </Modal.Header>

          <StaffDetail date={this.props.date} close={this.close} times={this.props.times} />
        </Modal>
      </div>
    );
  }
}

export default AddStaffModal;
