'use strict';

const React = require('react');
const browserHistory = require('react-router').browserHistory;
const ErrorTypes = require('../../errors/error-types');
const KoiflyError = require('../../errors/error');

const PilotModel = require('../../models/pilot');

const CsvFileUpload = require('../common/importing/csv-file-upload');
const ErrorBox = require('../common/notice/error-box');
const ImportError = require('../common/importing/import-error');
const Loader = require('../common/loader');
const NavigationMenu = require('../common/menu/navigation-menu');
const Section = require('../common/section/section');
const SectionTitle = require('../common/section/section-title');
const View = require('../common/view');


const PilotFlightsUpload = React.createClass({

    getInitialState: function() {
        return {
            dataUri: null,
            email: null,
            error: null,
            isImporting: false,
            loadingError: null,
            successSummary: false,
            userName: null
        };
    },

    handleStoreModified: function() {
        let pilot = PilotModel.getEditOutput();

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

    handleFile: function(event) {
        const file = event.target.files[0];

        this.setState({
            dataUri: null,
            error: null,
            successSummary: null
        });

        if (!file) {
            return;
        }

        // TODO validate file size
        console.log('name: ', file.name);
        console.log('size: ', file.size, 'bytes');

        const reader = new FileReader();
        reader.onload = upload => {
            this.setState({
                dataUri: upload.target.result
            });
        };

        reader.readAsDataURL(file);
    },

    handleImportFile: function() {
        this.setState({ isImporting: true });

        PilotModel
            .importFlights(this.state.dataUri)
            .then(successSummary => {
                this.setState({
                    successSummary,
                    error: null,
                    isImporting: false
                });
            })
            .catch(error => {
                this.setState({
                    error: error || new KoiflyError(ErrorTypes.DB_WRITE_ERROR),
                    isImporting: false
                });
            });
    },

    renderNavigationMenu: function() {
        return <NavigationMenu currentView={ PilotModel.getModelKey() } />;
    },

    renderSimpleLayout: function(children) {
        return (
            <View onStoreModified={ this.handleStoreModified } error={ this.state.loadingError }>
                { this.renderNavigationMenu() }
                { children }
            </View>
        );
    },

    renderLoader: function() {
        return this.renderSimpleLayout(<Loader />);
    },

    renderLoadingError: function() {
        const errorBox = <ErrorBox error={ this.state.loadingError } onTryAgain={ this.handleStoreModified } />;
        return this.renderSimpleLayout(errorBox);
    },

    renderSuccessMessage: function() {
        if (!this.state.successSummary) {
            return null;
        }

        return (
            <div>
                Your records were successfully saved:
                <ul>
                    <li>{this.state.successSummary.flightsNum} flights added;</li>
                    <li>{this.state.successSummary.sitesNum} sites added;</li>
                    <li>{this.state.successSummary.glidersNum} gliders added.</li>
                </ul>
            </div>
        );
    },

    renderDescription() {
        return (
            <div>
                File should be .csv format. First line should be header with next column names:
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
                Each line must have "date" value, other columns are optional.
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

        return (
            <View onStoreModified={ this.handleStoreModified } error={ this.state.loadingError }>
                <form>
                    <Section>
                        <SectionTitle>
                            <div>{ this.state.userName }</div>
                            <div>{ this.state.email }</div>
                        </SectionTitle>

                        <SectionTitle isSubtitle={ true }>
                            Import you flights:
                        </SectionTitle>

                        <CsvFileUpload
                            canImport={ this.state.dataUri && !this.state.error && !this.state.successSummary }
                            description={this.renderDescription()}
                            isImporting={ this.state.isImporting }
                            importError={this.state.error}
                            successMessage={ this.renderSuccessMessage() }
                            onChange={ this.handleFile }
                            onImport={ this.handleImportFile }
                            onCancel={ this.handleGoToPilotEdit }
                            />
                    </Section>
                </form>

                { this.renderNavigationMenu() }
            </View>
        );
    }
});


module.exports = PilotFlightsUpload;
