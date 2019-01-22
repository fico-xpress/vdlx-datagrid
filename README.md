# VDLX-DATAGRID

## VDL Performance Table Component

A drop-in alternative for the `vdl-table` tag in a FICO Xpress Insight custom view.
`vdlx-datagrid` provides the same tabular visualisation as `vdl-table` but allows for much larger datasets to be displayed while trading off a few features in `vdl-table`.

`vdlx-datgrid` is experimental code for exploring new features. It is always preferred that the built-in `vdl-table` be used where possible because `vdl-table` has been tested for several years on production systems. 

#### Features comparison between `vdl-table` and `vdlx-datgrid`.

##### Features in `vdl-table` that are not currently included in `vdlx-datagrid`.

* Block and column selection
* Pasting data
* Global search box

##### Unique features in `vdlx-datagrid`

* Support for larger datasets
* Choose between scrolling and pagination

__Note:__ There are some features shared between `vdl-table` and `vdlx-datagrid` that are implemented differently. _Always test code ported between the two._ 

### Usage

Everything you need to use the `vdlx-datagrid` VDL extension, for your own VDL app, is in the `dist` folder of this repo. 

For an existing Insight app copy the `vdlx-datgrid` folder into the `client_resources` folder of your app.

The VDL code needed to use `vdlx-datagid` in a VDL view is:

```html
<vdl-include src="vdlx-datagrid/vdlx-datagrid.vdl"></vdl-include>
```

As mentioned above `vdlx-datagrid` is mostly a drop-in replacement for `vdl-table` and can generally be used by renaming code examples:

```
<vdlx-datagrid id="basic-example-1">
    <vdlx-datagrid-column set="SupportLevels">Support L.</vdlx-datagrid-column>
    <vdlx-datagrid-column entity="SupportCosts"></vdlx-datagrid-column>
    <vdlx-datagrid-column entity="ServiceLevelAgreements"></vdlx-datagrid-column>
</vdlx-datagrid>
``` 

### The 'table performance' app

The `insight` folder contains an example app with a good number of exaamples showing `vdlx-datagrid` in use.
To upload it to your install of FICO Xpress Insight, folloing these instructions:

1. clone the Git repository
    1. `git clone https://JohnOConnor@gitserver.fairisaac.com:8443/scm/~johnoconnor/vdl-table-performance.git`
1.  `cd vdl-table-performance`
1. `npm install`
1. `node generate-data.js`
1. `cd insight`
1. zip everything in this folder.
1. Upload to Xpress Insight


### Building from source

This will only be needed for developing the `vdlx-datagrid` extension. Refer to the 'Usage' section above for using this tag in your own views. 

1. `npm install`
1. `npm run watch`

### Known issues
1. sort-by-formatted attribute not supported