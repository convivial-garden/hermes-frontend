import React, { Component } from 'react';
import { Row, Col, Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleMinus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { INITIAL_CONTRACT_FORM_STATE } from '@/constants/initialStates';
import CustomerView from '@/components/contracts/CustomerView.jsx';
import { ContractFormRepresentational } from '@/components/contracts/ContractFormRepresentational';
import moment from 'moment';

class PositionView extends Component {
  constructor() {
    super();
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.update = this.update.bind(this);
    this.refresh = this.refresh.bind(this);
    this.model = this.modal.bind(this);
    this.state = {
      customer: INITIAL_CONTRACT_FORM_STATE,
    };
  }
  componentDidMount() {
    if (this.props.customer) {
      this.setState({ customer: this.props.customer });
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.customer !== null && this.props.customer !== '') {
      if (
        this.props.customer &&
        this.props.customer.customer_name !== this.state.customer.customer_name
      ) {
        this.setState({ customer: this.props.customer });
      }
    }
  }

  open() {
    this.setState({ showModal: true });
  }

  update() {
    this.setState({ showModal: false });
  }

  refresh() {
    this.setState({ showModal: false });
  }

  close() {
    this.setState({ showModal: false });
  }

  modal() {
    return (
      <Modal
        show={this.state.showModal}
        onHide={this.close}
        dialogClassName=''
        size='l'
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Position {this.props.position.id} bearbeiten
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ContractFormRepresentational
            contract={this.props.contract}
            position={this.props.position}
            setStateOfPosition={this.props.setStateOfPosition}
          ></ContractFormRepresentational>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.close}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  render() {
    // get the neccessary data

    if (this.state.customer || this.state.customer !== null) {
      const { setCustomer } = this.props;
      const delayedWarning = this.props.customer?.has_delayed_payment
        ? 'Kund*In hat Nachzahlung!'
        : '';
      if (this.props.position.data && !this.props.position.data.response)
        return (
          <div>
            <ContractFormRepresentational
              position={this.props.position}
              setStateOfPosition={this.props.setStateOfPosition}
            ></ContractFormRepresentational>
          </div>
        );
      if (
        this.props.position.id == 0 &&
        this.props.position.data.response.customer_is_pick_up
      ) {
        return (
          <Col xs={12}>
            Abholen bei Auftraggeber:in{' '}
            <Button variant='link' onClick={this.open}>
              <FontAwesomeIcon icon={faEdit} />
            </Button>
            {this.modal()}
            {this.props.position.data.memo ? (
              <Row>
                <Col xs={12} className='boldf'>
                  Abhol-Memo:
                </Col>
                <Col xs={12} className=''>
                  {this.props.position.data.memo}
                </Col>
              </Row>
            ) : (
              ''
            )}
          </Col>
        );
      }

      const response = this.props.position.data.response;
      const weightOrSize =
        response.weight_size_bonus === 'weight' ? 'GZ' : 'GZ';
      const sameDay = moment(this.props.position.data.start_time).isSame(
        this.props.date,
        'day',
      );
      const cargoStr = response.is_cargo ? 'C' : '';
      const expressStr = response.is_express ? 'EXP' : '';
      const buildingStr = response.is_bigbuilding ? 'GG' : '';
      const anfahrtStr = response.get_there_bonus > 0.0 ? 'ANF' : '';
      const waitingStr = response.waiting_bonus > 0 ? 'WZ' : '';
      const weightsizeStr =
        response.weightsize && response.weightsize !== '' ? weightOrSize : '';
      const extraStr = (  
        <span style={{ color: 'red', fontWeight: 'bolder' }}>
          {cargoStr !== '' ? `${cargoStr}, ` : ''}
          {expressStr !== '' ? `${expressStr}, ` : ''}
          {buildingStr !== '' ? `${buildingStr}, ` : ''}
          {anfahrtStr !== '' ? `${anfahrtStr}, ` : ''}
          {waitingStr !== '' ? `${waitingStr}, ` : ''}
          {weightsizeStr !== '' ? `${weightsizeStr}, ` : ''}
        </span>
      );
      let positionTime = '';
      let positionTimeTo = '';
      let positionDate = '';
      if (!sameDay) {
        positionDate = moment(this.props.position.data.start_time).format(
          'dddd, DD.MM.YY',
        );
        positionTime = moment(this.props.position.data.start_time).format(
          'HH:mm',
        );
        positionTimeTo = moment(this.props.position.data.start_time_to).format(
          'HH:mm',
        );
      } else if (!sameDay) {
        positionDate = moment(this.props.position.data.start_time).format(
          'dddd, DD.MM.YY',
        );
      } else {
        positionTime = moment(this.props.position.data.start_time).format(
          'HH:mm',
        );
        positionTimeTo = moment(this.props.position.data.start_time_to).format(
          'HH:mm',
        );
      }

      return (
        <Col xs={6} className='mb-2'>
          <Row className='position-view'>
            <Col xs={12} className='d-flex title'>
              <div className='d-flex'>
                {this &&
                this.props &&
                this.props.position &&
                this.props.position.id > 0
                  ? `Position ${this.props.position.id}`
                  : 'Abholen:'}
                <Button variant='link' onClick={this.open}>
                  <FontAwesomeIcon icon={faEdit} />
                </Button>
              </div>
            </Col>
            <Col xs={12} className='timec'>
              {positionDate ? `${positionDate}: ` : ''}
              {positionTime}
              {positionTimeTo !== positionTime ? ' - ' + positionTimeTo : ''}
            </Col>
            <Col xs={12} className='bonu_s'>
              {extraStr}
            </Col>
            <Col xs={11}>
              <CustomerView
                hidePayment={this.props.hidePayment}
                hideEditButton={this.props.hideCustomerEditButton}
                customer={this.props.position.data.response.customer}
                address={this.props.position.data.response.address[0]}
              />
            </Col>
            <Col xs={1}>
              <div className='d-flex'></div>
            </Col>

            {/* <CustomerView position={this.props.position.data.response.customer} /> */}

            {this.state.customer.has_delayed_payment ? (
              <Col xs={12} className='red boldf'>
                Kund*In hat Nachzahlung! <br />
                {this.state.customer.has_delayed_payment_memo}
              </Col>
            ) : (
              ''
            )}
            {this.props.position.data.memo ? (
              <Col xs={12} className='boldf'>
                Memo:
              </Col>
            ) : (
              ''
            )}
            <Col xs={12}>{this.props.position.data.memo}</Col>
          </Row>
          {this.modal()}
        </Col>
      );
    }
    return <div>customer missing</div>;
  }
}

export default PositionView;
