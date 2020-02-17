import dataService from '../services/data-service';
import errorTypes from '../errors/error-types';
import KoiflyError from '../errors/error';
import Util from '../utils/util';


const BaseModel = {
  getModelKey() {
    return this.keys.single;
  },

  /**
   *
   * @param {string|number} [itemId]
   * @returns {Object|null} - all or one item of particular store
   * null - if store is empty
   * error - if loading error occurred or there is no item with requested id
   */
  getStoreContent(itemId) {
    // There is loading error
    const loadingError = dataService.getLoadingError();
    if (loadingError) {
      return { error: loadingError };
    }

    const storeContent = dataService.getStoreContent(this.keys.plural);

    // No data has been received yet
    if (!storeContent) {
      dataService.requestServerData();
      return null;
    }

    // No item with requested id
    if (itemId && !storeContent[itemId]) {
      return { error: new KoiflyError(errorTypes.RECORD_NOT_FOUND) };
    }

    if (itemId) {
      return storeContent[itemId];
    }

    return storeContent;
  },

  getValidationConfig() {
    return this.formValidationConfig;
  },

  /**
   * @param {object} newItem
   * @returns {Promise} - if saving was successful or not
   */
  saveItem(newItem) {
    newItem = this.getDataForServer(newItem);
    return dataService.saveData(newItem, this.getModelKey());
  },

  /**
   * @param {number} itemId
   * @returns {Promise} - if deleting was successful or not
   */
  deleteItem(itemId) {
    return dataService.saveData({ id: itemId, see: false }, this.getModelKey());
  },

  /**
   * Walks through new item and replace all empty values with default ones
   * @param {object} newItem
   * @returns {object} - with replaced empty fields
   */
  setDefaultValues(newItem) {
    const fieldsToReplace = {};
    const validationConfig = this.getValidationConfig();
    Object.keys(validationConfig).forEach(fieldName => {
      const fieldConfig = validationConfig[fieldName];
      // If there is default value for empty field - set it
      if (Util.isEmptyString(newItem[fieldName]) && fieldConfig.rules.defaultVal !== undefined) {
        fieldsToReplace[fieldName] = fieldConfig.rules.defaultVal;
      }
    });
    return Object.assign({}, newItem, fieldsToReplace);
  }
};


export default BaseModel;
