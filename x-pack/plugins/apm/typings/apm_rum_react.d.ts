/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

declare module '@elastic/apm-rum-react' {
  import { RouteProps } from 'react-router-dom';

  export function indexManagementStore(): any;
  export const ApmRoute: React.ComponentClass<RouteProps>;
}
