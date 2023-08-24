import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import ContractView from '@/components/contracts/ContractView';

class ContractModal extends Component {
  constructor() {
    super();
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
  }

  state = {
    showModal: false,
  };

  close() {
    this.setState({ showModal: false }, this.props.update);
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
          <FontAwesomeIcon icon={faSearch} size="lg" />
        </Button>

        <Modal show={this.state.showModal} onHide={this.close} dialogClassName="wideModal contract-modal" size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Auftrag bearbeiten</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ContractView contract={this.props.contract} add={this.props.add} close={this.close} />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default ContractModal;
