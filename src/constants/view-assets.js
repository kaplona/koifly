'use strict';

const FlightModel = require('../models/flight');
const GliderModel = require('../models/glider');
const SiteModel = require('../models/site');
const PilotModel = require('../models/pilot');


const StoreAssets = {

  [FlightModel.getModelKey()]: {
    model: FlightModel,
    addButtonCaption: 'Add Flight',
    deleteAlertMessage: 'Delete this flight?'
  },

  [GliderModel.getModelKey()]: {
    model: GliderModel,
    addButtonCaption: 'Add Glider',
    deleteAlertMessage: 'References to this glider will be deleted from all flight records'
  },

  [SiteModel.getModelKey()]: {
    model: SiteModel,
    addButtonCaption: 'Add Site',
    deleteAlertMessage: 'References to this site will be deleted from all flight records'
  },

  [PilotModel.getModelKey()]: {
    model: PilotModel
  }
};


module.exports = StoreAssets;
