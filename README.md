![Build and Test](https://github.com/fico-xpress/vdlx-datagrid/workflows/Build%20and%20Test/badge.svg?branch=master)

# VDLX-DATAGRID

A drop-in alternative for the `vdl-table` component in a FICO Xpress Insight VDL view.
`vdlx-datagrid` provides a tabular visualisation, similar to `vdl-table`, but allows for much larger datasets to be displayed while trading off a few features in `vdl-table`.

For a list of available tags and attributes for the vdlx-datagrid component see [vdlx-datagrid-reference](https://github.com/fico-xpress/vdlx-datagrid/wiki/vdlx-datagrid-reference)

## How to use vdlx-datagrid in your Insight app

Download a release version of `vdx-datagrid` from [releases](https://github.com/fico-xpress/vdlx-datagrid/releases).
Choose a release where the first two numbers of the version match the version of VDL you are developing against.

Download the `vdlx-datagrid.zip` release bundle. Unzip the library into your `client_resources`, then include into your views as follows:

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

Each release includes an Insight app containing examples of how to use `vdlx-datagrid` features.

- Download `vdlx-datagrid-examples-app.zip` from one of the [releases](https://github.com/fico-xpress/vdlx-datagrid/releases).
- Upload the App zip to Xpress Insight

## Versions

See [CHANGELOG](./CHANGELOG.md) for a list of changes in each version.

## Features comparison between `vdl-table` and `vdlx-datgrid`.

### Features in `vdl-table` that are not currently included in `vdlx-datagrid`.

* Block and column selection
* Copy and Paste data
* Global search

### Unique features in `vdlx-datagrid`

* Support for larger datasets
* Scrollable table support

__Note:__ There are some features shared between `vdl-table` and `vdlx-datagrid` that are implemented differently. _Always test code ported between the two._ 

## Building from source

This will only be needed for developing the `vdlx-datagrid` extension. Refer to the 'Usage' section above for using this tag in your own views. 

1. `npm install`
1. `npm run build`

To watch the src and rebuild on changes run: `npm run watch`

## Building a release

See [RELEASE](./RELEASE.md) for instructions.
