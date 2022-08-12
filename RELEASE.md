# VDLX-DATAGRID release process

The version numbering for vdlx-datagrid is `major.minor.patch`. Where `major.minor` match the version of VDL that the release
is compatible with, see [vdlx-datagrid.vdl](dist/insight/client_resources/vdlx-datagrid/vdlx-datagrid.vdl) and the corresponding 
[vdlx-datagrid-debug.vdl](dist/insight/client_resources/vdlx-datagrid-debug/vdlx-datagrid-debug.vdl)

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

After release, tick up the version number in [package.json](package.json) and add a new version section to [CHANGELOG.md](CHANGELOG.md).

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

## VDLDoc reference publishing

The VDLDoc for a release should be generated as follows:

1. From your local machine, checkout master and pull changes from origin
1. Run: `npm run vdldoc`
1. Check the generated file `docs/vdlx-datagrid-reference.html` and commit if it all looks good
1. Push the change to origin
1. Check on the GitHub site that it has deployed the change: https://github.com/fico-xpress/vdlx-datagrid/deployments
1. Check the published page: https://fico-xpress.github.io/vdlx-datagrid/vdlx-datagrid-reference

### How to update the wiki publishing user (No longer needed as the wiki is disabled)

As the user who the wiki page will be published as...

1. Go to your user Settings, Personal access tokens in GitHub - https://github.com/settings/tokens
1. Generate new token, give it a useful name such as "wiki page creator token"
1. Give the token all "repo" permissions
1. Take a temporary (secure) record of the token as you can't see it at a later date
1. Go to the project Settings page, Secrets section
1. Add a new secret
1. Name it: GITHUB_PERSONAL_ACCESS_TOKEN
1. Paste in the token you generated in your user Settings
1. Update `ACTION_MAIL` and `ACTION_NAME` in the step "Update VDLDoc reference" in [release.yml](.github/workflows/release.yml)
