import pubSub from '../../utils/pubsub';

class StatsViewStore {
  constructor() {
    this._state = {
      selectedFlightIds: [],
      selectedSiteId: null,
      selectedYear: null,
      selectedMonth: null
    };

    this._events = {
      STATS_VIEW_STORE_UPDATED: 'STATS_VIEW_STORE_UPDATED'
    };
  }

  get events() {
    return Object.assign({}, this._events);
  }

  get selectedFlightIds() {
    return this._state.selectedFlightIds;
  }

  get selectedSiteId() {
    return this._state.selectedSiteId;
  }

  get selectedYear() {
    return this._state.selectedYear;
  }

  get selectedMonth() {
    return this._state.selectedMonth;
  }

  updateState(newValues) {
    this._state = Object.assign(this._state, newValues);
    pubSub.emit(this._events.STATS_VIEW_STORE_UPDATED);
  }
}

export default new StatsViewStore();
