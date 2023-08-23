import React from 'react';
import {
  Container,
  Row,
  Col,
  ButtonGroup,
  Button,
  FormLabel,
} from 'react-bootstrap';
import NumericInput from 'react-numeric-input';

function ContractBonusButtons({ handler, id, position }) {
  const {
    weight_size_bonus, is_cargo,
    is_bigbuilding, is_express, waiting_bonus,
  } = position;
  const emphasizedBorder = '1px #555 solid';
  let weight_size_label = 'Kein GW/GRS';
  let nextWeightSizeValue = 'weight';
  switch (weight_size_bonus) {
    case '':
      nextWeightSizeValue = 'weight';
      break;
    case 'weight':
      nextWeightSizeValue = 'size';
      break;
    case 'size':
      nextWeightSizeValue = '';
      break;
    default:
      nextWeightSizeValue = 'weight';
      weight_size_label = 'Kein GW/GRS';
  }
  if (weight_size_bonus !== '') weight_size_label = weight_size_bonus === 'weight' ? 'Gewicht' : 'Groesse';

  return (
    <Container fluid className="bonus">
      <h3>Bonus</h3>
      <Row>
        <Col xs={12}>
          <ButtonGroup>

            <Button
              name="weight_size_bonus"
              active={weight_size_bonus !== ''}
              style={{ border: emphasizedBorder }}
              onClick={(event) => handler(id, event, nextWeightSizeValue)}
            >
              {weight_size_label}
            </Button>

            <Button
              active={is_cargo}
              onClick={(event) => handler(id, event, !is_cargo)}
              name="is_cargo"
              style={{ border: emphasizedBorder }}
            >
              Cargo
            </Button>

            <Button
              active={is_bigbuilding}
              onClick={(event) => handler(id, event, !is_bigbuilding)}
              name="is_bigbuilding"
              style={{ border: emphasizedBorder }}
            >
              Grossgebaeude
            </Button>
            <Button
              active={is_express}
              onClick={(event) => handler(id, event, !is_express)}
              name="is_express"
              style={{ border: emphasizedBorder }}
            >
              EXPRESS
            </Button>
          </ButtonGroup>
        </Col>
        <Col xs={12}>
          <ButtonGroup>

            {/* <Button active={isProvisionally} onClick={(event) => handler(id, event, !isProvisionally)} name="isProvisionally" */}
            {/* style={{border: emphasizedBorder}} */}
            {/* >Vorlaeufig</Button> */}
            <FormLabel>Wartezeit</FormLabel>
            <NumericInput
              className="form-control"
              step={1}
              precision={0}
              value={parseInt(waiting_bonus, 10)}
              onChange={(valueAsNumber) => handler(id, { target: { name: 'waiting_bonus', value: valueAsNumber } })}
              style={{ border: emphasizedBorder }}
            />
            {/* <NumericInput className="form-control" */}
            {/* step={1} */}
            {/* precision={0} */}
            {/* value={waiting_bonus} */}
            {/* onChange={(valueAsNumber) => handler(id, {target: {name: "waiting_bonus", value: valueAsNumber}})}/> */}
            {/* <Button active={hasDelayedPayment} onChange={(event) => handler(id, event, !hasDelayedPayment)}> Nachkassieren </Button> */}
          </ButtonGroup>
        </Col>
      </Row>
    </Container>
  );
}

export default ContractBonusButtons;
