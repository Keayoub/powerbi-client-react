// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { AppRouter } from './components/router/AppRouter';
import './DemoApp.css';

// Root Component to demonstrate usage of embedded component
function DemoApp (): JSX.Element {
	return <AppRouter />;
}

export default DemoApp;
