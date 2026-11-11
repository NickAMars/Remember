import axios, { errorMessage } from '../utils/api';
import * as type from '../actions/types';
import { showToast } from '../utils/toast';

export default {
  /** One deck's details. */
  getMyCard: (deckUuid) => async () => {
    try {
      const response = await axios.get(`/api/profile/MasterCard/${deckUuid}`);
      return response.data;
    } catch (error) {
      showToast(errorMessage(error, 'Failed to load card'));
    }
  },

  /** A page of the user's decks. Each deck has `subCardCount` instead of all its cards. */
  getMyCards: (_pathname, { page, pageSize, search } = {}) => async dispatch => {
    try {
      const params = {};
      if (page !== undefined) params.page = page;
      if (pageSize !== undefined) params.pageSize = pageSize;
      if (search) params.search = search;
      const response = await axios.get('/api/profile/MasterCard', { params });
      const data = response.data || {};
      dispatch({ type: type.MYCARDS, payload: data.items || [], total: data.total });
    } catch (error) {
      showToast(errorMessage(error, 'Failed to load cards'));
    }
  },

  updateMaster: (deckUuid, changes) => async dispatch => {
    try {
      const response = await axios.put(`/api/profile/MasterCard/${deckUuid}`, changes);
      dispatch({ type: type.UPDATE_MASTER, payload: response.data });
      showToast(`"${changes.title}" updated successfully`);
    } catch (error) {
      showToast(errorMessage(error, `Failed to update "${changes.title}"`));
    }
  },

  deleteMaster: (deckUuid, title) => async dispatch => {
    try {
      await axios.delete(`/api/profile/MasterCard/${deckUuid}`);
      dispatch({ type: type.DELETE_MASTER, payload: deckUuid });
      showToast(`"${title}" deleted successfully`);
    } catch (error) {
      showToast(errorMessage(error, `Failed to delete "${title}"`));
    }
  },

  /** Save study time (milliseconds) for a deck. The server returns the deck's new total. */
  getMasterTime: (deckUuid, timeMs) => async dispatch => {
    try {
      const response = await axios.put(`/api/profile/MasterCard/time/${deckUuid}`, { time: timeMs });
      dispatch({ type: type.UPDATE_TIME, payload: response.data });
    } catch (error) {
      showToast(errorMessage(error, 'Failed to save time'));
    }
  },

  submitCard: (title, cards) => async dispatch => {
    try {
      const response = await axios.post('/api/profile/MasterCard', { title, cards });
      // Bug fix: this used to replace the whole deck list with the server's answer.
      dispatch({ type: type.ADD_MASTER, payload: response.data });
      showToast(`"${title}" created successfully`);
    } catch (error) {
      showToast(errorMessage(error, `Failed to create "${title}"`));
    }
  },
};
