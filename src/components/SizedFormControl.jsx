import { FormControl } from 'react-bootstrap';
import React from 'react';

function SizedFormControl(props) {
  const propsObj = { ...props };
  const { bsSize } = props;
  if (bsSize === '') delete propsObj.bsSize;
  return (
    <FormControl
      {...propsObj}
    />
  );
}

export default SizedFormControl;
