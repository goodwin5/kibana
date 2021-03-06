/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const longString = Array(200).join('_');

export function getFakeRowVals(type, id, mapping) {
  return mapping.reduce((collector, field) => {
    collector[field.name] = `${field.name}_${type}_${id}_${longString}`;
    return collector;
  }, {});
}

export function getFakeRow(id, mapping) {
  return {
    _id: id,
    _index: 'test',
    _source: getFakeRowVals('original', id, mapping),
    _type: 'doc',
    sort: [id],
  };
}
