import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import {
  ListGroup,
  ListGroupItem,
  Container,
  Row,
  Col,
  Button,
  ModalBody,
  Modal,
  ModalHeader,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import ActiveStaffEntry from '@/components/ActiveStaffEntry';
import AddStaffModal from '@/components/AddStaffModal';
import {
  getTimesByDate,
  getTimesByMonth,
} from '@/utils/transportFunctions.jsx';
import moment from 'moment';

class ActiveStaff extends Component {
  constructor() {
    super();
    this.dateChange = this.dateChange.bind(this);
    this.updateList = this.updateList.bind(this);
    this.exportTodayAsCSV = this.exportTodayAsCSV.bind(this);
    this.exportMonthAsCSV = this.exportMonthAsCSV.bind(this);
    this.exportAsCSV = this.exportAsCSV.bind(this);
    this.close = this.close.bind(this);
    this.showModal = this.showModal.bind(this);
    this.state = {
      date: new Date(),
      date_formated: moment(new Date()).format('DD.MM.YYYY'),
      date_month: moment(new Date()).format('MM.YYYY'),
      currentTimes: [],
      showModal: false,
    };
  }

  componentDidMount() {
    this.updateList(new Date());
  }

  updateList(date) {
    const dateX = date || this.state.date;

    getTimesByDate(dateX, (results) => {
      this.setState({ currentTimes: results });
    });
  }
  exportAsCSV(times_data, type) {
    const csv = times_data
      .map((data) => {
        const { start_datetime, end_datetime } = data;
        const date = moment(start_datetime).format('DD.MM.YYYY');
        const start_datetimeX = moment(start_datetime).format('HH:mm');
        const end_datetimeX = moment(end_datetime).format('HH:mm');
        let duration = moment(end_datetime).diff(
          moment(start_datetime),
          'hours',
          true,
        );
        if (duration < 0 || !(duration > 0)) duration = 0;

        return `${data.staff_member.user__first_name};${date};${start_datetimeX};${end_datetimeX};${duration}`;
      })
      .join('\n');
    const hiddenElement = document.createElement('a');
    hiddenElement.href = `data:text/csv;charset=utf-8,${encodeURI(csv)}`;
    hiddenElement.target = '_blank';
    hiddenElement.download = `personal_${type}.csv`;
    hiddenElement.click();
  }

  exportTodayAsCSV() {
    this.exportAsCSV(
      this.state.currentTimes,
      `tag_${moment(this.state.date).format('DD.MM.YYYY')}`,
    );
  }
  exportMonthAsCSV() {
    getTimesByMonth(this.state.date, (results) => {
      this.exportAsCSV(
        results,
        `monat_${moment(this.state.date).format('MM.YYYY')}`,
      );
    });
  }
  dateChange(date) {
    this.setState(
      {
        date,
        date_formated: moment(date).format('DD.MM.YYYY'),
        date_month: moment(date).format('MM.YYYY'),
      },
      this.updateList(date),
    );
  }
  close() {
    this.setState({ showModal: false });
  }
  showModal() {
    this.setState({ showModal: true });
  }
  render() {
    return (
      <Container className='activeStaffForm' fluid>
        <Row className='mb-3'>
          <Col xs={5} className='d-flex'>
            <AddStaffModal
              size='lg'
              date={this.state.date}
              label='Fahrer:innen bearbeiten'
              update={this.updateList}
              times={this.state.currentTimes}
            />
            <Button className='ms-2' onClick={this.showModal}>
              <FontAwesomeIcon icon={faFileExport} />
            </Button>
          </Col>
          <Col xs={7} className='d-flex align-items-center'>
            Datum:
            <DatePicker
              dateFormat='dd.MM.yyyy'
              selected={this.state.date}
              onChange={this.dateChange}
              className='form-control'
              calendarStartDay={1}
            />
          </Col>
        </Row>
        <Row style={{ marginBottom: '10px' }}>
          <Col xs={3}>
            <h3>Name</h3>
          </Col>
          <Col xs={3}>
            <h3>Dienstbeginn</h3>
          </Col>
          <Col xs={3}>
            <h3>Dienstende</h3>
          </Col>
          <Col xs={1}>
            <h3>Dauer</h3>
          </Col>
          <Col xs={1}>&nbsp;</Col>
        </Row>
        {this.state.currentTimes && this.state.currentTimes.length > 0 ? (
          this.state.currentTimes.map((data, index) => (
            <ActiveStaffEntry
              index={index}
              key={data.id}
              data={data}
              update={this.updateList}
            />
          ))
        ) : (
          <ListGroup>
            <ListGroupItem>
              <Row>Kein Personal an diesem Tag</Row>
            </ListGroupItem>{' '}
            <Col>
              <Button onClick={this.exportWeekAsCSV}>Woche</Button>
            </Col>
          </ListGroup>
        )}
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Stundenlisten exportieren</Modal.Title>
          </Modal.Header>
          <ModalBody>
            <Container fluid>
              <div className='d-flex'>
                <Button onClick={this.exportTodayAsCSV}>
                  Tag {this.state.date_formated}
                </Button>
                <Button onClick={this.exportMonthAsCSV} className='ms-2'>
                  Monat {this.state.date_month}
                </Button>
              </div>
            </Container>
          </ModalBody>
        </Modal>
      </Container>
    );
  }
}

export default ActiveStaff;
