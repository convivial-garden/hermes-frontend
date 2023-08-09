import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import MapComponent from './MapComponent';

export default class MapModal extends Component {
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
    const filteredPositions = this.props.positions.filter((pos) => pos[0] && pos[1]);
    return (
      <div className="modal-z">
        <Button
          onClick={this.open}
          size="small"
        >
          <FontAwesomeIcon icon={faMapMarkerAlt} />
        </Button>

        <Modal show={this.state.showModal} onHide={this.close} dialogClassName="wideModal" size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Kartenansicht</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {filteredPositions.length > 0
              ? (
                <MapComponent
                  viewport={{ center: filteredPositions[0], zoom: 13 }}
                  height="90vh"
                  width="100%"
                  position={filteredPositions[0]}
                  positions={filteredPositions}
                />
              )
              : <p>Keine gueltigen Koordinaten im Auftrag</p>}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
