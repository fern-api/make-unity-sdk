# Make a Unity package from a C# library

This is a quick-and-dirty tool to make a Unity package from a C# library.

## Building

```bash
npm install
npm run build
```

Usage: 

``` bash
npx @fern-api/make-unity-sdk --sln path/to/api-solution.sln

# optional arguments
--rebuild: Forcibly rebuild the solution before running
--clean: Clean the output directory before running
--reset: Reset the output completely and exit
--verbose: Show verbose output
--debug: Show debug output
--quiet: Show only errors

--name <name>                   # set the name of the package
--displayName <displayName>     # set the display name of the package
--version <version>             # set the version of the package
--description <description>     # set the description of the package
--author <author>               # set the author of the package
--license <license>             # set the license of the package
--changelog <changelog>         # set the changelog of the package
--documentation <documentation> # set the documentation of the package
```

At the moment:
  - it creates the package in the `./output` folder
  - it creates the package in the `./<name>-<version>.tgz` file

