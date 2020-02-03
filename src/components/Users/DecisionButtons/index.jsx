import React from 'react';

import './style.scss';
import { makeDecision, finalizeDecision } from 'api';
import { StyledSelect } from 'components/SelectField';

const DECISIONS_PER_SECOND = 5;
const getDelay = index => index * (1000 / DECISIONS_PER_SECOND);

export default class DecisionButtons extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedWave: 1
    };
  }

  waitAndUserAction(milliseconds, userId, action) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        action(userId).then(() => {
          this.props.unselectUser(userId); // makeshift progress bar
          resolve();
        }, reject);
      }, milliseconds);
    })
  }

  makeDecisionForSelected(decision, wave) {
    this.props.onDecision(this.props.selectedUserIds.map((id, index) =>
      this.waitAndUserAction(getDelay(index), id, userId => makeDecision(userId, decision, wave))
    ));
  }

  finalizeSelected(finalized = true) {
    this.props.onDecision(this.props.selectedUserIds.map((id, index) =>
      this.waitAndUserAction(getDelay(index), id, userId => finalizeDecision(userId, finalized))
    ));
  }

  render() {
    const { registrations, selectedUserIds } = this.props;
    const { selectedWave } = this.state;

    const isSelected = registration => selectedUserIds.includes(registration.id);
    const selectedUsersPassCondition = condition =>
      registrations.every(registration => !isSelected(registration) || condition(registration));

    const areSelectedAllFinalized = selectedUsersPassCondition(registration => registration.finalized);
    const areSelectedAllUnfinalized = selectedUsersPassCondition(registration => !registration.finalized);
    const areSelectedAllDecided = selectedUsersPassCondition(registration => registration.decisionStatus !== 'PENDING');
    const anySelected = selectedUserIds.length > 0;

    const oneThroughTen = Array(10).fill(0).map((_, i) => i + 1);

    return (
      <div className="decision-buttons">
        <div className="selected-users-count">
          {selectedUserIds.length} / {registrations.length}
          <div className="small-text">users selected</div>
        </div>

        <StyledSelect
          className="wave-select"
          value={{ value: selectedWave, label: `Wave ${selectedWave}` }}
          menuPortalTarget={document.body}
          options={oneThroughTen.map(num => ({ value: num, label: `Wave ${num}`}))}
          onChange={selected => this.setState({ selectedWave: selected.value })}/>
        
        <button
          className="accept button"
          onClick={() => this.makeDecisionForSelected('ACCEPTED', selectedWave)}
          disabled={!(anySelected && areSelectedAllUnfinalized)}>
            Accept
        </button>

        <button
          className="waitlist button"
          onClick={() => this.makeDecisionForSelected('WAITLISTED', 0)}
          disabled={!(anySelected && areSelectedAllUnfinalized)}>
            Waitlist
        </button>

        <button
          className="reject button"
          onClick={() => this.makeDecisionForSelected('REJECTED', 0)}
          disabled={!(anySelected && areSelectedAllUnfinalized)}>
            Reject
        </button>

        <button
          className="finalize button"
          onClick={() => this.finalizeSelected()}
          disabled={!(anySelected && areSelectedAllUnfinalized && areSelectedAllDecided)}>
            Finalize
        </button>

        <button
          className="unfinalize button"
          onClick={() => this.finalizeSelected(false)}
          disabled={!(anySelected && areSelectedAllFinalized)}>
            Unfinalize
        </button>
      </div>
    )
  }
}