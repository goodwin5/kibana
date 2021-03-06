/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { KibanaRequest } from 'src/core/server';
import { ReportingCore } from '../';
import { durationToNumber } from '../../common/schema_utils';
import { BaseParams, ReportingUser } from '../types';
import { LevelLogger } from './';
import { Report } from './store';
import type { ReportingRequestHandlerContext } from '../types';

export type EnqueueJobFn = (
  exportTypeId: string,
  jobParams: BaseParams,
  user: ReportingUser,
  context: ReportingRequestHandlerContext,
  request: KibanaRequest
) => Promise<Report>;

export function enqueueJobFactory(
  reporting: ReportingCore,
  parentLogger: LevelLogger
): EnqueueJobFn {
  const logger = parentLogger.clone(['queue-job']);
  const config = reporting.getConfig();
  const jobSettings = {
    timeout: durationToNumber(config.get('queue', 'timeout')),
    browser_type: config.get('capture', 'browser', 'type'),
    max_attempts: config.get('capture', 'maxAttempts'),
    priority: 10, // unused
  };

  return async function enqueueJob(
    exportTypeId: string,
    jobParams: BaseParams,
    user: ReportingUser,
    context: ReportingRequestHandlerContext,
    request: KibanaRequest
  ) {
    const exportType = reporting.getExportTypesRegistry().getById(exportTypeId);

    if (exportType == null) {
      throw new Error(`Export type ${exportTypeId} does not exist in the registry!`);
    }

    if (!exportType.createJobFnFactory) {
      throw new Error(`Export type ${exportTypeId} is not an async job type!`);
    }

    const [createJob, store] = await Promise.all([
      exportType.createJobFnFactory(reporting, logger.clone([exportType.id])),
      reporting.getStore(),
    ]);

    const job = await createJob!(jobParams, context, request);
    const pendingReport = new Report({
      jobtype: exportType.jobType,
      created_by: user ? user.username : false,
      payload: job,
      meta: {
        objectType: jobParams.objectType,
        layout: jobParams.layout?.id,
      },
      ...jobSettings,
    });

    // store the pending report, puts it in the Reporting Management UI table
    const report = await store.addReport(pendingReport);

    logger.info(`Queued ${exportType.name} report: ${report._id}`);

    return report;
  };
}
