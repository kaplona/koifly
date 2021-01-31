import React from 'react';
import Button from '../common/buttons/button';
import Description from '../common/section/description';
import DesktopBottomGrid from '../common/grids/desktop-bottom-grid';
import ErrorBox from '../common/notice/error-box';
import errorTypes from '../../errors/error-types';
import FileInput from '../common/inputs/file-input';
import ImportError from '../common/notice/import-error';
import KoiflyError from '../../errors/error';
import NavigationMenu from '../common/menu/navigation-menu';
import navigationService from '../../services/navigation-service';
import Notice from '../common/notice/notice';
import PilotModel from '../../models/pilot';
import Section from '../common/section/section';
import SectionLoader from '../common/section/section-loader';
import SectionRow from '../common/section/section-row';
import SectionTitle from '../common/section/section-title';
import View from '../common/view';

require('./pilot-flights-upload.less');


export default class PilotFlightsUpload extends React.Component {
  constructor() {
    super();
    this.state = {
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

    this.handleStoreModified = this.handleStoreModified.bind(this);
    this.handleFile = this.handleFile.bind(this);
    this.handleRemoveFile = this.handleRemoveFile.bind(this);
    this.handleImportFile = this.handleImportFile.bind(this);
  }

  handleStoreModified() {
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
  }

  handleFile(file) {
    this.setState({
      dataUri: null,
      fileName: file.name,
      fileReadError: null,
      successSummary: null,
      validationError: null
    });

    const validationError = this.validateFile(file);
    if (validationError) {
      this.setState({ validationError });
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
  }

  handleRemoveFile() {
    this.setState({
      dataUri: null,
      fileName: null,
      fileReadError: null,
      successSummary: null,
      validationError: null
    });
  }

  handleImportFile() {
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
          fileReadError: error || new KoiflyError(errorTypes.DB_WRITE_ERROR),
          isImporting: false
        });
      });
  }

  validateFile(file) {
    const errors = [];
    if (file.type !== 'text/csv') {
      errors.push('File must be .csv format.');
    }
    if (file.size > 2097152) {
      errors.push('File must be less than 2MB');
    }

    return errors.length ? new KoiflyError(errorTypes.VALIDATION_ERROR, errors.join(' ')) : null;
  }

  renderNavigationMenu() {
    return <NavigationMenu currentView={PilotModel.getModelKey()}/>;
  }

  renderSimpleLayout(children) {
    return (
      <View onStoreModified={this.handleStoreModified} error={this.state.loadingError}>
        {this.renderNavigationMenu()}
        {children}
      </View>
    );
  }

  renderLoader() {
    return this.renderSimpleLayout(<SectionLoader/>);
  }

  renderLoadingError() {
    const errorBox = <ErrorBox error={this.state.loadingError} onTryAgain={this.handleStoreModified}/>;
    return this.renderSimpleLayout(errorBox);
  }

  renderSuccessMessage() {
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
  }

  render() {
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
                  onClick={navigationService.goToPilotEdit}
                />
              ]}
            />
          </Section>
        </form>

        {this.renderNavigationMenu()}
      </View>
    );
  }
}
