/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { overwrite } from '../../helpers';
import { getBucketSize } from '../../helpers/get_bucket_size';
import { isLastValueTimerangeMode } from '../../helpers/get_timerange_mode';
import { getTimerange } from '../../helpers/get_timerange';
import { calculateAggRoot } from './calculate_agg_root';
import { search, UI_SETTINGS } from '../../../../../../../plugins/data/server';

const { dateHistogramInterval } = search.aggs;

export function dateHistogram(
  req,
  panel,
  esQueryConfig,
  seriesIndex,
  capabilities,
  uiSettings,
  buildSeriesMetaParams
) {
  return (next) => async (doc) => {
    const barTargetUiSettings = await uiSettings.get(UI_SETTINGS.HISTOGRAM_BAR_TARGET);
    const { timeField, interval } = await buildSeriesMetaParams();

    const meta = {
      timeField,
      index: panel.use_kibana_indexes ? seriesIndex.indexPattern?.id : undefined,
    };

    const getDateHistogramForLastBucketMode = () => {
      const { bucketSize, intervalString } = getBucketSize(
        req,
        interval,
        capabilities,
        barTargetUiSettings
      );
      const { from, to } = getTimerange(req);
      const { timezone } = capabilities;

      panel.series.forEach((column) => {
        const aggRoot = calculateAggRoot(doc, column);

        overwrite(doc, `${aggRoot}.timeseries.date_histogram`, {
          field: timeField,
          min_doc_count: 0,
          time_zone: timezone,
          extended_bounds: {
            min: from.valueOf(),
            max: to.valueOf(),
          },
          ...dateHistogramInterval(intervalString),
        });

        overwrite(doc, aggRoot.replace(/\.aggs$/, '.meta'), {
          ...meta,
          intervalString,
          bucketSize,
        });
      });
    };

    const getDateHistogramForEntireTimerangeMode = () => {
      panel.series.forEach((column) => {
        const aggRoot = calculateAggRoot(doc, column);

        overwrite(doc, `${aggRoot}.timeseries.auto_date_histogram`, {
          field: timeField,
          buckets: 1,
        });

        overwrite(doc, aggRoot.replace(/\.aggs$/, '.meta'), meta);
      });
    };

    isLastValueTimerangeMode(panel)
      ? getDateHistogramForLastBucketMode()
      : getDateHistogramForEntireTimerangeMode();

    return next(doc);
  };
}
