import React, { Component } from 'react';
import {
  Form,
  Container,
  Row,
  Col,
  Button,
  ListGroup,
  ListGroupItem,
  ButtonGroup,
  ToggleButton,
  FormGroup,
  Card,
} from 'react-bootstrap';
import * as R from 'ramda';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faTimes,
  faExchange,
  faArrowDown,
  faBicycle,
  faCheck,
  faClock,
} from '@fortawesome/free-solid-svg-icons';

import DatePicker from 'react-datepicker';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { NETTOBRUTTOFACTOR } from '@/constants/prices';
import {
  INITIAL_CONTRACT_FORM_STATE,
  apiResponseToInitialState,
} from '@/constants/initialStates';
import MapModal from '@/components/MapModal';
import ContractBonusButtons from '@/components/contracts/ContractBonusButtons';
import { ContractFormRepresentational } from '@/components/contracts/ContractFormRepresentational';
import {
  getAnon,
  postNewContract,
  putContract,
  postNewCustomer,
  putDelayedPayment,
  getSettings,
  Api,
} from '@/utils/transportFunctions.jsx';
import { toast } from 'react-toastify';

const SAVEICONS = {
  unsaved: faBicycle,
  saving: faClock,
  saved: faCheck,
};

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // km
  const x1 = lat2 - lat1;
  const dLat = toRad(x1);
  const x2 = lon2 - lon1;
  const dLon = toRad(x2);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(toRad(lat1))
      * Math.cos(toRad(lat2))
      * Math.sin(dLon / 2)
      * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function zoneFromDistance(distance, zone_size, addzone_size) {
  if (distance >= 0.00001) {
    const temp_dist = distance - zone_size;
    let zone = 1;
    let additionalZones = 0;
    if (temp_dist > 0) {
      additionalZones = Math.floor((temp_dist + addzone_size) / addzone_size);
    }
    zone += additionalZones;
    return zone;
  }
  return 0;
}

function markenFromPrice(price, basezoneprice) {
  return Math.floor(price / basezoneprice);
}

class ContractFormContainer extends Component {
  constructor() {
    super();
    this.addContractForm = this.addContractForm.bind(this);
    this.addWeiterfahrtForm = this.addWeiterfahrtForm.bind(this);
    this.handleCreatedDateChange = this.handleCreatedDateChange.bind(this);
    this.onContractSaveClick = this.onContractSaveClick.bind(this);
    this.setStateOfContract = this.setStateOfContract.bind(this);
    this.handleBonusButtonChange = this.handleBonusButtonChange.bind(this);
    this.setStateOfPosition = this.setStateOfPosition.bind(this);
    this.calcDistanceAndZone = this.calcDistanceAndZone.bind(this);
    this.setBonussesForAllPositions = this.setBonussesForAllPositions.bind(this);
    this.setDate = this.setDate.bind(this);
    this.Selects = [null, null];
    this.fcSelects = [null, null];
    this.nameSelect = this.nameSelect.bind(this);
    this.nextNameSelect = this.nextNameSelect.bind(this);
    this.prevNameSelect = this.prevNameSelect.bind(this);
    this.onDeleteAndClose = this.onDeleteAndClose.bind(this);
    this.saveAllCustomers = this.saveAllCustomers.bind(this);
    this.onRetourButtonClick = this.onRetourButtonClick.bind(this);
    this.onSwitchButtonClick = this.onSwitchButtonClick.bind(this);
    this.onPostToAnon = this.onPostToAnon.bind(this);
    this.removePosition = this.removePosition.bind(this);
    this.handleRepeatedContract = this.handleRepeatedContract.bind(this);
    this.changeRepeatedWeekdays = this.changeRepeatedWeekdays.bind(this);
    this.setRepeatedStartDate = this.setRepeatedStartDate.bind(this);
    this.setRepeatedEndDate = this.setRepeatedEndDate.bind(this);
    this.focusFcSelect = this.focusFcSelect.bind(this);
    window.removePosition = this.removePosition;
    window.curElement = -1;

    window.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'm') {
        event.preventDefault();
        this.onContractSaveClick();
      }

      if (event.ctrlKey && event.key === 'p') {
        event.preventDefault();
        this.addContractForm();
      }

      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        this.onContractSaveClick();
      }

      if (event.ctrlKey && event.key === 'b') {
        event.preventDefault();
        this.addWeiterfahrtForm();
      }

      if (
        (event.ctrlKey && event.key === 'ArrowRight')
        || (event.ctrlKey && event.key === 'j')
      ) {
        event.preventDefault();
        this.nameSelect(1);
      }
      if (
        (event.ctrlKey && event.key === 'ArrowLeft')
        || (event.ctrlKey && event.key === 'k')
      ) {
        event.preventDefault();
        this.nameSelect(-1);
      }
    });
    getSettings().then((response) => this.setState({ settings: response }));
  }

  state = {
    saved: 'unsaved',
    date: new Date(),
    url: '',
    id: '',
    zone: 0,
    distance: 0,
    price: 0,
    marken: 0,
    extra: 0,
    extra2: 0,
    extra2_string: '',
    customer: '',
    weightValue: '',
    getThereValue: '',
    waitingTimeValue: '',
    hasDelayedPayment: false,
    isCargo: false,
    isBigBuilding: false,
    isProvisionally: false,
    isExpress: false,
    type: '',
    isRepeated: false,
    repeatedstartdate: new Date(),
    repeatedenddate: null,
    positionsDeleteRequests: [],
    repeated: {
      days_of_the_week: '',
    },
    settings: null,
    contractForms: [
      {
        id: 0,
        data: INITIAL_CONTRACT_FORM_STATE,
      },
      {
        id: 1,
        data: INITIAL_CONTRACT_FORM_STATE,
      },
    ],
  };

  onRetourButtonClick() {
    this.addWeiterfahrtForm((id) => {
      this.setStateOfPosition(
        id,
        R.mergeDeepRight(this.state.contractForms[0].data, { }),
        () => {},
      );
    });
  }

  onSwitchButtonClick() {
    const tmp = this.state.contractForms[0].data;
    this.setStateOfPosition(0, this.state.contractForms[1].data, () => {});
    this.setStateOfPosition(1, tmp, () => {});
  }

  componentDidMount() {
    getSettings().then((response) => {
      this.setState({ settings: response });

      if (this.props.contract !== undefined) {
        let newState = {};
        const { contract } = this.props;
        let newPositions = JSON.parse(
          JSON.stringify(this.state.contractForms),
        );
        while (newPositions.length < contract.positions.length) {
          newPositions = [
            ...newPositions,
            {
              id: newPositions.length,
              data: INITIAL_CONTRACT_FORM_STATE,
            },
          ];
        }
        contract.positions.forEach((pos, index) => {
          newPositions[index].data = apiResponseToInitialState(pos);
        });
        console.log(contract);
        newState = {
          contractForms: newPositions,
          url: contract.url,
          id: contract.id,
          date: new Date(
            moment()
              .year(newPositions[0].data.start_time.year())
              .month(newPositions[0].data.start_time.month())
              .date(newPositions[0].data.start_time.date())
              .hour(moment(contract.created).hour())
              .minute(moment(contract.created).minute())
              .toISOString(),
          ),
          price: contract.price,
          extra2: contract.extra,
          extra2_string:
            contract.extra !== null ? contract.extra.toString() : '',
          type: contract.type,
          isRepeated: contract.repeated !== null,
          repeatedstartdate: contract.repeated
            ? new Date(contract.repeated.start_date)
            : new Date(),
          repeatedenddate: contract.repeated
            ? contract.repeated.end_date
              ? new Date(contract.repeated.end_date)
              : null
            : null,
          repeated: contract.repeated
            ? { days_of_the_week: contract.repeated.days_of_the_week }
            : { days_of_the_week: '' },
        };
        while (this.Selects.length < contract.positions.length) {
          this.Selects.push(0);
        }
        this.setState(newState, () => {
          this.calcDistanceAndZone();
          this.focusFcSelect(0);
        });
      }
      this.focusFcSelect(0);
    });
  }

  handleRepeatedContract() {
    this.setState((prevState) => ({ isRepeated: !prevState.isRepeated }));
  }

  changeRepeatedWeekdays(day, checked) {
    if (this.state.repeated.days_of_the_week.includes(day)) {
      this.setState((prevState) => R.mergeDeepRight(prevState, {
        repeated: {
          days_of_the_week: prevState.repeated.days_of_the_week.replace(
            `${day},`,
            '',
          ),
        },
      }));
    } else {
      this.setState((prevState) => R.mergeDeepRight(prevState, {
        repeated: {
          days_of_the_week: `${prevState.repeated.days_of_the_week + day},`,
        },
      }));
    }
  }

  addContractForm() {
    this.setState((prevState) => ({
      type: 'einzelfahrt',
      contractForms: [
        ...prevState.contractForms,
        {
          id: prevState.contractForms.length,
          data: INITIAL_CONTRACT_FORM_STATE,
        },
      ],
    }));
  }

  addWeiterfahrtForm(callback) {
    this.setState(
      (prevState) => ({
        type: 'weiterfahrt',
        contractForms: [
          ...prevState.contractForms,
          {
            id: prevState.contractForms.length,
            data: INITIAL_CONTRACT_FORM_STATE,
          },
        ],
      }),
      () => {
        if (typeof callback === 'function') {
          callback(this.state.contractForms.length - 1);
        }
      },
    );
  }

  handleCreatedDateChange(date) {
    this.setState({ date, saved: 'unsaved' });
  }

  setStateOfContract(name, value) {
    this.setState({ [name]: value, saved: 'unsaved' });
  }

  setStateOfPosition(id, newContractFormObject, callback) {
    this.setState(
      (prevState) => {
        const oldContractForm = prevState.contractForms[id];
        const newData = {
          ...oldContractForm.data,
          ...newContractFormObject,
        };
        const newContractForm = { ...oldContractForm, data: newData };
        const newContractForms = prevState.contractForms
          .slice(0, id)
          .concat([newContractForm])
          .concat(prevState.contractForms.slice(id + 1));
        return { contractForms: [...newContractForms], saved: 'unsaved' };
      },
      () => {
        if (callback === 'stop') {
        } else if (callback !== undefined) {
          callback();
          this.calcDistanceAndZone();
        }
      },
    );
  }

  removePosition(id) {
    const newPositionDeleteRequests = [];
    if (this.state.contractForms[id].data.position_url !== '') {
      newPositionDeleteRequests.push(
        this.state.contractForms[id].data.position_url,
      );
    }
    if (id > 1) {
      this.setState((prevState) => {
        const newContractForms = R.concat(
          prevState.contractForms.slice(0, id),
          prevState.contractForms.slice(id + 1),
        );
        newContractForms.forEach((form, index) => {
          if (form.id > id) {
            form.id -= 1;
          }
        });
        return R.mergeDeepRight(prevState, {
          contractForms: newContractForms,
          positionsDeleteRequests: newPositionDeleteRequests,
        });
      }, this.calcDistanceAndZone);
    }
  }

  setStateOfPositions(prevState, positions) {
    const newContractForms = [];
    positions.forEach((position) => {
      const oldContractForm = prevState.contractForms[position.id];
      const newData = { ...oldContractForm.data, ...position.data };
      const newContractForm = {
        ...oldContractForm,
        id: position.id,
        data: newData,
      };
      newContractForms.push(newContractForm);
    });
    const newState = prevState;
    newContractForms.forEach((form) => {
      newState.contractForms = newState.contractForms
        .slice(0, form.id)
        .concat([form])
        .concat(newState.contractForms.slice(form.id + 1));
    });
    return newState;
  }

  setBonussesForAllPositions() {
    const firstPos = this.state.contractForms[1].data;
    const bonusState = {
      weight_size_bonus: firstPos.weight_size_bonus,
      is_cargo: firstPos.is_cargo,
      is_express: firstPos.is_express,
      is_bigbuilding: firstPos.is_bigbuilding,
      get_there_bonus: firstPos.get_there_bonus,
      waiting_bonus: firstPos.waiting_bonus,
    };
    this.state.contractForms.slice(2).forEach((pos, index) => {
      this.setStateOfPosition(index + 2, bonusState, () => {});
    });
  }

  focusFcSelect(id) {
    if (
      this.fcSelects[id] !== null
      && typeof this.fcSelects[id] !== 'undefined'
    ) this.fcSelects[id].focus();
    else if (
      this.Selects[id] !== null
      && typeof this.Selects[id] !== 'undefined'
    ) this.Selects[id].focus();
  }

  handleBonusButtonChange(id, event, buttonState) {
    const value = buttonState !== undefined ? buttonState : String(event.target.value);
    const { name } = event.target;
    this.setStateOfPosition(id, { [name]: value }, () => {});
  }

  saveAllCustomers(callback) {
    const newCustomerRequests = [];
    const ids = [];
    this.state.contractForms.forEach(({ id, data }) => {
      if (data.customer_url === '' && data.new_customer === true) {
        newCustomerRequests.push(postNewCustomer(data));
        ids.push(id);
      }
    });
    const newPositions = [];
    axios.all(newCustomerRequests).then((resp) => {
      ids.forEach((id, index) => {
        const { url, id: id_, external_id } = resp[index];
        newPositions.push({
          id,
          data: {
            customer_url: url,
            customer_number: external_id,
            customer_id: id_,
            new_customer: false,
            status: 'saved',
          },
        });
      });
      this.setState(
        (prevState) => this.setStateOfPositions(prevState, newPositions),
        callback,
      );
    });
  }

  onPostToAnon(payload) {
    getAnon()
      .then((resp) => resp.data.url)
      .then((url) => {
        const newPayload = { ...payload, customer_url: url };
        postNewContract(newPayload);
      });
  }

  onContractSaveClick() {
    this.saveAllCustomers(() => {
      const delayedPaymentAndCustomerRequests = [];
      this.state.contractForms.forEach(({ data }) => {
        if (data.customer_url !== '') {
          delayedPaymentAndCustomerRequests.push(
            putDelayedPayment(data.customer_id, {
              id: data.customer_id,
              has_delayed_payment: data.hasDelayedPayment,
              has_delayed_payment_memo: data.hasDelayedPaymentMemo,
            }),
          );
        }
      });
      axios
        .all(
          delayedPaymentAndCustomerRequests.concat(
            this.state.positionsDeleteRequests.map((url) => {
              let url_tmp = url;
              if (location.protocol == "https:" && url_tmp.includes('http:')) {
                url_tmp = url_tmp.replace('http:', 'https:');
              }
              Api.delete(url_tmp)}),
          ),
        )
        .then(() => {
          this.setState({ saved: 'saving' }, () => {
            if (this.state.url !== '') {
              putContract(this.state, (response) => {
                this.setState(
                  { saved: response.status === 200 ? 'saved' : 'unsaved' },
                  () => {
                    if (this.props.hasOwnProperty('close')) this.props.close();
                  },
                );
              });
            } else {
              let finalType = '';
              let payload = this.state;
              if (this.state.type === '') {
                finalType = 'einzelfahrt';
                payload = { ...this.state, type: finalType };
              }
              postNewContract(payload, (response) => {

                if (response.status === 201) {
                  toast.success('Vertrag erfolgreich gespeichert');
                }
                this.setState({
                  saved: response.status === 201 ? 'saved' : 'unsaved',
                });
                this.navToContractArchive.click();
                // window.location.assign(PUBHOST);
              });
            }
          });
        });
    });
  }

  setDate(date) {
    this.state.contractForms.forEach((position, index) => {
      let newDate = moment(position.data.start_time);
      newDate = newDate
        .year(date.getFullYear())
        .month(date.getMonth() + 1)
        .date(date.getDate());
      this.setStateOfPosition(index, {
        start_time: newDate
          .year(date.getFullYear())
          .month(date.getMonth())
          .date(date.getDate()),
      });
    });
    this.setState({ date });
  }

  calcDistanceAndZone() {
    let totalDistance = 0;
    let totalPrice = 0;
    let totalExtra = 0;
    let prevCoords = {
      lat: this.state.contractForms[0].data.lat,
      long: this.state.contractForms[0].data.long,
    };
    if (this.state.settings !== null) {
      this.state.contractForms.slice(1).forEach((pos, index) => {
        const hasCoords = prevCoords.lat !== null
          && prevCoords.long !== null
          && pos.data.lat !== null
          && pos.data.long !== null;
        const distance = hasCoords
          ? haversine(
            prevCoords.lat,
            prevCoords.long,
            pos.data.lat,
            pos.data.long,
          )
          : 0;
        const zone = zoneFromDistance(
          distance,
          this.state.settings.zone_size,
          this.state.settings.addzone_size,
        );
        const basePrice = zone > 0
          ? this.state.settings.basezone_price
              + (zone - 1) * this.state.settings.addzone_price
          : 0;
        let actualPrice = basePrice;
        if (pos.data.is_cargo) actualPrice += basePrice;
        if (pos.data.is_express) {
          const addPrice = this.state.settings.addzone_price;
          if (zone <= 2) actualPrice += addPrice;
          else if (zone <= 4) actualPrice += addPrice * 2;
          else if (zone <= 6) actualPrice += addPrice * 3;
          else if (zone <= 8) actualPrice += addPrice * 4;
          else if (zone > 8) actualPrice * 2;
        }
        if (pos.data.weight_size_bonus !== '' && !pos.data.is_cargo) actualPrice += this.state.settings.addzone_price;
        if (pos.data.is_bigbuilding) actualPrice += this.state.settings.addzone_price;
        if (pos.data.waiting_bonus !== 0) {
          actualPrice
            += this.state.settings.addzone_price
            * parseInt(pos.data.waiting_bonus, 10);
        }
        if (pos.data.get_there_bonus !== 0) actualPrice += parseFloat(pos.data.get_there_bonus);

        this.setStateOfPosition(
          index + 1,
          {
            distance,
            baseZone: zone,
            basePrice,
            bonus: actualPrice - basePrice,
          },
          'stop',
        );

        totalDistance += distance;
        totalPrice += actualPrice;
        totalExtra += actualPrice - basePrice;
        if (this.state.type === 'weiterfahrt') {
          prevCoords = {
            lat: pos.data.lat,
            long: pos.data.long,
          };
        }
      });

      if (!Number.isNaN(this.state.extra2)) {
        totalExtra += this.state.extra2;
        totalPrice += this.state.extra2;
      }
      const zone = zoneFromDistance(
        totalDistance,
        this.state.settings.zone_size,
        this.state.settings.addzone_size,
      );
      this.setState({
        zone,
        distance: totalDistance,
        price: totalPrice - totalExtra,
        extra: totalExtra,
        marken: markenFromPrice(totalPrice, this.state.settings.addzone_price),
      });
    }
  }

  nextNameSelect(id) {
    if (id < this.state.contractForms.length - 1) {
      window.curElement += 1;
      if (window.curElement >= this.state.contractForms.length - 1) window.curElement = -1;
    }
  }

  nameSelect(dir) {
    window.curElement += dir;
    if (window.curElement > this.state.contractForms.length - 1) window.curElement = 0;

    if (window.curElement < 0) window.curElement = this.state.contractForms.length - 1;

    if (this.Selects[window.curElement] !== null) this.Selects[window.curElement].focusNameSelect();
  }

  prevNameSelect(id) {
    if (id >= 0) {
      this.Selects[id].focusNameSelect();
      window.curElement -= 1;
      if (window.curElement < 0) window.curElement = this.state.contractForms.length - 1;
    }
  }

  onDeleteAndClose() {
    if (this.props.hasOwnProperty('close')) {
      this.props.close();
    } else {
      // const navigate = useNavigate();
      // window.location.assign(PUBHOST);
      // navigate("/disposerv/disposerv");
    }
  }

  renderToggleButton(day, cont) {
    return (
      <ToggleButton
        checked
        onClick={(event) => {
          event.persist();
          this.changeRepeatedWeekdays(day, event.target.checked);
        }}
      >
        {cont}
      </ToggleButton>
    );
  }

  setRepeatedStartDate(date) {
    const obj = { repeatedstartdate: date };
    this.setState(obj);
  }

  setRepeatedEndDate(date) {
    const obj = { repeatedenddate: date };
    this.setState(obj);
  }

  render() {
    console.log('contractprize', this.state.id, this.state.price, this.state.extra, this.contract);
    const nettoPrice = this.state.price + this.state.extra;
    const bruttoPrice = nettoPrice * NETTOBRUTTOFACTOR;
    const emphasizedBorder = '1px #555 solid';
    const markerPositions = this.state.contractForms.map((form) => [
      form.data.lat,
      form.data.long,
    ]);
    return (
      <Container fluid className="ContractFormContainer">
        <Row>
          <Col xs={12} xl={2} className="mb-5">
            <ListGroup>
              <ListGroupItem style={{ border: emphasizedBorder }}>
                {this.state.id !== ''
                  ? `Auftragsnummer  #${this.state.id}`
                  : 'Neuer Auftrag'}
              </ListGroupItem>
              <ListGroupItem style={{ border: emphasizedBorder }}>
                {/* {this.state.date.format("dd.MM.yyyy")} */}
                <DatePicker
                  onChange={(event) => this.setDate(event)}
                  className="form-control"
                  selected={this.state.date}
                  dateFormat="dd.MM.yyyy"
                  // style={{zIndex: 5000}}
                  popperPlacement="right-start"
                  calendarStartDay={1}
                />
              </ListGroupItem>
              <ListGroupItem style={{ border: emphasizedBorder }}>
                <Button
                  active={this.state.isRepeated}
                  onClick={this.handleRepeatedContract}
                >
                  Dauerauftrag
                </Button>
                {this.state.isRepeated ? (
                  <div>
                    <FormGroup>
                      <DatePicker
                        onChange={(date) => this.setRepeatedStartDate(date)}
                        className="form-control"
                        selected={this.state.repeatedstartdate}
                        dateFormat="dd.MM.yyyy"
                        popperPlacement="right-end"
                        calendarStartDay={1}
                      />
                    </FormGroup>
                    <FormGroup>
                      <ToggleButton
                        checked={this.state.repeatedenddate}
                        onClick={() => {
                          if (!this.state.repeatedenddate) this.setState({ repeatedenddate: new Date() });
                          else this.setState({ repeatedenddate: null });
                        }}
                      >
                        Enddatum?
                      </ToggleButton>
                      {this.state.repeatedenddate ? (
                        <DatePicker
                          onChange={(date) => this.setRepeatedEndDate(date)}
                          className="form-control"
                          selected={this.state.repeatedenddate}
                          dateFormat="dd.MM.yyyy"
                          popperPlacement="right-end"
                          calendarStartDay={1}
                        />
                      ) : (
                        ''
                      )}
                    </FormGroup>
                    <FormGroup>
                      {this.renderToggleButton('Monday', 'MO')}
                      {this.renderToggleButton('Tuesday', 'DI')}
                      {this.renderToggleButton('Wednesday', 'MI')}
                      {this.renderToggleButton('Thursday', 'DO')}
                      {this.renderToggleButton('Friday', 'FR')}
                      {this.renderToggleButton('Saturday', 'SA')}
                      {this.renderToggleButton('Sunday', 'SO')}
                    </FormGroup>
                    {this.state.repeated.days_of_the_week}
                  </div>
                ) : (
                  ''
                )}
              </ListGroupItem>
              <ListGroupItem style={{ border: emphasizedBorder }}>
                Distanz
                {' '}
                {this.state.distance.toFixed(2)}
                {' '}
                km
              </ListGroupItem>
            </ListGroup>
          </Col>

          <Col xs={12} xl={2} className="group">
            <Card>
              <ListGroup>
                <ListGroupItem style={{ border: emphasizedBorder }}>
                  <div
                    style={{
                      width: '50%',
                      float: 'left',
                      display: 'block',
                      height: '100%',
                    }}
                    className="boldf"
                  >
                    Zone:
                  </div>
                  {this.state.zone}
                </ListGroupItem>
                <ListGroupItem style={{ border: emphasizedBorder }}>
                  <div
                    style={{
                      width: '50%',
                      float: 'left',
                      display: 'block',
                      height: '100%',
                    }}
                    className="boldf"
                  >
                    Netto/Brutto:
                  </div>
                  <span style={{ fontWeight: '600' }}>
                    {nettoPrice.toFixed(2)}
                    {' '}
                    €/
                    {bruttoPrice.toFixed(2)}
                    {' '}
                    €
                  </span>
                </ListGroupItem>
                <ListGroupItem
                  style={{
                    border: emphasizedBorder,
                    padding: '5px 15px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: '45%',
                      display: 'inline',
                      height: '100%',
                      margin: '0',
                    }}
                    className="boldf"
                  >
                    Zuschlag:
                  </div>
                  <div
                    style={{ width: '45%', display: 'block', float: 'right' }}
                  >
                    <FormGroup
                      // TODO: reimplement
                      // validationState={
                      //   Number.isNaN(this.state.extra2) ? "error" : "success"
                      // }
                      size="sm"
                      style={{ marginBottom: '0' }}
                    >
                      <Form.Control
                        type="text"
                        name="extra2"
                        value={this.state.extra2_string}
                        onChange={({ target }) => {
                          this.setState(
                            {
                              extra2: parseFloat(
                                target.value.replace(/,/, '.'),
                              ),
                              extra2_string: target.value,
                            },
                            this.calcDistanceAndZone.bind(this),
                          );
                        }}
                      />
                    </FormGroup>
                    &nbsp;
                  </div>
                </ListGroupItem>
                <ListGroupItem style={{ border: emphasizedBorder }}>
                  <div
                    style={{
                      width: '50%',
                      float: 'left',
                      display: 'block',
                      height: '100%',
                    }}
                    className="boldf"
                  >
                    Marken:
                  </div>
                  {this.state.marken}
                </ListGroupItem>
              </ListGroup>
            </Card>
          </Col>
          <Col xs={12} xl={3}>
            <ContractBonusButtons
              handler={this.handleBonusButtonChange}
              id={1}
              position={this.state.contractForms[1].data}
            />
            <Row>
              <Col xs={6}>&nbsp;</Col>
              <Col xs={6}>
                <ButtonGroup vertical>
                  <Button
                    style={{
                      fontSize: 'large',
                      border: emphasizedBorder,
                      marginTop: '40px',
                    }}
                    onClick={() => this.setBonussesForAllPositions()}
                  >
                    Auf alle Positionen
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>
          </Col>
          <Col xs={1}>
            <div>
              <Button
                style={{
                  width: '100px',
                  marginTop: '0px',
                  marginBottom: '10px',
                  border: emphasizedBorder,
                }}
                onClick={this.onContractSaveClick}
              >
                <span className={this.state.saved}>
                  <FontAwesomeIcon
                    icon={SAVEICONS[this.state.saved]}
                    size="4x"
                  />
                </span>
              </Button>
            </div>
            <div>
              <MapModal id="map-modal" positions={markerPositions} />
            </div>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col xs={12} xl={5}>
            <ContractFormRepresentational
              contract={this.state}
              position={this.state.contractForms.find(
                (contract) => contract.id === 0,
              )}
              date={this.state.date}
              setStateOfContract={this.setStateOfContract}
              setStateOfPosition={this.setStateOfPosition}
              removePosition={this.removePosition}
              inputRef={(contractForm) => (this.Selects[0] = contractForm)}
              getInputRef={this.Selects[0]}
              inputRefTwo={(ref) => (this.fcSelects[0] = ref)}
              getInputRefTwo={this.fcSelects[0]}
              focus={this.focusFcSelect}
              nextRef={this.Selects[1]}
              next={this.nextNameSelect}
            />
          </Col>
          <Col xs={12} xl={1} style={{ marginTop: '200px' }}>
            <div>
              {this.state.contractForms.length < 3 ? (
                <Button
                  size="large"
                  style={{ border: emphasizedBorder }}
                  onClick={this.onSwitchButtonClick}
                >
                  <FontAwesomeIcon icon={faExchange} size="3x" />
                </Button>
              ) : (
                ''
              )}
            </div>
            <div>
              <Button
                size="large"
                style={{ border: emphasizedBorder }}
                onClick={this.onRetourButtonClick}
              >
                Retour
              </Button>
            </div>
          </Col>
          <Col xl={6} xs={12}>
            <ContractFormRepresentational
              contract={this.state}
              position={this.state.contractForms.find(
                (contract) => contract.id === 1,
              )}
              date={this.state.date}
              setStateOfContract={this.setStateOfContract}
              setStateOfPosition={this.setStateOfPosition}
              removePosition={this.removePosition}
              inputRef={(contractForm) => (this.Selects[1] = contractForm)}
              getInputRef={this.Selects[1]}
              nextRef={this.Selects[2]}
              next={this.nextNameSelect}
              inputRefTwo={(ref) => (this.fcSelects[1] = ref)}
              getInputRefTwo={this.fcSelects[1]}
              focus={this.focusFcSelect}
            />
          </Col>
        </Row>
        {this.state.contractForms.length > 2
          ? this.state.contractForms
            .slice(2)
            .sort((a, b) => a.id - b.id)
            .map((position) => (
              <Row key={position.id}>
                <Col xs={12}>
                  {this.state.type === 'weiterfahrt' ? (
                    <Row>
                      <Col xs={0} xl={9} />
                      <Col xs={12} xl={3}>
                        <FontAwesomeIcon icon={faArrowDown} size="2x" />
                      </Col>
                    </Row>
                  ) : (
                    ''
                  )}
                  <Row>
                    <Col xs={3}>&nbsp;</Col>
                    <Col xs={3}>
                      <div
                        style={{ marginTop: '200px', marginLeft: '50px' }}
                      >
                        <ContractBonusButtons
                          handler={this.handleBonusButtonChange}
                          id={position.id}
                          position={position.data}
                        />
                      </div>
                    </Col>
                    <Col xl={6} xs={12}>
                      <ContractFormRepresentational
                        contract={this.state}
                        position={position}
                        date={this.state.date}
                        setStateOfContract={this.setStateOfContract}
                        setStateOfPosition={this.setStateOfPosition}
                        removePosition={this.removePosition}
                        inputRef={(contractForm) => (this.Selects[position.id] = contractForm)}
                        getInputRef={this.Selects[position.id]}
                        nextRef={this.Selects[position.id + 1]}
                        next={this.nextNameSelect}
                        inputRefTwo={(ref) => (this.fcSelects[position.id] = ref)}
                        getInputRefTwo={this.fcSelects[position.id]}
                        focus={this.focusFcSelect}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            ))
          : ''}
        <Row>
          <Col xs={6} />
          <Col xs={3} style={{ textAlign: 'center' }}>
            {this.state.type === ''
            || this.state.type === 'weiterfahrt'
            || this.state.contractForms.length === 2 ? (
              <Button
                style={{ margin: '10px' }}
                size="large"
                onClick={this.addWeiterfahrtForm}
              >
                <FontAwesomeIcon icon={faArrowDown} size="4x" />
              </Button>
              ) : (
                ''
              )}
          </Col>
          <Col xs={3} style={{ textAlign: 'center' }}>
            {this.state.type === 'einzelfahrt'
            || this.state.type === ''
            || this.state.contractForms.length === 2 ? (
              <Button
                style={{ margin: '10px' }}
                size="large"
                onClick={this.addContractForm}
              >
                <FontAwesomeIcon icon={faPlus} size="4x" />
              </Button>
              ) : (
                ''
              )}
          </Col>
        </Row>
        <Link
          className="d-none"
          to="/"
          id="navToContractArchive"
          ref={(btn) => (this.navToContractArchive = btn)}
        >
          Auftragsarchiv
        </Link>
      </Container>
    );
  }
}

export default ContractFormContainer;
