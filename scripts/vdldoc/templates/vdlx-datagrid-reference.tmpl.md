# FICO® Xpress Insight vdlx-datagrid reference

## Tags

{{#each extensions}}
- [{{tag}}](#{{tag}})
{{/each}}

{{#each extensions}}
## {{tag}}

{{#if doc.description}}
{{{doc.description}}}
{{/if}}

{{#if doc.example}}
### Example

```html
{{{doc.example}}}
```
{{/if}}

{{#if requiredParent}}
Must be contained directly within one of the following elements:

{{#each requiredParent}}
- `{{this}}`
{{/each}}
{{/if}}

{{#if requiredAncestor}}
Must be nested within one of the following elements:

{{#each requiredAncestor}}
- `{{this}}`
{{/each}}
{{/if}}

{{#if doc.elementContents}}
### Element contents

{{#if doc.elementContents.acceptsMarkup}}
<span style="background-color: #777; color: #fff; font-size: 90%; padding: .1em .4em .2em; margin-bottom: .2em; white-space: nowrap; border-radius: .25em;">Markup allowed</span>
{{else}}
<span style="background-color: #777; color: #fff; font-size: 90%; padding: .1em .4em .2em; margin-bottom: .2em; white-space: nowrap; border-radius: .25em;">Text content only</span>
{{/if}}

{{#if doc.elementContents.description}}
{{doc.elementContents.description}}
{{/if}}
{{/if}}

{{#if attributes.length}}
### Attributes

| attribute | description | |
| --------- | ----------- | --- |
{{#each attributes}}
| {{{name}}} | {{{description}}} {{#if expressionVars}}<table><thead><tr><th>Variable</th><th>Type</th><th>Description</th></tr></thead><tbody>{{#each expressionVars}}<tr><td>{{name}}</td><td>`{{{type}}}`</td><td>{{{description}}}</td></tr>{{/each}}</tbody></table>{{/if}} | {{#if requiresExpression}}<span style="background-color: #337ab7; color: #fff; font-size: 90%; padding: .1em .4em .2em; margin-bottom: .2em; white-space: nowrap; border-radius: .25em;">requires&nbsp;expression</span> {{else if acceptsExpression}}<span style="background-color: #337ab7; color: #fff; font-size: 90%; padding: .1em .4em .2em; margin-bottom: .2em; white-space: nowrap; border-radius: .25em;">accepts&nbsp;expression</span>{{/if}} {{#if required}}<span style="background-color: #d9534f; color: #fff; font-size: 90%; padding: .1em .4em .2em; margin-bottom: .2em; white-space: nowrap; border-radius: .25em;">required</span>{{/if}} |
{{/each}}

{{/if}}

[Back to top](#Tags)

{{/each}}


&nbsp;

© 2020 Fair Isaac Corporation. All rights reserved.