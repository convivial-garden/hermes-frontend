import React, { Component } from 'react';
import {
  Row,
  Col,
  FormGroup,
  FormLabel,
  Button,
  DropdownButton,
  Nav,
  InputGroup,
  Form,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AsyncSelect from 'react-select/async';
import * as R from 'ramda';
import {
  faSearch,
  faFloppyDisk,
  faFileCircleCheck,
  faTriangleExclamation,
  faHourglass,
} from '@fortawesome/free-solid-svg-icons';
import {
  getStreetNamesFast,
  putCustomer2,
} from '@/utils/transportFunctions.jsx';
import DeleteDelayedPaymentModal from '@/components/DeleteDelayedPaymentModal.jsx';
import { toast } from 'react-toastify';

const initialAddress = {
  street: '',
  number: '',
  stair: '',
  level: '',
  door: '',
  postal_code: '',
};

class CustomerForm extends Component {
  saveIcons = {
    unsaved: faFloppyDisk,
    saving: faHourglass,
    saved: faFileCircleCheck,
    error: faTriangleExclamation,
  };

  constructor() {
    super();
    this.save = this.save.bind(this);
    this.selectStreetLoadOptions = this.selectStreetLoadOptions.bind(this);
    this.streetFilter = this.streetFilter.bind(this);
    this.handleStreetSelect = this.handleStreetSelect.bind(this);
    this.state = {
      showStreetSelect: false,
      saved: 'unsaved',
      customer: {
        url: '',
        external_id: '',
        name: '',
        phone_1: '',
        phone_2: '',
        email: '',
        payment: '',
        has_delayed_payment: false,
        has_delayed_payment_memo: '',
      },
      address: {
        url: '',
        street: '',
        number: '',
        stair: '',
        level: '',
        door: '',
        postal_code: '',
        lat: null,
        long: null,
      },
    };
  }

  componentDidMount() {
    const address =
      this.props.customer.addresses[0] !== undefined
        ? this.props.customer.addresses[0]
        : initialAddress;
    const { customer } = this.props;
    this.setState((prevState) =>
      R.mergeDeepRight(prevState, { customer, address }),
    );
  }

  setStateOfCustomer(event, _) {
    this.setState((prevState) =>
      R.mergeDeepRight(
        prevState,
        R.mergeDeepRight(
          { customer: { [event.target.name]: event.target.value } },
          { saved: 'unsaved' },
        ),
      ),
    );
  }

  handleStreetSelect(value) {
    console.log("handleStreetSelect", value)
    let newPositionObject = {};
    if (value !== null) {
      const { name_street, nr, postal_code, lat, lon } =
        value.data;
      // const nr = nr_bis !== null ? `${nr_von}-${nr_bis}` : nr_von;
      newPositionObject = {
        street: name_street,
        number: nr,
        postal_code,
        lat,
        long: lon,
        lon,
      };
    }
    this.setState((prevState) =>
      R.mergeDeepRight(prevState, {
        address: newPositionObject,
        showStreetSelect: false,
      }),
    );
  }

  setStateOfAddress(event, _) {
    console.log("handleStreetSelect", event)

    this.setState((prevState) =>
      R.mergeDeepRight(
        prevState,
        R.mergeDeepRight(
          { address: { [event.target.name]: event.target.value } },
          { saved: 'unsaved' },
        ),
      ),
    );
  }

  selectStreetLoadOptions(input, callback) {
    setTimeout(() => {
      getStreetNamesFast(input).then((resp) => {
        callback(resp.data);
      });
    }, 200);
  }

  streetFilter(option, filter) {
    let hasSubstring = false;
    if (filter.includes(' ')) {
      const parts = filter.split(' ');
      parts.forEach((part) => {
        if (option.label.toLowerCase().includes(part.toLowerCase()))
          hasSubstring = true;
      });
    } else if (option.label.toLowerCase().includes(filter.toLowerCase()))
      hasSubstring = true;
    return hasSubstring;
  }

  save() {
    this.setState({ saved: 'saving' }, () => {
      const payload = R.mergeDeepRight(this.state.customer, {
        addresses: [this.state.address],
      });
      if (this.state.customer.url !== '') {
        putCustomer2(this.state.customer.url, payload).then((result) => {
          if (result.status === 200) {
            toast.success('Kunde gespeichert');
            this.setState({ saved: 'saved' });
          } else {
            toast.error('Fehler beim Speichern');
            this.setState({ saved: 'error' });
          }
        });
      } else this.setState({ saved: 'error' });
    });
  }

  render() {
    const { update } = this.props;
    const FIRSTCOLWIDTH = 12;
    const SECONDCOLWIDTH = 12;
    return (
      <Row>
        <Col xs={12} className='expad'>
          <Row>
            <Col xs={5}>
              <Row>
                <Col xs={FIRSTCOLWIDTH} className='boldf'>
                  Kundennummer:
                </Col>
                <Col xs={SECONDCOLWIDTH}>
                  <FormGroup>
                    <Form.Control
                      type='text'
                      placeholder='Kundennummer'
                      name='external_id'
                      value={this.state.customer.external_id}
                      onChange={(event) => {
                        event.persist();
                        this.setStateOfCustomer(event);
                      }}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col xs={FIRSTCOLWIDTH} className='boldf'>
                  Name:
                </Col>
                <Col xs={SECONDCOLWIDTH}>
                  <FormGroup>
                    <Form.Control
                      type='text'
                      placeholder='Name'
                      name='name'
                      value={this.state.customer.name}
                      onChange={(event) => {
                        event.persist();
                        this.setStateOfCustomer(event);
                      }}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col xs={FIRSTCOLWIDTH} className='boldf'>
                  Telefon 1:
                </Col>
                <Col xs={SECONDCOLWIDTH}>
                  <FormGroup>
                    <Form.Control
                      type='text'
                      placeholder='Telefon 1'
                      name='phone_1'
                      value={this.state.customer.phone_1}
                      onChange={(event) => {
                        event.persist();
                        this.setStateOfCustomer(event);
                      }}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col xs={FIRSTCOLWIDTH} className='boldf'>
                  Telefon 2:
                </Col>
                <Col xs={SECONDCOLWIDTH}>
                  <Form.Control
                    type='text'
                    placeholder='Telefon 2'
                    name='phone_2'
                    value={this.state.customer.phone_2}
                    onChange={(event) => {
                      event.persist();
                      this.setStateOfCustomer(event);
                    }}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={FIRSTCOLWIDTH} className='boldf'>
                  Email:
                </Col>
                <Col xs={SECONDCOLWIDTH}>
                  <Form.Control
                    type='text'
                    placeholder='Email'
                    name='email'
                    value={this.state.customer.email}
                    onChange={(event) => {
                      event.persist();
                      this.setStateOfCustomer(event);
                    }}
                  />
                </Col>
              </Row>

              <Row>
                <FormGroup>
                  <Col xs={FIRSTCOLWIDTH} className='boldf'>
                    <FormLabel>Zahlungsart:</FormLabel>
                  </Col>
                  <Col xs={SECONDCOLWIDTH}>
                    <DropdownButton
                      size='sm'
                      title={
                        this.state.customer.payment === ''
                          ? 'Zahlungsart'
                          : this.state.customer.payment
                      }
                      id='dropdown-size-small'
                      onSelect={(event) =>
                        this.setStateOfCustomer({
                          target: {
                            name: 'payment',
                            value: event,
                          },
                        })
                      }
                    >
                      <Nav.Link eventKey='Scheck'>Scheck</Nav.Link>
                      <Nav.Link eventKey='Marken'>Marken</Nav.Link>
                      <Nav.Link eventKey='Bar'>Bar</Nav.Link>
                      <Nav.Link eventKey='Liste'>Liste</Nav.Link>
                    </DropdownButton>
                  </Col>
                </FormGroup>
              </Row>

              <Row>
                <FormGroup>
                  <Row>
                    <Col xs={FIRSTCOLWIDTH} className='boldf'>
                      Nachzahlung?:
                    </Col>
                    <Col xs={2}>
                      <Button
                        active={this.state.customer.has_delayed_payment}
                        onClick={() =>
                          this.setStateOfCustomer({
                            target: {
                              name: 'has_delayed_payment',
                              value: !this.state.customer.has_delayed_payment,
                            },
                          })
                        }
                      >
                        {this.state.customer.has_delayed_payment
                          ? 'Ja'
                          : 'Nein'}
                      </Button>
                    </Col>
                    {this.state.customer.has_delayed_payment ? (
                      <Col xs={2}>
                        <DeleteDelayedPaymentModal
                          customer={this.state.customer}
                          update={update}
                        />
                      </Col>
                    ) : (
                      ''
                    )}
                  </Row>
                </FormGroup>
              </Row>

              {this.state.customer.has_delayed_payment ? (
                <Row>
                  <Col xs={FIRSTCOLWIDTH} className='boldf'>
                    Nachzahlungsmemo:
                  </Col>
                  <Col xs={SECONDCOLWIDTH}>
                    <FormGroup>
                      <Form.Control
                        as='textarea'
                        placeholder='Memo'
                        value={this.state.customer.has_delayed_payment_memo}
                        name='has_delayed_payment_memo'
                        onChange={(event) => {
                          event.persist();
                          this.setStateOfCustomer(event);
                        }}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              ) : (
                ''
              )}
            </Col>

            <Col xs={5}>
              <Row>
                <Col xs={FIRSTCOLWIDTH} className='boldf'>
                  Strasse:
                </Col>
                <Col xs={12}>
                  {this.state.showStreetSelect ? (
                    <FormGroup>
                      <AsyncSelect
                        name='street_select'
                        value={this.state.address.street}
                        loadOptions={this.selectStreetLoadOptions}
                        autoload={false}
                        filterOption={this.streetFilter}
                        onChange={(val) => {
                          this.handleStreetSelect(val);
                        }}
                        ignoreCase={false}
                        ignoreAccents={false}
                        cacheOptions
                        defaultOptions
                        placeholder='Straße'
                      />
                    </FormGroup>
                  ) : (
                    <FormGroup>
                      <InputGroup>
                        <Form.Control
                          type='text'
                          placeholder='Strasse'
                          name='street'
                          value={this.state.address.street}
                          onChange={(event) => {
                            console.log("event", event)
                            event.persist();
                            this.setStateOfAddress(event);
                          }}
                        />
                        <InputGroup>
                          <Button
                            onClick={() =>
                              this.setState({ showStreetSelect: true })
                            }
                          >
                            <FontAwesomeIcon icon={faSearch} />
                          </Button>
                        </InputGroup>
                      </InputGroup>
                    </FormGroup>
                  )}
                </Col>
              </Row>

              <Row>
                <Col xs={FIRSTCOLWIDTH} className='boldf'>
                  Hausnummer:
                </Col>
                <Col xs={9}>
                  <FormGroup>
                    <Form.Control
                      type='text'
                      placeholder='Hausnummer'
                      name='number'
                      value={this.state.address.number}
                      onChange={(event) => {
                        event.persist();
                        this.setStateOfAddress(event);
                      }}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col xs={4}>
                  <Row>
                    <Col xs={FIRSTCOLWIDTH} className='boldf'>
                      Stiege:
                    </Col>
                    <Col xs={12}>
                      <FormGroup>
                        <Form.Control
                          type='text'
                          placeholder='Stiege'
                          name='stair'
                          value={this.state.address.stair}
                          onChange={(event) => {
                            event.persist();
                            this.setStateOfAddress(event);
                          }}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </Col>
                <Col xs={4}>
                  <Row>
                    <Col xs={FIRSTCOLWIDTH} className='boldf'>
                      Stockwerk:
                    </Col>
                    <Col xs={12}>
                      <FormGroup>
                        <Form.Control
                          type='text'
                          placeholder='Stock'
                          name='level'
                          value={this.state.address.level}
                          onChange={(event) => {
                            event.persist();
                            this.setStateOfAddress(event);
                          }}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </Col>
                <Col xs={4}>
                  <Row>
                    <Col xs={FIRSTCOLWIDTH} className='boldf'>
                      Tuer:
                    </Col>
                    <Col xs={12}>
                      <FormGroup>
                        <Form.Control
                          type='text'
                          placeholder='Tuer'
                          name='door'
                          value={this.state.address.door}
                          onChange={(event) => {
                            event.persist();
                            this.setStateOfAddress(event);
                          }}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <FormGroup>
                  <Col xs={FIRSTCOLWIDTH}>
                    <FormLabel className='boldf'>Postleitzahl:</FormLabel>
                  </Col>
                  <Col xs={9}>
                    <Form.Control
                      type='text'
                      placeholder='Postleitzahl'
                      name='postal_code'
                      value={this.state.address.postal_code}
                      onChange={(event) => {
                        event.persist();
                        this.setStateOfAddress(event);
                      }}
                    />
                  </Col>
                </FormGroup>
              </Row>
            </Col>

            <Col xs={2}>
              <Button size='large' onClick={this.save} variant="success">
                <FontAwesomeIcon icon={this.saveIcons[this.state.saved]} />
              </Button>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>&nbsp;</Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default CustomerForm;
