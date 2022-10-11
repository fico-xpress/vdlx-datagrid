# vdlx-datagrid changelog

## v4.8.5

- Fixed add row when `addrow-autoinc` enabled and index set is empty 

## v4.8.4

- New `column-definition` attribute, columns can be defined automatically from the data, from the label property on the data, or by a column definition object.
- `column-modifier` attribute removed.
- New examples added.

## v4.8.3

- Removed unused attribute: `data-grid`
- New `data` attribute added. Custom data can be passed directly to `vdlx-datagrid` via the `data` attribute.
- new `column-modifier` attribute added. Column definitions can now be edited.
  
## v4.8.2

## v4.8.1

- Columns automatically switch to read-only when the bound scenario is reserved for execution.
- Add/Remove row buttons are disabled rather than hidden when an editable vdlx-datagrid goes read-only.
- Upgraded to Tabulator 4.9.3.

## v4.8.0

- Updated to VDL 4.8 compatibility.
- Microsoft Edge is now supported. Internet Explorer 11 is no longer supported.

## v4.7.2

- Fixed pre-filtering when filtering a set with label arrays.

## v4.7.1

- Custom CSS classes can be added per column using the `class` attribute, a space-separated list of class names that
  can be a static string or an expression. This fixes an issue where the `class` attribute was not applying the specified 
  class names to a column.
- Fixed column filtering on calculated columns.
- Fix for cell validation after validation expression change.
- Calculated columns are updated after rowData changes.

## v4.7.0

- Updated to VDL 4.7 compatibility.
- The `vdlx-datagrid-index-filter` component can be used at the `vdlx-datagrid` level to provide pre-filtering of index sets
  for the entire table. When using index filters at the table level, all arrays in the table that are indexed by these sets
  will be filtered on the server-side, reducing the data transferred from the server and processed by datagrid.
- Index columns are automatically sorted using corresponding `vdl-set-sorter` or the default set sorter for the index column data type.
- Default sorting with set sorters can be disabled per index column using the new `vdlx-datagrid-column` attribute `disable-set-sorting`.

## v4.6.3

- Fix an issue where table with large number of indices was locking up the view.

## v4.6.2

- Export data as CSV: New vdlx-datagrid attributes `show-export` and `export-filename` that display a datagrid header 
  button to allow the user to download the current table contents to a CSV file.
- Save any pending cell edits when the view is unloaded. 
- Index columns can be positioned anywhere in the datagrid. When index column is defined in VDL, its' position in VDL defines its'
  position in datagrid.
- Default column sort order can be set with new `vdlx-datagrid-column` attributes `sort-order` and `sort-direction`.
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
