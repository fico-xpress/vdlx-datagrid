/**
 * Generate VDL Tag Reference HTML document.
 */
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');
const {version} = require('../../package.json');

const MODULES = [
    '../../src/js/vdlx-datagrid/metadata.js',
    '../../src/js/vdlx-datagrid-column/metadata.js',
    '../../src/js/vdlx-datagrid-index-filter/metadata.js',
    '../../src/js/vdlx-datagrid-validate/metadata.js',
    '../../src/js/vdlx-pivotgrid/metadata.js'
];
const TARGET_DIR = path.join(__dirname, '../../docs');

let extensions = MODULES
    .map(modFile => {
        let modPath = path.join(__dirname, modFile);
        return require(modPath).default;
    })
    .filter(function (extension) {
        // Filter out documentation ignored extensions
        return !extension.doc || !extension.doc.ignore;
    });

extensions.forEach(function (extension) {
    extension.attributes = extension.attributes
        // Remove attributes that have been marked as doc ignored
        .filter(function (attribute) {
            return !attribute.docIgnore;
        })
        // Required attributes come first
        // Naturally sort attribute names
        .sort(function (a, b) {
            if (a.required && !b.required) {
                return -1;
            } else if (!a.required && b.required) {
                return 1;
            } else {
                var aName = a.name ? a.name.toLowerCase() : a.toLowerCase();
                var bName = b.name ? b.name.toLowerCase() : b.toLowerCase();
                if (aName < bName) {
                    return -1;
                } else if (aName > bName) {
                    return 1;
                }
                return 0;
            }
        });
});

let tags = {
    extensions: extensions,
    attributeExtensions: [],
    documentTitle: 'vdlx-datagrid reference',
    copyright: '© ' + new Date().getFullYear() + ' Fair Isaac Corporation. All rights reserved.',
    projectVersion: version
};

module.exports.vdltagsGenerate = function (extensionLoader, targetPath, jsApiScripts) {
    var outputFilename = path.join(targetPath, 'vdlx-datagrid-tags.json');

    return getVdlTags(extensionLoader, jsApiScripts)
        .then(function (tags) {
            var mapFn = function (extension) {
                return {
                    tag: extension.tag,
                    isContainer: extension.isContainer,
                    attributes: extension.attributes,
                    doc: extension.doc,
                    name: extension.name,
                    requiredParent: extension.requiredParent,
                    modifiesDescendants: extension.modifiesDescendants || false,
                    requiredAncestor: extension.requiredAncestor,
                    allowedChildren: extension.allowedChildren
                };
            };
            tags.extensions = tags.extensions.map(mapFn);
            tags.attributeExtensions = tags.attributeExtensions.map(mapFn);

            try {
                fs.writeFileSync(outputFilename, JSON.stringify(tags, null, 4));
            } catch (e) {
                console.error('Failed to write out generated JSON file. ' + e);
            }

        });
};

var outputFilename = path.join(TARGET_DIR, 'vdlx-datagrid-reference.html');
let templateFile = path.join(__dirname, 'templates/vdlx-datagrid-reference.tmpl.html');

var template = handlebars.compile(fs.readFileSync(templateFile, 'utf-8'));

function mapAttributeExpressionProperties(tag) {
    tag.attributes = tag.attributes.map(function (attribute) {
        if (attribute.defaultValue !== undefined) {
            attribute.defaultValue = String(attribute.defaultValue);
        }
        if (attribute.expression === 'all') {
            attribute.acceptsExpression = true;
        } else if (attribute.expression === 'dynamic') {
            attribute.requiresExpression = true;
        }
        return attribute;
    });
    return tag;
}

tags.extensions = tags.extensions.map(mapAttributeExpressionProperties);
tags.attributeExtensions = tags.attributeExtensions.map(mapAttributeExpressionProperties);

try {
    fs.writeFileSync(outputFilename, template(tags));
} catch (e) {
    console.error('Failed to write out generated MD file. ' + e);
}
