/*
   Xpress Insight vdlx-datagrid
   =============================

   file performance-measurement.js
   ```````````````````````````````
   vdlx-datagrid performance measurements.

    (c) Copyright 2019 Fair Isaac Corporation

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */
import {insight} from './insight-globals';

export default function(measurementDescription, measurement) {
    if (!insight.isDebugEnabled()) {
        return measurement();
    }

    const startTime = window.performance.now();
    const res = measurement();
    const printEnd = () => {
        const endTime = window.performance.now();
        console.log(
            `PERF: ${measurementDescription} has finished in: ${Math.round(
                endTime - startTime
            ).toLocaleString()} milliseconds`
        );
    };

    if (res instanceof Promise) {
        return res.then(value => {
            printEnd();
            return value;
        });
    }

    printEnd();
    return res;
}
