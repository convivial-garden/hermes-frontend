import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import moment from 'moment';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import DeleteContractModal from '@/components/contracts/DeleteContractModal.jsx';
import ContractPositionA from '@/components/contracts/ContractPositionA.jsx';
import ContractPositionB from '@/components/contracts/ContractPositionB.jsx';
import ContractModal from '@/components/contracts/ContractModal.jsx';

const WEEKDAYS = {
  Monday: 'Montag',
  Tuesday: 'Dienstag',
  Wednesday: 'Mittwoch',
  Thursday: 'Donnerstag',
  Friday: 'Freitag',
  Saturday: 'Samstag',
  'Sunday+': 'Sonntag',
};

class RepeatedContractPosition extends Component {
  render() {
    const { contract, updateContracts, date } = this.props;
    const positions = contract.positions.sort((position1, position2) => position1.id - position2.id);
    const anyisExpress = contract.positions.some((position) => position.is_express);
    return (
      <Row style={{ marginBottom: '0px', marginTop: '0px' }}>
        <Col xs={12} className={`btott exmarg ${this.props.idx % 2 === 0 ? 'blgg' : 'blg'}`}>

          {/* ROW 1 */}
          <Row style={{ marginBottom: '0px', marginTop: '0px' }}>
            {/* COL 1-1 */}
            <Col xs={12} md={4}>
              <Row>
                <Col xs={1}>
                  <DeleteContractModal update={updateContracts} url={contract.url} id={contract.id} />
                </Col>
                <Col xs={11}>
                  <ContractPositionA
                    position={positions[0]}
                    contract={contract}
                    date={date}
                    exprs={anyisExpress}
                    idx={this.props.idx}
                  />
                </Col>
              </Row>
            </Col>

            {/* COL 1-2 */}
            <Col xs={12} md={8}>
              <Row>

                {/* COL 1-2-1 */}
                <Col xs={9}>
                  {positions[1]
                    && (
                    <ContractPositionB
                      position={positions[1]}
                      contract={contract}
                      date={date}
                      first
                      exprs={anyisExpress}
                      idx={this.props.idx}
                    />
                    )}
                </Col>
                <Col xs={3}>

                  <Row>
                    <Col xs={5}>
                      <ContractModal contract={contract} update={updateContracts} />
                    </Col>
                  </Row>

                  <Row>
                    <Col xs={12}>
                      <ul>
                        {contract.repeated.days_of_the_week.split(',').map((day) => ((day.trim() !== '' && day.trim().length > 3) ? <li key={day}>{WEEKDAYS[day.trim()]}</li> : ''))}
                      </ul>
                      <div>
                        Ab
                        {' '}
                        {moment(contract.repeated.start_date).format('dd.MM.yyyy')}
&nbsp;
                        {(moment(contract.repeated.end_date).isValid() ? `bis ${moment(contract.repeated.end_date).format('dd.MM.yyyy')}` : '')}
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>

          </Row>

          {positions.length < 2 ? ''
            : positions.slice(2).map((position, index) => (
              <Row key={position.id}>

                <Col xs={0} md={4} />

                <Col xs={12} md={8}>

                  <Row>

                    <Col xs={9}>
                      {contract.type === 'einzelfahrt'
                        ? ''
                        : <FontAwesomeIcon icon={faArrowDown} size="lg" style={{ marginLeft: '500px' }} />}
                      <ContractPositionB
                        position={position}
                        contract={contract}
                        date={date}
                        idx={this.props.idx}
                        exprs={anyisExpress}
                      />
                    </Col>

                    <Col xs={2} />

                    <Col xs={1} />

                  </Row>

                </Col>

              </Row>
            ))}
        </Col>
      </Row>
    );
  }
}

export default RepeatedContractPosition;
