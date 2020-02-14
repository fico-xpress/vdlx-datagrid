const path = require('path');

const CWD = process.cwd();
const PACKAGE = require(path.join(CWD, 'package.json'));
const SOURCE_HEADER = `/*
   Xpress Insight vdlx-datagrid
   ============================
   package: ${PACKAGE.name}
   version: ${PACKAGE.version}

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
`;

const headersAndFooters = async ({name, bundler}) => {
    let filename = path.basename(name);
    let extension = path.extname(name);

    if (extension === '.js' /*&& bundler.options.production*/) {
        return {
            header: SOURCE_HEADER,
            footer: `//# sourceURL=${filename}`
        }
    }
};

module.exports = headersAndFooters;