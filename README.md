# VDLX-DATAGRID

A drop-in alternative for the `vdl-table` component in a FICO Xpress Insight VDL view.
`vdlx-datagrid` provides a tabular visualisation, similar to `vdl-table`, but allows for much larger datasets to be displayed while trading off a few features in `vdl-table`. 

## Features comparison between `vdl-table` and `vdlx-datgrid`.

### Features in `vdl-table` that are not currently included in `vdlx-datagrid`.

* Block and column selection
* Copy and Paste data
* Global search

### Unique features in `vdlx-datagrid`

* Support for larger datasets
* Scrollable table support

__Note:__ There are some features shared between `vdl-table` and `vdlx-datagrid` that are implemented differently. _Always test code ported between the two._ 

## Usage

Everything you need to use the `vdlx-datagrid` VDL extension, for your own VDL app, is in the `dist` folder of this repo. 

For an existing Insight app copy the `vdlx-datgrid` folder into the `client_resources` folder of your app.

The VDL code needed to use `vdlx-datagid` in a VDL view is:

```html
<vdl-include src="vdlx-datagrid/vdlx-datagrid.vdl"></vdl-include>
```

As mentioned above `vdlx-datagrid` is mostly a drop-in replacement for `vdl-table` and can generally be used by renaming code examples:

```html
<vdlx-datagrid id="basic-example-1">
    <vdlx-datagrid-column set="SupportLevels">Support L.</vdlx-datagrid-column>
    <vdlx-datagrid-column entity="SupportCosts"></vdlx-datagrid-column>
    <vdlx-datagrid-column entity="ServiceLevelAgreements"></vdlx-datagrid-column>
</vdlx-datagrid>
``` 

## The 'vdl-datagrid example' app

The [insight](./insight) folder contains an example app showing `vdlx-datagrid` in use.
To upload it to your install of FICO Xpress Insight, follow these instructions:

1. Clone this Git repository:
   * `git clone https://github.com/fico-xpress/vdlx-datagrid.git`
1. `cd vdlx-datagrid`
1. Generate the test data for the app: 
   1. `npm install`
   1. `npm run generate-test-data`
   1. `cd insight`
1. Zip everything in this folder.
1. Upload the App zip to Xpress Insight

## Building from source

This will only be needed for developing the `vdlx-datagrid` extension. Refer to the 'Usage' section above for using this tag in your own views. 

1. `npm install`
1. `npm run watch`
