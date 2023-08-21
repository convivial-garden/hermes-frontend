import React, { Component } from 'react';
import {
  Modal,
  Button,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import CustomerForm from './CustomerForm';
import { deleteCustomer } from '@/utils/transportFunctions.jsx';

class CustomerFormModal extends Component {
  constructor() {
    super();
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    this.delete = this.delete.bind(this);
  }

  state = {
    showModal: false,
    showDeleteModal: false,
  };

  close() {
    this.setState({ showModal: false }, this.props.update);
    this.setState({ showDeleteModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }
  show

  delete() {
    // trigger confirmation popup


    deleteCustomer(this.props.customer.id, this.props.refresh);
    
    this.setState({ showModal: false });
  }
  showDeleteModalFunc() {
    this.setState({ showDeleteModal: true });
  }

  render() {
    const { customer, update } = this.props;
    return (
      <div>
        <Button
          onClick={this.open}
          size="small"
        >
          <FontAwesomeIcon icon={faSearch} />
        </Button>

        <Modal show={this.state.showModal} onHide={this.close} dialogClassName="wideModal" size="lg">
          <Modal.Header closeButton>
            <Modal.Title>KundIn bearbeiten</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <CustomerForm key={customer.id} customer={customer} cl="blgg" update={update} />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.showDeleteModalFunc}>Delete</Button>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
        <Modal show={this.state.showDeleteModal} onHide={this.close} dialogClassName="wideModal" size="lg">
          <Modal.Header closeButton>
            <Modal.Title>KundIn löschen</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Wollen Sie {customer.name} wirklich löschen?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.delete}>Delete</Button>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default CustomerFormModal;
