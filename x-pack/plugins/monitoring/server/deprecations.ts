/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { get } from 'lodash';
import { ConfigDeprecationFactory, ConfigDeprecation } from 'kibana/server';
import { CLUSTER_ALERTS_ADDRESS_CONFIG_KEY } from '../common/constants';

/**
 * Re-writes deprecated user-defined config settings and logs warnings as a
 * result of any rewrite operations.
 *
 * Important: Do not remove any deprecation warning until at least the next
 * major version!
 * @return {Array} array of rename operations and callback function for rename logging
 */
export const deprecations = ({
  rename,
  renameFromRoot,
}: ConfigDeprecationFactory): ConfigDeprecation[] => {
  return [
    // This order matters. The "blanket rename" needs to happen at the end
    renameFromRoot('xpack.monitoring.max_bucket_size', 'monitoring.ui.max_bucket_size'),
    renameFromRoot('xpack.monitoring.min_interval_seconds', 'monitoring.ui.min_interval_seconds'),
    renameFromRoot(
      'xpack.monitoring.show_license_expiration',
      'monitoring.ui.show_license_expiration'
    ),
    renameFromRoot(
      'xpack.monitoring.ui.container.elasticsearch.enabled',
      'monitoring.ui.container.elasticsearch.enabled'
    ),
    renameFromRoot(
      'xpack.monitoring.ui.container.logstash.enabled',
      'monitoring.ui.container.logstash.enabled'
    ),
    renameFromRoot('xpack.monitoring.elasticsearch', 'monitoring.ui.elasticsearch'),
    renameFromRoot('xpack.monitoring.ccs.enabled', 'monitoring.ui.ccs.enabled'),
    renameFromRoot(
      'xpack.monitoring.elasticsearch.logFetchCount',
      'monitoring.ui.elasticsearch.logFetchCount'
    ),
    renameFromRoot('xpack.monitoring', 'monitoring'),
    (config, fromPath, addDeprecation) => {
      const clusterAlertsEnabled = get(config, 'monitoring.cluster_alerts.enabled', true);
      const emailNotificationsEnabled =
        clusterAlertsEnabled &&
        get(config, 'monitoring.cluster_alerts.email_notifications.enabled', true);
      const updatedKey = get(config, `monitoring.${CLUSTER_ALERTS_ADDRESS_CONFIG_KEY}`);
      const legacyKey = get(config, `xpack.monitoring.${CLUSTER_ALERTS_ADDRESS_CONFIG_KEY}`);
      if (emailNotificationsEnabled && !updatedKey && !legacyKey) {
        addDeprecation({
          message: `Config key [${fromPath}.${CLUSTER_ALERTS_ADDRESS_CONFIG_KEY}] will be required for email notifications to work in 8.0."`,
        });
      }
      return config;
    },
    (config, fromPath, addDeprecation) => {
      const es: Record<string, any> = get(config, 'elasticsearch');
      if (es) {
        if (es.username === 'elastic') {
          addDeprecation({
            message: `Setting [${fromPath}.username] to "elastic" is deprecated. You should use the "kibana_system" user instead.`,
          });
        } else if (es.username === 'kibana') {
          addDeprecation({
            message: `Setting [${fromPath}.username] to "kibana" is deprecated. You should use the "kibana_system" user instead.`,
          });
        }
      }
      return config;
    },
    (config, fromPath, addDeprecation) => {
      const ssl: Record<string, any> = get(config, 'elasticsearch.ssl');
      if (ssl) {
        if (ssl.key !== undefined && ssl.certificate === undefined) {
          addDeprecation({
            message: `Setting [${fromPath}.key] without [${fromPath}.certificate] is deprecated. This has no effect, you should use both settings to enable TLS client authentication to Elasticsearch.`,
          });
        } else if (ssl.certificate !== undefined && ssl.key === undefined) {
          addDeprecation({
            message: `Setting [${fromPath}.certificate] without [${fromPath}.key] is deprecated. This has no effect, you should use both settings to enable TLS client authentication to Elasticsearch.`,
          });
        }
      }
      return config;
    },
    rename('xpack_api_polling_frequency_millis', 'licensing.api_polling_frequency'),
  ];
};
