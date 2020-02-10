/**
 * Generate VDL Tag Reference HTML document.
 */
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');


// TODO find all attribute.js files and loop over them, loading them in
// TODO change attributes.js structure in all src to include tag-level properties
// TODO check they match expected structure

let attrFile = path.join(__dirname, '../../src/js/vdlx-datagrid/attributes.js');
let attrFileCol = path.join(__dirname, '../../src/js/vdlx-datagrid-column/attributes.js');

let extension = require(attrFile).default;
let extensionCol = require(attrFileCol).default;

let extensions = [
    {attributes: extension, tag: 'vdlx-datagrid', name: 'vdlx-datagrid'},
    {attributes: extensionCol, tag: 'vdlx-datagrid-column', name: 'vdlx-datagrid-column'}

];


// var extensions = modules.load('vdl-registry')
//     .getExtensionMetadata()
//     .filter(function (extension) {
//         // Filter out documentation ignored extensions
//         return !extension.doc || !extension.doc.ignore;
//     })
//     .sort(function (a, b) {
//         // Group by tag/attribute type, then alphanumeric on name
//         if (a.tag && !b.tag) {
//             return -1;
//         }
//         if (!a.tag && b.tag) {
//             return 1;
//         }
//         return a.name.localeCompare(b.name);
//     });

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


console.log(extension);

let tags = {extensions: extensions, attributeExtensions: []};

// var attributeExtensions = extensions.filter(function (extension) {
//     return !extension.tag;
// });


module.exports.vdltagsGenerate = function (extensionLoader, targetPath, jsApiScripts) {
    var outputFilename = path.join(targetPath, 'vdl-tags.json');

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
                console.error('Failed to write out generated HTML file. ' + e);
            }

        });
};

var outputFilename = path.join(__dirname, 'templates/static/index.html');
let templateFile = path.join(__dirname, 'templates/index.tmpl.html');

var template = handlebars.compile(fs.readFileSync(templateFile, 'utf-8'));

function mapAttributeExpressionProperties(tag) {
    tag.attributes = tag.attributes.map(function (attribute) {
        if (attribute.expression === 'all') {
            attribute.acceptsExpression = true;
        } else if (attribute.expression === 'dynamic') {
            attribute.requiresExpression = true;
        }
        return attribute;
    });
    return tag;
}

var docBaseProps = {
    documentTitle: 'vdlx-datagrid documentation',
    introduction: 'TODO - intro text',
    copyright: '© ' + new Date().getFullYear() + ' Fair Isaac Corporation. All rights reserved.',
    buildDate: new Date().toISOString().split('T')[0]
};

tags.extensions = tags.extensions.map(mapAttributeExpressionProperties);
tags.attributeExtensions = tags.attributeExtensions.map(mapAttributeExpressionProperties);

var docs = Object.assign({}, docBaseProps, tags);

try {
    fs.writeFileSync(outputFilename, template(docs));
} catch (e) {
    console.error('Failed to write out generated HTML file. ' + e);
}

