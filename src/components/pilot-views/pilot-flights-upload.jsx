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
const Notice = require('../common/notice/notice');
const Section = require('../common/section/section');
const SectionTitle = require('../common/section/section-title');
const View = require('../common/view');


const PilotFlightsUpload = React.createClass({

    getInitialState: function() {
        return {
            userName: null,
            email: null,
            file: null,
            error: null,
            loadingError: null,
            isImporting: false,
            successNotice: false,
            dataUri: null
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
        const reader = new FileReader();

        console.log('name: ', file.name);
        console.log('size: ', file.size, 'bytes');

        this.setState({
            file: file,
            error: null
        });

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
            .then(() => {
                this.setState({
                    successNotice: true,
                    error: null,
                    isImporting: false
                });
            })
            .catch(error => {
                console.log('error', error);
                // TODO check whether it's a general error or list of errors for each file row
                this.setState({
                    error: new KoiflyError(ErrorTypes.DB_WRITE_ERROR),
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

    // TODO replace with renderUploadingError method
    renderProcessingError: function() {
        return <ErrorBox error={ this.state.error } />;
    },

    renderUploadingError: function() {
        return <ImportError errors={ this.state.errors } />;
    },

    renderSuccessNotice: function() {
        const onClose = () => this.setState({ successNotice: false });
        return <Notice type='success' text='Your records were successfully saved' onClose={ onClose }/>;
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
                    { this.state.error && this.renderProcessingError() }
                    { this.state.successNotice && this.renderSuccessNotice() }
                    <Section>
                        <SectionTitle>
                            <div>{ this.state.userName }</div>
                            <div>{ this.state.email }</div>
                        </SectionTitle>

                        <SectionTitle isSubtitle={ true }>
                            Import you flights:
                        </SectionTitle>

                        <CsvFileUpload
                            canImport={ this.state.dataUri && !this.state.error }
                            isImporting={ this.state.isImporting }
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
