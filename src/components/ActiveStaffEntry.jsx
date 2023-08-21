import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Api } from '@/utils/transportFunctions.jsx';


import moment from 'moment';

function ActiveStaffEntry({
  id, data, update, index,
}) {
  const start = new Date(data.start_datetime);
  const end = new Date(data.end_datetime);
  let duration = moment.duration(moment(end).diff(start));
  const classN = index % 2 === 0 ? 'blgg' : 'blg';
  return (
    <Row className={classN} style={{ paddingTop: '10px', paddingBottom: '10px' }}>

      <Col xs={3}>
        {data.staff_member.user__first_name}
        {' '}
        {data.mode === 'dispo' ? <span className="red"> (Dispo)</span> : ''}
      </Col>
      <Col xs={3} style={data.start_datetime !== null ? {} : { color: 'red', fontWeight: 'bold' }}>
        {data.start_datetime !== null ? moment(data.start_datetime).format('HH:mm') : 'fehlt'}
      </Col>
      <Col xs={3} style={data.end_datetime !== null ? {} : { color: 'red', fontWeight: 'bold' }}>
        {data.end_datetime !== null ? moment(data.end_datetime).format('HH:mm') : 'fehlt'}
      </Col>
      <Col xs={1}>{duration>0? `${duration.hours()}:${duration.minutes()}` : 'Ende/Start fehlt'}</Col>
      <Col xs={1}>
        <Button
          size="sm"
          onClick={() => {
            Api
              .delete(data.url)
              .then(() => {
                update();
              });
          }}
        >
          <FontAwesomeIcon icon={faTrash} />
        </Button>
      </Col>
    </Row>
  );
}
export default ActiveStaffEntry;
