![Build and Test](https://github.com/fico-xpress/vdlx-datagrid/workflows/Build%20and%20Test/badge.svg?branch=master)

# VDLX-DATAGRID

`vdlx-datagrid` provides a tabular visualisation, similar to `vdl-table`, but allows for much larger datasets to be displayed while trading off a few features in `vdl-table`.

## What is vdlx-datagrid
An easily implemented third-party alternative for the `vdl-table` component in a FICO Xpress Insight VDL view.

## Features available in vdlx-datagrid
For a list of available tags and attributes for the vdlx-datagrid component see [vdlx-datagrid-reference](https://github.com/fico-xpress/vdlx-datagrid/wiki/vdlx-datagrid-reference)

## How to use vdlx-datagrid in your Insight app

Download the appropriate release version of `vdx-datagrid` from [releases](https://github.com/fico-xpress/vdlx-datagrid/releases) - 
The first two digits of the vdlx-datagrid release version number must match the version of VDL you are using to develop. For example, if you are developing for VDL 4.6.X, download vdlx-datagrid version 4.6.X.

Unzip the `vdlx-datagrid.zip` release bundle into your Xpress Workbench `client_resources` folder. You can then add vdlx-datagrid in your views via the code editor-vdlx-datagrid is not available in the VDL Designer palette:

```html
<vdl-include src="vdlx-datagrid/vdlx-datagrid.vdl"></vdl-include>
```

`vdlx-datagrid` is mostly a drop-in replacement for `vdl-table` and can generally be used by renaming code examples:

```html
<vdlx-datagrid id="basic-example-1">
    <vdlx-datagrid-column set="SupportLevels">Support L.</vdlx-datagrid-column>
    <vdlx-datagrid-column entity="SupportCosts"></vdlx-datagrid-column>
    <vdlx-datagrid-column entity="ServiceLevelAgreements"></vdlx-datagrid-column>
</vdlx-datagrid>
``` 

## The vdl-datagrid examples app

Each release includes an Xpress Insight app containing examples of how to use `vdlx-datagrid` features.

- Download `vdlx-datagrid-examples-app.zip` from one of the [releases](https://github.com/fico-xpress/vdlx-datagrid/releases).
- Upload the App zip to Xpress Insight

## Versions

See [CHANGELOG](./CHANGELOG.md) for a list of changes in each version.

## Features comparison between `vdl-table` and `vdlx-datagrid`.

__Note:__ There are some features shared between `vdl-table` and `vdlx-datagrid` that are implemented differently. _Always test any code ported between the two._ 

### Features available in `vdl-table` that are not included in `vdlx-datagrid` 4.6.x.

* Block and column selection
* Copy and Paste data
* Global search

### Features unique to `vdlx-datagrid`

* Support for larger datasets
* Scrollable table support

## Building from source

This information is only required if you are developing the `vdlx-datagrid` extension. See the 'Usage' section above for more on using this tag in your views. 

1. `npm install`
1. `npm run build`

To watch the src and rebuild on changes, run: `npm run watch`

## Building a release

See [RELEASE](./RELEASE.md) for instructions.
