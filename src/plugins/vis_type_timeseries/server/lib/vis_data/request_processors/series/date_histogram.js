/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { overwrite } from '../../helpers';
import { getBucketSize } from '../../helpers/get_bucket_size';
import { offsetTime } from '../../offset_time';
import { isLastValueTimerangeMode } from '../../helpers/get_timerange_mode';
import { search, UI_SETTINGS } from '../../../../../../../plugins/data/server';

const { dateHistogramInterval } = search.aggs;

export function dateHistogram(
  req,
  panel,
  series,
  esQueryConfig,
  seriesIndex,
  capabilities,
  uiSettings,
  buildSeriesMetaParams
) {
  return (next) => async (doc) => {
    const maxBarsUiSettings = await uiSettings.get(UI_SETTINGS.HISTOGRAM_MAX_BARS);
    const barTargetUiSettings = await uiSettings.get(UI_SETTINGS.HISTOGRAM_BAR_TARGET);

    const { timeField, interval, maxBars } = await buildSeriesMetaParams();
    const { bucketSize, intervalString } = getBucketSize(
      req,
      interval,
      capabilities,
      maxBars ? Math.min(maxBarsUiSettings, maxBars) : barTargetUiSettings
    );

    const getDateHistogramForLastBucketMode = () => {
      const { from, to } = offsetTime(req, series.offset_time);
      const { timezone } = capabilities;

      overwrite(doc, `aggs.${series.id}.aggs.timeseries.date_histogram`, {
        field: timeField,
        min_doc_count: 0,
        time_zone: timezone,
        extended_bounds: {
          min: from.valueOf(),
          max: to.valueOf(),
        },
        ...dateHistogramInterval(intervalString),
      });
    };

    const getDateHistogramForEntireTimerangeMode = () =>
      overwrite(doc, `aggs.${series.id}.aggs.timeseries.auto_date_histogram`, {
        field: timeField,
        buckets: 1,
      });

    isLastValueTimerangeMode(panel, series)
      ? getDateHistogramForLastBucketMode()
      : getDateHistogramForEntireTimerangeMode();

    overwrite(doc, `aggs.${series.id}.meta`, {
      timeField,
      intervalString,
      bucketSize,
      seriesId: series.id,
      index: panel.use_kibana_indexes ? seriesIndex.indexPattern?.id : undefined,
    });

    return next(doc);
  };
}
