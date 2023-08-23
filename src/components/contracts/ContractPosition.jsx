import React, { Component } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faBicycle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import DeleteContractModal from '@/components/contracts/DeleteContractModal.jsx';
import ContractPositionA from '@/components/contracts/ContractPositionA.jsx';
import ContractPositionB from '@/components/contracts/ContractPositionB.jsx';
import ContractModal from '@/components/contracts/ContractModal.jsx';
import RiderSelect from '@/components/RiderSelect.jsx';

import {
  BACKEND,
  Api,
} from '@/utils/transportFunctions.jsx';

class ContractPosition extends Component {
  constructor() {
    super();
    this.handleRiderSelection = this.handleRiderSelection.bind(this);
    this.assignRider = this.assignRider.bind(this);
    this.assignRiderToSinglePosition = this.assignRiderToSinglePosition.bind(this);
    this.preliminarilyAssignRider = this.preliminarilyAssignRider.bind(this);
    this.cleanUpDispoObjects = this.cleanUpDispoObjects.bind(this);
  }

  state = {
    perPositionSelection: [],
  };

  handleRiderSelection(position, sequence, event) {
    let newPerPositionSelection = [];
    newPerPositionSelection = newPerPositionSelection.concat(
      this.state.perPositionSelection.slice(0, position - 1),
    );
    const newEntry = [].concat(this.state.perPositionSelection[position - 1]);
    console.log(position, sequence, event.target.value);
    newEntry[sequence] = Number.parseInt(event.target.value, 10);
    newPerPositionSelection.push(newEntry);
    newPerPositionSelection = newPerPositionSelection.concat(
      this.state.perPositionSelection.slice(position),
    );
    this.setState({ perPositionSelection: newPerPositionSelection }, () => {
      this.preliminarilyAssignRider(position, sequence, () => {
        this.props.updateContracts();
      });
    });
  }

  cleanUpDispoObjects() {
    const dispoRequests = [];

    // Clean up dispo objects
    this.state.perPositionSelection.forEach((positionSelection, index) => {
      positionSelection.forEach((selection, selIndex) => {
        if (selection === -1) {
          this.props.contract.positions.slice(1).forEach((position) => {
            const matchingDispo = position.dispo.find(
              (dispo) => dispo.position === position.id && dispo.sequence === selIndex,
            );
            if (matchingDispo !== undefined) {
              dispoRequests.push(Api.delete(matchingDispo.url));
            }
          });
        }
      });
    });

    return axios.all(dispoRequests);
  }

  // TODO default case  should be to take rider id of first selection, sequence zero and assign it to all sequence zero selections
  assignRider(callback) {
    this.props.contract.positions.slice(1).forEach((position, index) => {
      // console.log("Assigning selection from pos ", 1, " to ", index + 1);
      this.assignRiderToSinglePosition(1, () => {}, index + 1);
    });
    callback();
  }

  assignRiderToSinglePosition(positionIndex, callback, differentPos = null) {
    const posI = differentPos || positionIndex;
    const thisPosition = this.props.contract.positions[posI];
    // console.log(thisPosition.id);
    this.state.perPositionSelection[positionIndex - 1].forEach(
      (selection, index) => {
        const matchingDispo = thisPosition.dispo.find(
          (dispo) => dispo.position === thisPosition.id && dispo.sequence === index,
        );
        if (selection !== -1) {
          if (matchingDispo !== undefined) {
            if (matchingDispo.dispatched_to === selection) {
              Api.put(matchingDispo.url, { preliminary: false });
            } else {
              Api.delete(matchingDispo.url).then(() => {
                Api
                  .post(`${BACKEND}dispo/`, {
                    dispatched_to: selection,
                    position: this.props.contract.positions[posI].id,
                    sequence: index,
                    preliminary: false,
                  })
                  .then(callback);
              });
            }
          } else {
            Api
              .post(`${BACKEND}dispo/`, {
                dispatched_to: selection,
                position: this.props.contract.positions[posI].id,
                sequence: index,
                preliminary: false,
              })
              .then(callback);
          }
        } else if (matchingDispo !== undefined) {
          Api.delete(matchingDispo.url).then(callback);
        }
      },
    );
  }

  preliminarilyAssignRider(positionIndex, sequence, callback) {
    const thisPosition = this.props.contract.positions[positionIndex];
    const isNotPreliminary = this.props.contract.positions
      .map((position) => position.dispo.find((dispo) => dispo.preliminary === false))
      .some((elem) => elem !== undefined);

    const selection = this.state.perPositionSelection[positionIndex - 1][sequence];
    const existingDispo = thisPosition.dispo.find(
      (dispo) => dispo.position === thisPosition.id
        && dispo.sequence === sequence
        && dispo.dispatched_to !== selection,
    );
    const requests = [];
    if (selection !== -1) {
      if (existingDispo !== undefined) {
        requests.push(Api.delete(existingDispo.url));
      }

      requests.push(
        Api.post(`${BACKEND}dispo/`, {
          dispatched_to: selection,
          position: this.props.contract.positions[positionIndex].id,
          sequence,
          preliminary: !isNotPreliminary,
        }),
      );
    } else if (existingDispo !== undefined) {
      requests.push(Api.delete(existingDispo.url));
    }
    axios.all(requests).then(() => {
      callback();
    });
  }

  componentDidMount() {
    const newPerPositionSelection = [];
    if (
      this.state.perPositionSelection.length
      !== this.props.contract.positions.slice(1).length
    ) {
      this.props.contract.positions.slice(1).forEach((position) => {
        const newSelection = [-1, -1, -1];
        position.dispo.forEach(
          (dis) => (newSelection[dis.sequence] = dis.dispatched_to),
        );
        newPerPositionSelection.push(newSelection);
      });
    }
    this.setState({ perPositionSelection: newPerPositionSelection });
  }

  componentDidUpdate(nextProps) {
    const newPerPositionSelection = [];
    if (
      this.state.perPositionSelection.length
      !== nextProps.contract.positions.slice(1).length
    ) {
      nextProps.contract.positions.slice(1).forEach((position) => {
        const newSelection = [-1, -1, -1];
        position.dispo.forEach(
          (dis) => (newSelection[dis.sequence] = dis.dispatched_to),
        );
        newPerPositionSelection.push(newSelection);
      });
      this.setState({ perPositionSelection: newPerPositionSelection });
    }
  }

  render() {
    const {
      contract, updateContracts, riders, date,
    } = this.props;
    const positions = contract.positions.sort(
      (position1, position2) => position1.id - position2.id,
    );
    const anyisExpress = contract.positions.some(
      (position) => position.is_express,
    );
    return (
      <Row
        style={{ marginBottom: '0px', marginTop: '0px' }}
        className="contract-position"
      >
        <Col
          xs={12}
          className={`btott exmarg ${
            this.props.idx % 2 === 0 ? 'blgg' : 'blg'
          }`}
        >
          {/* ROW 1 */}
          <Row style={{ marginBottom: '0px', marginTop: '0px' }}>
            {/* COL 1-1 */}
            <Col xs={12} md={4}>
              <Row>
                <Col xs={1}>
                  #
                  {contract.id}
                  <DeleteContractModal
                    update={updateContracts}
                    url={contract.url}
                    id={contract.id}
                  />
                </Col>
                <Col xs={11}>
                  {typeof positions[0] !== 'undefined' ? (
                    <ContractPositionA
                      position={positions[0]}
                      contract={contract}
                      date={date}
                      exprs={anyisExpress}
                      idx={this.props.idx}
                    />
                  ) : (
                    ''
                  )}
                </Col>
              </Row>
            </Col>

            {/* COL 1-2 */}
            <Col xs={12} md={8}>
              <Row>
                {/* COL 1-2-1 */}
                <Col xs={9}>
                  {typeof positions[1] !== 'undefined' ? (
                    <ContractPositionB
                      position={positions[1]}
                      contract={contract}
                      date={date}
                      first
                      exprs={anyisExpress}
                      idx={this.props.idx}
                    />
                  ) : (
                    ''
                  )}
                </Col>

                {/* COL 1-2-2 */}
                {this.props.archive ? (
                  <Col xs={3}>
                    <Row>
                      <Col xs={12}>&nbsp;</Col>
                    </Row>
                    <Row>
                      <Col xs={12}>&nbsp;</Col>
                    </Row>
                    {positions[1].dispo.map((entry) => (
                      <Row key={entry.url}>
                        <Col xs={12}>
                          <span className="boldf">
                            {entry.dispatched_to.name}
                          </span>
                          &nbsp; -
                          {moment(entry.created).format('DD.MM.YY')}
                          &nbsp; -
                          {moment(entry.created).format('HH:mm:ss')}
                          &nbsp;
                        </Col>
                      </Row>
                    ))}
                  </Col>
                ) : (
                  <Col xs={2}>
                    <Row>
                      <Col xs={12}>
                        {this.props.riders !== null ? (
                          <RiderSelect
                            riders={riders}
                            selection={this.state.perPositionSelection[0]}
                            handleSelection={this.handleRiderSelection}
                            position={1}
                            updateContracts={updateContracts}
                          />
                        ) : (
                          ''
                        )}
                      </Col>
                    </Row>
                  </Col>
                )}

                {this.props.archive || this.props.riders === null ? (
                  this.props.archive ? (
                    ''
                  ) : (
                    <Col xs={1}>
                      <Row>
                        <Col xs={5} style={{ marginBottom: '-9px' }}>
                          <ContractModal
                            contract={contract}
                            update={updateContracts}
                          />
                        </Col>
                      </Row>
                    </Col>
                  )
                ) : (
                  <Col xs={1}>
                    <Row>
                      <Col xs={5} style={{ marginBottom: '-9px' }}>
                        <ContractModal
                          contract={contract}
                          update={updateContracts}
                        />
                      </Col>
                      <Col xs={6} style={{ marginBottom: '-9px' }}>
                        <Button
                          onClick={() => {
                            this.assignRider(updateContracts);
                          }}
                          size="small"
                        >
                          <FontAwesomeIcon icon={faBicycle} size="lg" />
                        </Button>
                      </Col>
                    </Row>

                    <Row>
                      <Col xs={12}>&nbsp;</Col>
                    </Row>

                    <Row>
                      <Col xs={12}>
                        <Button
                          size="xs"
                          onClick={() => {
                            this.assignRiderToSinglePosition(
                              1,
                              updateContracts,
                            );
                          }}
                        >
                          Vergeben
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>

          {positions.length < 2
            ? ''
            : positions.slice(2).map((position, index) => (
              <Row key={position.id}>
                <Col xs={0} md={4} />

                <Col xs={12} md={8}>
                  <Row>
                    <Col xs={9}>
                      {contract.type === 'einzelfahrt' ? (
                        ''
                      ) : (
                        <FontAwesomeIcon
                          icon={faArrowDown}
                          size="lg"
                          style={{ marginLeft: '500px' }}
                        />
                      )}
                      {typeof position !== 'undefined' && (
                      <ContractPositionB
                        position={position}
                        contract={contract}
                        date={date}
                        idx={this.props.idx}
                        exprs={anyisExpress}
                      />
                      )}
                    </Col>

                    {this.props.archive ? (
                      <Col xs={3}>
                        <Row>
                          <Col xs={12}>
                            <Row>
                              <Col xs={12}>&nbsp;</Col>
                            </Row>
                            <Row>
                              <Col xs={12}>&nbsp;</Col>
                            </Row>
                            {position.dispo.map((entry) => (
                              <Row key={entry.url}>
                                <Col xs={12}>
                                  <span className="boldf">
                                    {entry.dispatched_to.name}
                                  </span>
                                    &nbsp; -
                                  {moment(entry.created).format('DD.MM.YY')}
                                    &nbsp; -
                                  {moment(entry.created).format('HH:mm:ss')}
                                    &nbsp;
                                </Col>
                              </Row>
                            ))}
                          </Col>
                        </Row>
                      </Col>
                    ) : (
                      <Col xs={2}>
                        <RiderSelect
                          riders={riders}
                          selection={
                              this.state.perPositionSelection[1 + index]
                            }
                          handleSelection={this.handleRiderSelection}
                          position={2 + index}
                          updateContracts={updateContracts}
                        />
                      </Col>
                    )}

                    {this.props.archive || this.props.riders === null ? (
                      ''
                    ) : (
                      <Col xs={1}>
                        <Row>
                          <Col xs={12}>
                            <Button
                              size="xs"
                              onClick={() => {
                                this.assignRiderToSinglePosition(
                                  2 + index,
                                  updateContracts,
                                );
                              }}
                            >
                              Vergeben
                            </Button>
                          </Col>
                        </Row>
                      </Col>
                    )}
                  </Row>
                </Col>
              </Row>
            ))}
        </Col>
      </Row>
    );
  }
}

export default ContractPosition;
