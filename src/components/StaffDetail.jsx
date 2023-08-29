import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  FormGroup,
  Button,
  Alert,
  ToggleButton,
  InputGroup,
  Modal,
  Form,
} from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import StaffDetailTimesForm from './StaffDetailTimesForm';
import {
  getStaffNames,
  postNewStaffMember,
  BACKEND,
  Api,
} from '@/utils/transportFunctions.jsx';

const initialState = (pos, date) => {
  const end = new Date();
  end.setHours(18);
  end.setMinutes(0);
  return {
    pos,
    date,
    new_entry: false,
    id: null,
    start_datetime: new Date(),
    start_string: '',
    end_datetime: end,
    end_string: '',
    mode: 'fahrer',
    url: '',
    times_url: '',
    name: '',
    times: [],
  };
};

class StaffDetail extends Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.saveStaff = this.saveStaff.bind(this);
    this.selectLoadOption = this.selectLoadOption.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.setDispo = this.setDispo.bind(this);
    this.setEntry = this.setEntry.bind(this);
    // this.nameFilter = this.nameFilter.bind(this);
    this.state = {
      entries: [],
      options: [],
      saved: false,
      names: [],
    };
  }

  componentDidMount() {
    let pos = 0;
    const newEntries = [];
    const { times, date } = this.props;
    if (times) {
      times.forEach((time) => {
        const start = new Date(time.start_datetime);
        const end = typeof time.end_datetime != null ? time.end_datetime : '';
        newEntries.push({
          pos,
          date,
          new_entry: false,
          id: time.staff_member.id,
          start_datetime: start,
          end_datetime: end,
          times_url: time.url,
          mode: time.mode,
          url: time.url,
          name: time.staff_member.user__first_name,
        });
        pos += 1;
      });
    }
    while (newEntries.length < 1) {
      newEntries.push(initialState(pos, date));
      pos += 1;
    }
    this.setState({ entries: newEntries });
  }

  handleChange(event, name) {
    this.setState({ [name]: event.target.value });
  }

  handleDateChange(event, name) {
    this.setState({ [name]: event.target.value });
  }

  onSelectChange(pos, val) {
    if (val === null) {
      this.setEntry(pos, initialState(pos));
    } else {
      const new_entry = val.value === 'new';
      const newURL = new_entry ? '' : `${BACKEND}staff/${val.value}/`;
      this.setEntry(pos, {
        id: val.value,
        name: val.label.replace('Neuer Kollege ', ''),
        new_entry,
        url: newURL,
      });
    }
  }

  setEntry(pos, obj) {
    this.setState((prevState) => {
      const newObject = { ...prevState.entries[pos], ...obj };
      const newEntries = [
        ...prevState.entries.slice(0, pos),
        newObject,
        ...prevState.entries.slice(pos + 1),
      ];
      return { entries: newEntries, saved: false };
    });
  }

  setDispo(event, pos) {
    this.setEntry(pos, { mode: event.target.checked ? 'dispo' : 'fahrer' });
  }

  selectLoadOption(input, callback) {
    setTimeout(() => {
      const options = [];

      if ((this.state.names && this.state.names.length === 0) || this.state.names === undefined) {
        getStaffNames((names) => {
          if (names) {
            names.forEach((name) => options.push({ value: name.id, label: name.user__first_name }));
          }
          // options.push({ value: 'new', label: `Neue:r Kollege:in ${input}` });
          if (options.length > 0) this.setState({ options });
          this.setState({ names });
          callback(options);
        });
      } else {
        this.state.names.forEach((name) => options.push({ value: name.id, label: name.user__first_name }));
        // options.push({ value: 'new', label: `Neue:r Kollege:in ${input}` });
        if (options.length > 0) this.setState({ options });
        callback(options);
      }
    }, Math.floor(
      Math.random() * (700 - 500 + 1) + 500,
    )); // avoid catching the names multiple times
  }

  addEntry() {
    const { entries } = this.state;
    entries.push(
      initialState(entries[entries.length - 1].pos + 1, this.props.date),
    );
    this.setState({ entries });
  }

  nameFilter(option, filter) {
    let hasSubstring = false;
    if (filter.includes(' ')) {
      const parts = filter.split(' ');
      parts.forEach((part) => {
        if (option.label.toLowerCase().includes(part.toLowerCase())) hasSubstring = true;
      });
    } else if (option.label.toLowerCase().includes(filter.toLowerCase())) hasSubstring = true;
    return hasSubstring;
  }

  saveStaff() {
    const requests = [];
    this.state.entries.forEach((entry) => {
      if (entry.url !== '') {
        if (entry.times_url !== '') {
          const newTimes = {
            date: this.props.date,
            start_datetime:
              entry.start_datetime !== '' ? entry.start_datetime : null,
            end_datetime: entry.end_datetime !== '' ? entry.end_datetime : null,
            mode: entry.mode,
            staff_member: `${BACKEND}staff/${entry.id}/`,
            url: entry.url,
          };
          requests.push(Api.put(entry.times_url, newTimes));
        } else {
          const newStaff = {
            user: entry.id,
            times: [
              {
                date: this.props.date,
                start_datetime:
                entry.start_datetime !== '' ? entry.start_datetime : null,
                end_datetime:
                entry.end_datetime !== '' ? entry.end_datetime : null,
                mode: entry.mode,
              },
            ],
          };
          requests.push(Api.put(entry.url, newStaff));
        }
      } else if (entry.name !== '') {
        console.log('entry2', entry);

        const newStaff = {
          name: entry.name,
          times: [
            {
              date: this.props.date,
              start_datetime:
                entry.start_datetime !== '' ? entry.start_datetime : null,
              end_datetime:
                entry.end_datetime !== '' ? entry.end_datetime : null,
              mode: entry.mode,
            },
          ],
        };

        requests.push(postNewStaffMember(newStaff));
      }
    });
    axios
      .all(requests)
      .then(() => {
        this.props.close();
      })
      .catch((error) => {
        console.log(`savestaff: ${error}`);
        this.props.close();
      });
  }

  resetSelect(pos) {
    const { entries } = this.state;
    if (entries[pos].times_url !== '') {
      let url_tmp = entries[pos].times_url;
      if (location.protocol == "https:" && url_tmp.includes('http:')) {
        url_tmp = url_tmp.replace('http:', 'https:');
      }
      Api.delete(url_tmp).then(() => {
        entries.splice(pos, 1);
        this.setState({ entries });
      });
    } else {
      entries.splice(pos, 1);
      this.setState({ entries });
    }
  }

  render() {
    const { name } = this.state;
    return (
      <div>
        <Modal.Body>
          <Container className="staff-detail">
            <FormGroup controlId="fourth" className="row rider">
              {this.state.entries.map(
                ({
                  pos,
                  id,
                  new_entry,
                  start_datetime,
                  end_datetime,
                  mode,
                }) => {
                  const timeInputCallback = (name) => (value) => this.setEntry(
                    pos,
                    { [name]: value },
                  );
                  return (
                    <Row key={pos}>
                      <Col xs={8}>
                        <InputGroup className="mb-3" style={{ width: '100%' }}>
                          {new_entry ? (
                            <Form.Control
                              type="text"
                              placeholder="Name"
                              name="name"
                              value={name}
                              onChange={(event) => this.setEntry(pos, { name: event.target.value })}
                            />
                          ) : (
                            <AsyncSelect
                              name="name"
                              value={this.state.options.find(
                                (el) => el.value === id,
                              )}
                              loadOptions={this.selectLoadOption}
                              onChange={(val) => this.onSelectChange(pos, val)}
                              filterOption={this.nameFilter}
                              style={{ width: '100%' }}
                              cacheOptions
                              defaultOptions
                              className="rider-select"
                              placeholder="Name"
                            />
                          )}
                          {id ? (
                            <Button
                              onClick={(e) => {
                                this.resetSelect(pos, e);
                              }}
                            >
                              <FontAwesomeIcon icon={faCircleMinus} />
                            </Button>
                          ) : (
                            ''
                          )}
                        </InputGroup>
                      </Col>
                      <Col xs={4}>
                        <FormGroup>
                          <ToggleButton
                            onChange={(event) => this.setDispo(event, pos)}
                            checked={mode !== 'fahrer'}
                            className="mb-2"
                            id={`toggle-check_${pos}`}
                            type="checkbox"
                            variant="outline-primary"
                            value="1"
                          >
                            Dispo?
                          </ToggleButton>
                        </FormGroup>
                      </Col>
                      <StaffDetailTimesForm
                        setEntry={this.setEntry}
                        timeInputCallback={timeInputCallback}
                        start_datetime={start_datetime}
                        end_datetime={end_datetime}
                        pos={pos}
                      />
                      <hr />
                    </Row>
                  );
                },
              )}
            </FormGroup>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Row>
            <Col xs={12}>
              <Button onClick={this.addEntry.bind(this)}>+</Button>
              <Button onClick={this.saveStaff}>Personal speichern</Button>
            </Col>
            <Col xs={12}>
              {this.state.saved ? (
                <Alert variant="success">Personal gespeichert</Alert>
              ) : (
                ''
              )}
            </Col>
          </Row>
        </Modal.Footer>
      </div>
    );
  }
}
export default StaffDetail;
