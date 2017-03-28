/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import axios from 'axios';
// import fetchMetersDetailsIfNeeded from './meters';

export const REQUEST_GROUPS_DETAILS = 'REQUEST_GROUPS_DETAILS';
export const RECEIVE_GROUPS_DETAILS = 'RECEIVE_GROUPS_DETAILS';

export const REQUEST_GROUP_CHILDREN = 'REQUEST_GROUP_CHILDREN';
export const RECEIVE_GROUP_CHILDREN = 'RECEIVE_GROUP_CHILDREN';

function requestGroupsDetails() {
	return { type: REQUEST_GROUPS_DETAILS };
}

function receiveGroupsDetails(data) {
	return { type: RECEIVE_GROUPS_DETAILS, data };
}

function fetchGroupsDetails() {
	return dispatch => {
		dispatch(requestGroupsDetails());
		// Returns the names and IDs of all groups in the groups table.
		return axios.get('/api/groups/')
			.then(response => {
				dispatch(receiveGroupsDetails(response.data));
			});
	};
}


/**
 * @param {State} state
 */
function shouldFetchGroupsDetails(state) {
	return !state.groups.isFetching && state.groups.groups === undefined;
}

/**
 * @returns {function(*, *)}
 */
export function fetchGroupsDetailsIfNeeded() {
	return (dispatch, getState) => {
		if (shouldFetchGroupsDetails(getState())) {
			return dispatch(fetchGroupsDetails());
		}
		return Promise.resolve();
	};
}

function requestGroupChildren(groupID) {
	return { type: REQUEST_GROUP_CHILDREN, groupID };
}

function receiveGroupChildren(groupID, data) {
	return { type: RECEIVE_GROUP_CHILDREN, groupID, data };
}

function shouldFetchGroupChildren(state, groupID) {
	const group = state.groups.byGroupID[groupID];
	// Check that the group has no children of any kind AND that it is not being fetched.
	return (group.childGroups.length === 0 && group.childMeters.length === 0) && !group.isFetching;
}

function fetchGroupChildren(groupID) {
	return dispatch => {
		dispatch(requestGroupChildren(groupID));
		return axios.get(`api/groups/children/${groupID}`)
			.then(response => dispatch(receiveGroupChildren(groupID, response.data)));
	};
}
/**
 *
 * @param groupID
 * @returns {function(*, *)}
 */
export function fetchGroupChildrenIfNeeded(groupID) {
	return (dispatch, getState) => {
		if (shouldFetchGroupChildren(getState(), groupID)) {
			return dispatch(fetchGroupChildren(groupID));
		}
		return Promise.resolve();
	};
}
