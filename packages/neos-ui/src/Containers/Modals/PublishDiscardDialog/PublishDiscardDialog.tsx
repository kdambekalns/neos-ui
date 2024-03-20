/*
 * This file is part of the Neos.Neos.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */
import React from 'react';
// @ts-ignore
import {connect} from 'react-redux';

import {actions, selectors} from '@neos-project/neos-ui-redux-store';
import {GlobalState} from '@neos-project/neos-ui-redux-store/src/System';
import {
    PublishDiscardScope,
    PublishDiscardPhase,
    State as PublishingState
} from '@neos-project/neos-ui-redux-store/src/CR/Publishing';

import {ConfirmationDialog} from './ConfirmationDialog';
import {ProcessIndicator} from './ProcessIndicator';
import {ResultDialog} from './ResultDialog';

const {publishableNodesSelector, publishableNodesInDocumentSelector} = (selectors as any).CR.Workspaces;
const {siteNodeSelector, documentNodeSelector} = (selectors as any).CR.Nodes;

type PublishingDialogProperties =
    | { publishingState: null }
    | {
        publishingState: NonNullable<PublishingState>;
        scopeTitle: string;
        workspaceName: string;
        numberOfChanges: number;
    };

type PublishingDialogHandlers = {
    cancel: () => void;
    confirm: () => void;
    acknowledge: () => void;
}

type PublishDiscardDialogProps =
    PublishingDialogProperties & PublishingDialogHandlers;

const PublishDiscardDialog: React.FC<PublishDiscardDialogProps> = (props) => {
    const handleCancel = React.useCallback(() => {
        props.cancel();
    }, []);
    const handleConfirm = React.useCallback(() => {
        props.confirm();
    }, []);
    const handleAcknowledge = React.useCallback(() => {
        props.acknowledge();
    }, []);
    const handleRetry = React.useCallback(() => {
        console.log('@TODO: handleRetry');
    }, []);

    if (props.publishingState === null) {
        return null;
    }

    switch (props.publishingState.process.phase) {
        case PublishDiscardPhase.START:
            return (
                <ConfirmationDialog
                    mode={props.publishingState.mode}
                    scope={props.publishingState.scope}
                    scopeTitle={props.scopeTitle}
                    workspaceName={props.workspaceName}
                    numberOfChanges={props.numberOfChanges}
                    onAbort={handleCancel}
                    onConfirm={handleConfirm}
                    />
            );

        case PublishDiscardPhase.ONGOING:
            return (
                <ProcessIndicator
                    mode={props.publishingState.mode}
                    scope={props.publishingState.scope}
                    scopeTitle={props.scopeTitle}
                    numberOfChanges={props.numberOfChanges}
                    />
            );

        case PublishDiscardPhase.ERROR:
        case PublishDiscardPhase.SUCCESS:
            return (
                <ResultDialog
                    mode={props.publishingState.mode}
                    scope={props.publishingState.scope}
                    scopeTitle={props.scopeTitle}
                    numberOfChanges={props.numberOfChanges}
                    result={props.publishingState.process}
                    onAcknowledge={handleAcknowledge}
                    onRetry={handleRetry}
                    />
            );
    }
};

export default connect((state: GlobalState): PublishingDialogProperties => {
    const {publishing: publishingState} = state.cr;
    if (publishingState === null) {
        return {publishingState};
    }

    const {scope} = publishingState;
    const {name: workspaceName} = state.cr.workspaces.personalWorkspace;

    let numberOfChanges = 0;
    if (scope === PublishDiscardScope.SITE) {
        numberOfChanges = publishableNodesSelector(state).length;
    } else if (scope === PublishDiscardScope.DOCUMENT) {
        numberOfChanges = publishableNodesInDocumentSelector(state).length;
    }

    let scopeTitle = 'N/A';
    if (scope === PublishDiscardScope.SITE) {
        scopeTitle = siteNodeSelector(state).label;
    } else if (scope === PublishDiscardScope.DOCUMENT) {
        scopeTitle = documentNodeSelector(state).label;
    }

    return {
        publishingState,
        workspaceName,
        numberOfChanges,
        scopeTitle
    };
}, {
    confirm: (actions as any).CR.Publishing.confirm,
    cancel: (actions as any).CR.Publishing.cancel,
    acknowledge: (actions as any).CR.Publishing.acknowledge
})(PublishDiscardDialog);
