import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import CustomerForm from './CustomerForm';
import { deleteCustomer, getCustomer2 } from '@/utils/transportFunctions.jsx';

class CustomerFormModal extends Component {
  constructor() {
    super();
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    this.delete = this.delete.bind(this);
    this.showDeleteModalFunc = this.showDeleteModalFunc.bind(this);
  }

  state = {
    showModal: false,
    showDeleteModal: false,
    customer: {},
  };

  close() {
    this.setState({ showModal: false }, this.props.update);
    this.setState({ showDeleteModal: false });
  }

  open() {
    if (!this.props.customer.addresses && this.props.customer.customer_id) {
      getCustomer2(this.props.customer.customer_id).then((response) => {
        this.setState({ customer: response.data });
        this.setState({ showModal: true });

      });
    } else {
      this.setState({ customer: this.props.customer });
      this.setState({ showModal: true });
    }
  }

  show;

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
        <Button onClick={this.open} size='small'>
          <FontAwesomeIcon icon={faEdit} />
        </Button>
        {!this.state.customer || !this.state.customer.addresses ? (
          ''
        ) : (
          <div>
            <Modal
              show={this.state.showModal}
              onHide={this.close}
              dialogClassName='wideModal'
              size='lg'
            >
              <Modal.Header closeButton>
                <Modal.Title>Kund:in bearbeiten</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <CustomerForm
                  key={this.state.customer.id}
                  customer={this.state.customer}
                  cl='blgg'
                  update={update}
                />
              </Modal.Body>
              <Modal.Footer className='space-between'>
                <Button onClick={this.showDeleteModalFunc} variant='danger'>
                  Delete
                </Button>
                <Button onClick={this.close}>Close</Button>
              </Modal.Footer>
            </Modal>
            <Modal
              show={this.state.showDeleteModal}
              onHide={this.close}
              dialogClassName='wideModal'
              size='lg'
            >
              <Modal.Header closeButton>
                <Modal.Title>KundIn löschen</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>
                  Wollen Sie
                  {this.state.customer.name} wirklich löschen?
                </p>
              </Modal.Body>
              <Modal.Footer className='space-between'>
                <Button onClick={this.delete} variant='danger'>
                  Delete
                </Button>
                <Button onClick={this.close}>Close</Button>
              </Modal.Footer>
            </Modal>
          </div>
        )}
      </div>
    );
  }
}

export default CustomerFormModal;
