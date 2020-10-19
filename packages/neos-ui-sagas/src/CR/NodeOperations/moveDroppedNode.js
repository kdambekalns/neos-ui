import {takeEvery, put, select} from 'redux-saga/effects';
import {$get} from 'plow-js';

import {actions, actionTypes} from '@neos-project/neos-ui-redux-store';

import {calculateChangeTypeFromMode, calculateDomAddressesFromMode} from './helpers';

export default function * moveDroppedNode() {
    yield takeEvery(actionTypes.CR.Nodes.MOVE, function * handleNodeMove({payload}) {
        const {nodeToBeMoved: subject, targetNode: reference, position} = payload;

        const baseNodeType = yield select($get('ui.pageTree.filterNodeType'));

        yield put(actions.Changes.persistChanges([{
            type: calculateChangeTypeFromMode(position, 'Move'),
            subject,
            payload: {
                ...calculateDomAddressesFromMode(
                    position,
                    reference
                ),
                baseNodeType
            }
        }]));
    });
}
