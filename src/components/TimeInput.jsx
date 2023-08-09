import React from 'react';
import { FormGroup } from 'react-bootstrap';
import moment from 'moment';
import SizedFormControl from './SizedFormControl';

const validateTime = (time) => {
  const timeMoment = moment(time);
  return {
    current: ((typeof timeMoment !== 'undefined') && timeMoment !== '' && (timeMoment.isValid && timeMoment.isValid()) ? moment(time) : moment()),
    timeHours: ((typeof timeMoment !== 'undefined') && timeMoment !== '' && (timeMoment.isValid && timeMoment.isValid())) ? timeMoment.format('HH') : '',
    timeMinutes: ((typeof timeMoment !== 'undefined') && timeMoment !== '' && (timeMoment.isValid && timeMoment.isValid())) ? timeMoment.format('mm') : '',
  };
};

class TimeInput extends React.Component {
  constructor(props) {
    const { time } = props;
    super(props);
    this.state = validateTime(time);

    this.minutesInput = null;
    this.focusMinutes = this.focusMinutes.bind(this);
    this.handleHoursInput = this.handleHoursInput.bind(this);
    this.handleMinutesInput = this.handleMinutesInput.bind(this);
    this.size = this.props.size ? this.props.size : '';
  }

  componentDidUpdate() {
    // console.log(this.state.timeHours, this.state.timeMinutes);
  }

  static getDerivedStateFromProps(nextProps) {
    const { time } = nextProps;
    return validateTime(time);
  }

  handleHoursInput(event) {
    if (event.target.value.length >= 2) {
      this.props.callback(
        moment(this.state.current)
          .hour(event.target.value % 24)
          .minute(this.state.timeMinutes % 60),
      );
      // this.focusMinutes();
      const { form } = event.target;
      const index = [...form].indexOf(event.target);
      form.elements[index + 1].focus();
    } else {
      this.props.callback(
        moment(this.state.current)
          .hour(event.target.value % 24)
          .minute(this.state.timeMinutes % 60),
      );
    }
  }

  handleMinutesInput(event) {
    if (event.target.value.length >= 2) {
      this.props.callback(
        moment(this.state.current)
          .minute(event.target.value % 60)
          .hour(this.state.timeHours % 24),
      );
      this.props.next();
    } else {
      this.props.callback(
        moment(this.state.current)
          .minute(event.target.value % 60)
          .hour(this.state.timeHours % 24),
      );
    }
  }

  focusMinutes() {
    // console.log(this.minutesInput)
    // this.minutesInput.focus();
  }

  render() {
    return (
      <div>
        <FormGroup className="form-inline d-flex mb-3">
          <SizedFormControl
            style={{ width: '45%' }}
            type="number"
            min="1"
            max="23"
            name="hour"
            value={this.state.timeHours}
            onChange={this.handleHoursInput}
                      // inputRef={this.props.irefSetter}
                      // onFocus={() => {this.props.iref && this.props.iref.select()}}
            size={this.size}
          />
          <SizedFormControl
            style={{ width: '45%' }}
            type="number"
            min="0"
            max="59"
            name="minute"
            value={this.state.timeMinutes}
            onChange={this.handleMinutesInput}
            ref={this.minutesInput}
                      // onFocus={() => {this.minutesInput && this.minutesInput.select()}}
            size={this.size}
          />
        </FormGroup>
      </div>
    );
  }
}

export default TimeInput;
