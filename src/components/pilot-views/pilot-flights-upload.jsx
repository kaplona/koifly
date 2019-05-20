'use strict';

const React = require('react');
const browserHistory = require('react-router').browserHistory;
const Button = require('../common/buttons/button');
const Description = require('../common/section/description');
const DesktopBottomGrid = require('../common/grids/desktop-bottom-grid');
const ErrorBox = require('../common/notice/error-box');
const ErrorTypes = require('../../errors/error-types');
const FileInput = require('../common/inputs/file-input');
const ImportError = require('../common/notice/import-error');
const KoiflyError = require('../../errors/error');
const NavigationMenu = require('../common/menu/navigation-menu');
const Notice = require('../common/notice/notice');
const PilotModel = require('../../models/pilot');
const Section = require('../common/section/section');
const SectionLoader = require('../common/section/section-loader');
const SectionRow = require('../common/section/section-row');
const SectionTitle = require('../common/section/section-title');
const View = require('../common/view');

require('./pilot-flight-upload.less');


const PilotFlightsUpload = React.createClass({

  getInitialState: function() {
    return {
      dataUri: null,
      email: null,
      fileName: null,
      fileReadError: null,
      isImporting: false,
      loadingError: null,
      successSummary: false,
      validationError: null,
      userName: null
    };
  },

  handleStoreModified: function() {
    const pilot = PilotModel.getEditOutput();

    if (pilot && pilot.error) {
      this.setState({ loadingError: pilot.error });
      return;
    }

    if (pilot) {
      this.setState({
        userName: pilot.userName,
        email: pilot.email,
        loadingError: null
      });
    }
  },

  handleGoToPilotEdit: function() {
    browserHistory.push('/pilot/edit');
  },

  handleFile: function(file) {
    this.setState({
      dataUri: null,
      fileName: file.name,
      fileReadError: null,
      successSummary: null,
      validationError: null
    });

    const validationError = this.validateFile(file);
    if (validationError) {
      this.setState({ validationError: validationError });
      return;
    }

    const reader = new FileReader();
    reader.onload = upload => {
      this.setState({
        dataUri: upload.target.result
      });
    };
    reader.onerror = error => {
      this.setState({ fileReadError: error });
    };

    reader.readAsDataURL(file);
  },

  handleRemoveFile() {
    this.setState({
      dataUri: null,
      fileName: null,
      fileReadError: null,
      successSummary: null,
      validationError: null
    });
  },

  handleImportFile: function() {
    this.setState({ isImporting: true });

    PilotModel
      .importFlights(this.state.dataUri)
      .then(successSummary => {
        this.setState({
          successSummary,
          isImporting: false
        });
      })
      .catch(error => {
        this.setState({
          fileReadError: error || new KoiflyError(ErrorTypes.DB_WRITE_ERROR),
          isImporting: false
        });
      });
  },

  validateFile(file) {
    const errors = [];
    if (file.type !== 'text/csv') {
      errors.push('File must be .csv format.');
    }
    if (file.size > 1048576) {
      errors.push('File must be less than 1MB');
    }

    return errors.length ? new KoiflyError(ErrorTypes.VALIDATION_ERROR, errors.join(' ')) : null;
  },

  renderNavigationMenu: function() {
    return <NavigationMenu currentView={PilotModel.getModelKey()}/>;
  },

  renderSimpleLayout: function(children) {
    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        {this.renderNavigationMenu()}
        {children}
      </View>
    );
  },

  renderLoader: function() {
    return this.renderSimpleLayout(<SectionLoader/>);
  },

  renderLoadingError: function() {
    const errorBox = <ErrorBox error={this.state.loadingError} onTryAgain={this.handleStoreModified}/>;
    return this.renderSimpleLayout(errorBox);
  },

  renderSuccessMessage: function() {
    return (
      <div className='pilot-flight-upload__notice'>
        <Notice
          type='success'
          text={(
            <div>
              Your records were successfully saved:
              <ul>
                <li>{this.state.successSummary.flightsNum} flights added;</li>
                <li>{this.state.successSummary.sitesNum} sites added;</li>
                <li>{this.state.successSummary.glidersNum} gliders added.</li>
              </ul>
            </div>
          )}
        />
      </div>
    );
  },

  render: function() {
    if (this.state.loadingError) {
      return this.renderLoadingError();
    }

    if (!this.state.email) {
      return this.renderLoader();
    }

    const canImport = (
      this.state.dataUri && !this.state.fileReadError && !this.state.validationError &&
      !this.state.isImporting && !this.state.successSummary
    );

    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        <form>
          <Section>
            <SectionTitle>
              <div>{this.state.userName}</div>
              <div>{this.state.email}</div>
            </SectionTitle>

            <SectionTitle isSubtitle={true}>
              Import you flights:
            </SectionTitle>

            <SectionRow>
              {!!this.state.successSummary && this.renderSuccessMessage()}
              {!!this.state.fileReadError && (
                <div className='pilot-flight-upload__notice'>
                  <ImportError error={this.state.fileReadError}/>
                </div>
              )}

              <FileInput
                fileName={this.state.fileName}
                fileTypes='.csv'
                errorMessage={this.state.validationError ? this.state.validationError.message : null}
                onSelect={this.handleFile}
                onRemove={this.handleRemoveFile}
              />
            </SectionRow>

            <SectionRow isLast={true}>
              <Description>
                <div>
                  File should be .csv format. First line should be a header with next column names:
                  <ul>
                    <li>"date" – date in yyyy-mm-dd format;</li>
                    <li>"airtime" – number, flight duration in minutes;</li>
                    <li>"altitude" – number, gained altitude in the same unit as in pilot's settings;</li>
                    <li>"site" – name of the site;</li>
                    <li>"launchAltitude" – number, site altitude in the same unit as in pilot's settings;</li>
                    <li>"location" – site geographical address;</li>
                    <li>"latitude" – site coordinates;</li>
                    <li>"longitude" – site coordinates;</li>
                    <li>"glider" – name of the glider;</li>
                    <li>"remarks"</li>
                  </ul>
                  Each line must have "date" value, other column values are optional.
                </div>
              </Description>
            </SectionRow>

            <DesktopBottomGrid
              leftElements={[
                <Button
                  buttonStyle='primary'
                  caption={this.state.isImporting ? 'Importing...' : 'Import'}
                  isEnabled={canImport}
                  onClick={this.handleImportFile}
                />,
                <Button
                  buttonStyle='secondary'
                  caption='Cancel'
                  onClick={this.handleGoToPilotEdit}
                />
              ]}
            />
          </Section>
        </form>

        {this.renderNavigationMenu()}
      </View>
    );
  }
});


module.exports = PilotFlightsUpload;
