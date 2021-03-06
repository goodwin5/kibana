/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { SavedObjectsClientContract } from 'kibana/public';

import { App, AppDeps } from './app';
import { setHttpClient, setSavedObjectsClient } from './lib/api';
import { setDefaultEmailTo } from './7_x_only';

interface BootDeps extends AppDeps {
  element: HTMLElement;
  savedObjects: SavedObjectsClientContract;
  I18nContext: any;
}

export const renderApp = (bootDeps: BootDeps) => {
  const { I18nContext, element, savedObjects, ...appDeps } = bootDeps;

  setDefaultEmailTo(bootDeps.uiSettings.get('xPack:defaultAdminEmail'));
  setHttpClient(appDeps.http);
  setSavedObjectsClient(savedObjects);

  render(
    <I18nContext>
      <App {...appDeps} />
    </I18nContext>,
    element
  );

  return () => {
    unmountComponentAtNode(element);
  };
};
