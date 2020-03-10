# vdlx-datagrid changelog

## v4.7.0

- Updated to VDL 4.7 compatibility.
- Index columns are automatically sorted using corresponding `vdl-set-sorter` or the default set sorter for the index column data type.


## v4.6.2

- Export data as CSV: New vdlx-datagrid attributes `show-export` and `export-filename` that display a datagrid header 
  button to allow the user to download the current table contents to a CSV file.
- Save any pending cell edits when the view is unloaded. 
- Index columns can be positioned anywhere in the datagrid. When index column is defined in VDL, its' position in VDL defines its'
  position in datagrid.
- Default sorting can be set with new `vdlx-datagrid-column` attributes `sort-order` and `sort-direction`.
- Calculated columns support with a `render` attribute.
- Moved test data generation into the model so it can be generated on Scenario load instead of being bundled with the app.
- Added the `sort-by-formatted` attribute on `vdlx-datagrid-column` to switch sorting to use the display value. By default column sorting
  uses the underlying data values when sorting. Note this is likely to reduce performance when enabled of large tables and a user sorts columns.
- Changes to the organisation of view in the examples app.
- Range operators for column filters.
- Published vdldoc reference to the project wiki as part of the release build.

## v4.6.1

- Added debug bundle of the vdlx-datagrid library. This can be used in place of the standard library bundle to facilitate 
  better JavaScript debugging. Although the debug version concatenates the original source it does not minify it so it's easier
  to cross-reference with the original source.

## v4.6.0

Initial release of vdlx-datagrid.

- This version will only work with VDL 4.6 views.
