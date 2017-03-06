import _ from 'lodash';
import React, { PropTypes } from 'react';
import { ProgressBar } from 'react-mdl';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { ScaleModal } from 'boron';
import { translate } from 'react-i18next';

import * as actions from '../../../actions';
import createEmployee from '../../../validators/create-employee';
import { ModalLayoutRightSideColumn } from '../../ModalLayout';
import SelectableModalList from '../../ModalLayout/SelectableList';
import StaffjoyButton from '../../StaffjoyButton';
import StaffjoyTextField from '../../StaffjoyTextField';

require('./create-employee-modal.scss');

const EMPTY_OBJECT = Object.freeze({});

// Adapter for redux-form. Add your prop - do not use spread operator.
function TextField({ disabled, input, label, meta, name, width }) {
  return (
    <StaffjoyTextField
      disabled={disabled}
      error={meta.error}
      label={label}
      name={name}
      width={width}
      onChange={input.onChange}
      onBlur={input.onBlur}
    />
  );
}

TextField.propTypes = {
  disabled: PropTypes.bool,
  input: PropTypes.object,
  label: PropTypes.string,
  meta: PropTypes.object,
  name: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// Adapter for redux-form.
function SelectableList({
  displayByProperty,
  formField,
  input,
  meta,
  name,
  records,
  selectedUuid,
  uuidKey,
}) {
  return (
    <SelectableModalList
      displayByProperty={displayByProperty}
      error={meta.error}
      formCallback={({ teams }) => {
        // Adapt shape of argument to expected shape for redux-form.
        input.onChange({ ...teams });
      }}
      formField={formField}
      name={name}
      records={records}
      selectedUuid={selectedUuid}
      uuidKey={uuidKey}
    />
  );
}

SelectableList.propTypes = {
  displayByProperty: PropTypes.string,
  formField: PropTypes.string,
  input: PropTypes.object,
  meta: PropTypes.object,
  name: PropTypes.string,
  records: PropTypes.array,
  selectedUuid: PropTypes.string,
  uuidKey: PropTypes.string,
};

class CreateEmployeeModal extends React.Component {

  constructor(props) {
    super(props);

    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);

    this.submit = props.handleSubmit(() => {
      this.setState({ submitting: true });

      const { createEmployeeFromForm, companyUuid, dispatch } = this.props;
      dispatch(createEmployeeFromForm(companyUuid));
    });

    this.state = { submitting: false };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.submitSucceeded && !this.props.submitSucceeded) {
      this.setState({ submitting: false });
      this.closeModal();
      // TODO: add success modal
    }
  }

  closeModal() {
    this.props.reset();
    this.modal.hide();
  }

  openModal() {
    this.modal.show();
  }

  render() {
    const { teams, t } = this.props;
    const { submitting } = this.state;

    let selectedUuid;
    if (teams.length === 1) {
      selectedUuid = teams[0].uuid;
    }

    const panelContent = (
      <Field
        component={SelectableList}
        displayByProperty="name"
        formField="teams"
        name="teams"
        records={teams}
        selectedUuid={selectedUuid}
        uuidKey="uuid"
      />
    );

    const cancelButton = (
      <StaffjoyButton
        key="cancel"
        buttonType="neutral"
        disabled={submitting}
        onClick={this.closeModal}
      >
        { t('cancel') }
      </StaffjoyButton>
    );

    let progressBar;
    if (submitting) {
      progressBar = <ProgressBar indeterminate />;
    }

    const createButton = (
      <StaffjoyButton
        key="create"
        disabled={submitting}
        onClick={this.submit}
      >
        { t('create') }
      </StaffjoyButton>
    );

    const content = (
      <form className="create-employee-modal-content">
        <Field
          component={TextField}
          disabled={submitting}
          label={t('fullName')}
          name="full_name"
          width="full"
        />
        <Field
          component={TextField}
          disabled={submitting}
          label={t('email')}
          name="email"
          width="full"
        />
        <Field
          component={TextField}
          disabled={submitting}
          label={t('phone')}
          name="phonenumber"
          width="full"
        />
      </form>
    );

    return (
      <div>
        <ScaleModal
          contentStyle={{
            /* due to chrome css bug */
            animation: 'none',
            borderRadius: '3px',
          }}
          modalStyle={{ width: '640px' }}
          ref={(modal) => { this.modal = modal; }}
          onHide={this.handleModalClose}
        >
          <div>
            {progressBar}
            <ModalLayoutRightSideColumn
              title={t('createNewEmployee')}
              panelTitle={t('selectTeams')}
              panelContent={panelContent}
              buttons={[cancelButton, createButton]}
            >
              {content}
            </ModalLayoutRightSideColumn>
          </div>
        </ScaleModal>
        <StaffjoyButton
          buttonType="primary"
          size="small"
          onClick={this.openModal}
        >
          {t('createEmployee')}
        </StaffjoyButton>
      </div>
    );
  }
}

CreateEmployeeModal.propTypes = {
  companyUuid: PropTypes.string.isRequired,
  createEmployeeFromForm: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  teams: PropTypes.array.isRequired,
  /**
   * Submit handle factory exposed by redux-form.
   */
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  submitSucceeded: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  const createEmployeeForm = _.get(state.form, 'create-employee', EMPTY_OBJECT);

  return {
    submitSucceeded: createEmployeeForm.submitSucceeded,
  };
}

function mapDisatchToProps(dispatch) {
  return {
    createEmployeeFromForm: actions.createEmployeeFromForm,
    dispatch,
  };
}

const Form = reduxForm({
  form: 'create-employee',
  validate: createEmployee,
})(translate('common')(CreateEmployeeModal));
const Container = connect(mapStateToProps, mapDisatchToProps)(Form);
export default Container;
