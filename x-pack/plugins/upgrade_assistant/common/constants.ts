/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import SemVer from 'semver/classes/semver';

/*
 * These constants are used only in tests to add conditional logic based on Kibana version
 * On master, the version should represent the next major version (e.g., master --> 8.0.0)
 * The release branch should match the release version (e.g., 7.x --> 7.0.0)
 */
export const mockKibanaVersion = '7.0.0';
export const mockKibanaSemverVersion = new SemVer(mockKibanaVersion);

/*
 * This will be set to true up until the last minor before the next major.
 * In readonly mode, the user will not be able to perform any actions in the UI
 * and will be presented with a message indicating as such.
 */
export const UA_READONLY_MODE = true;

/*
 * Map of 7.0 --> 8.0 index setting deprecation log messages and associated settings
 * We currently only support one setting deprecation (translog retention), but the code is written
 * in a way to be able to support any number of deprecated index settings defined here
 */
export const indexSettingDeprecations = {
  translog: {
    deprecationMessage: 'translog retention settings are ignored', // expected message from ES deprecation info API
    settings: ['translog.retention.size', 'translog.retention.age'],
  },
};

export const API_BASE_PATH = '/api/upgrade_assistant';
