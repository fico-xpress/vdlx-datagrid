# VDLX-DATAGRID release process

The version numbering for vdlx-datagrid is `major.minor.patch`. Where `major.minor` match the version of VDL that the release
is compatible with, see [vdlx-datagrid.vdl](dist/insight/client_resources/vdlx-datagrid/vdlx-datagrid.vdl).

## Creating a release off master

Instructions to create a release (where version number is `A.B.C`):

1. Make sure `master` is ready to go for release
1. Make sure the `version` property in `package.json` is set to `A.B.C`
1. Create the tag and push:

```bash
git checkout master
git pull
git tag vA.B.C
git push origin vA.B.C
```

This will create a draft release on GitHub. Go to [releases](https://github.com/fico-xpress/vdlx-datagrid/releases) and 
open the new draft release. Add release notes to the description.

Once you are happy with the release draft you can **publish** to make it available publicly.

## Creating a patch release of an older version

This is generally done if some fix or feature needs to go into a previous release that is compatible with an older version of VDL.

Where `A.B.C` is the patch release version number:

1. Create a patch branch from the release tag you want to patch
1. Push or cherry-pick any changes required for the patch
1. Make sure the `version` property in `package.json` is set to `A.B.C`
1. Create the tag and push:

```bash
git tag vA.B.C
git push origin vA.B.C
```

This will create a draft release on GitHub. Go to [releases](https://github.com/fico-xpress/vdlx-datagrid/releases) and 
open the new draft release. Add release notes to the description.

Once you are happy with the release draft you can **publish** to make it available publicly.
