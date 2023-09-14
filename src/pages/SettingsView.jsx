import React, { Component } from 'react';
import { Row, Col, Container, Form, Button } from 'react-bootstrap';
import { getSettings, saveSettings } from '@/utils/transportFunctions.jsx';
import { toast } from 'react-toastify';

export default class SettingsView extends Component {
  state = {
    settings: null,
  };

  componentDidMount() {
    getSettings().then((response) => {
      this.setState({ settings: response });
      console.log(response);
    });
  }

  changeSettingsProperty(item, val) {
    if (item !== 'id') {
      const { settings } = this.state;
      settings[item] = parseFloat(val.target.value);
      this.setState({ settings });
    }
  }

  saveSettings() {
    saveSettings(this.state.settings).then((response) => {
      toast.success('Einstellungen gespeichert');
    });
  }

  getTableBodyFromSettings() {
    return this.state.settings === null ? null : (
      <tbody>
        {Object.keys(this.state.settings).map((item, id) => (
          <tr key='{id}' id={`setting-${id}`}>
            <td>{item}</td>
            <td />
            <td>
              {item == 'city' ? (
                <Form.Control
                  onChange={(e) => this.changeSettingsProperty(item, e)}
                  step='0.1'
                  type='text'
                  value={this.state.settings[item]}
                />
              ) : (
                <Form.Control
                  onChange={(e) => this.changeSettingsProperty(item, e)}
                  step='0.1'
                  type='number'
                  value={this.state.settings[item]}
                />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    );
  }

  render() {
    return (
      <Container fluid>
        <Row>
          <Col xs={12}>
            <h1>Einstellungen</h1>
          </Col>
          <Col xs={12}>
            <table>{this.getTableBodyFromSettings()}</table>
          </Col>
          <Col xs={12}>
            <Button onClick={this.saveSettings.bind(this)}>Save</Button>
          </Col>
        </Row>
      </Container>
    );
  }
}
