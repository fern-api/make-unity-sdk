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

--target <outputPath>           # The path to the output folder where the package contents will be laid out.
                                # default: ./output
--package <packagePath>         # The path to the folder where the .tgz package file will be placed.
                                # default: ./output
```

Example:
``` bash
npx fern-api/make-unity-sdk --sln C:/fern/petstore-csharp/fern/.preview/fern-csharp-sdk/src/FernDemoApi.sln --company petstore --version 1.0.0 
``` 

Should show something like:

``` bash
> Cleaning up folders
> Creating folder structure
> Building solution
> Copying build output to runtime folder
 ✓ Copied 'C:\fern\petstore-csharp\fern\.preview\fern-csharp-sdk\src\FernDemoApi\bin\release\netstandard2.0\FernDemoApi.deps.json' to 'C:\fern\api\output\Runtime\FernDemoApi.deps.json'
 ✓ Copied 'C:\fern\petstore-csharp\fern\.preview\fern-csharp-sdk\src\FernDemoApi\bin\release\netstandard2.0\FernDemoApi.dll' to 'C:\fern\api\output\Runtime\FernDemoApi.dll'
 ✓ Copied 'C:\fern\petstore-csharp\fern\.preview\fern-csharp-sdk\src\FernDemoApi\bin\release\netstandard2.0\FernDemoApi.pdb' to 'C:\fern\api\output\Runtime\FernDemoApi.pdb'
> Downloading NuGet packages
  ✓ Downloaded C:\fern\api\temp\nuget\system.threading.tasks.extensions.4.6.3.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\system.buffers.4.6.1.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\system.runtime.compilerservices.unsafe.6.1.2.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\microsoft.bcl.asyncinterfaces.10.0.0-preview.6.25358.103.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\portable.system.datetimeonly.9.0.0.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\system.memory.4.6.3.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\oneof.3.0.271.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\system.io.pipelines.10.0.0-preview.6.25358.103.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\system.text.encodings.web.10.0.0-preview.6.25358.103.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\oneof.extended.3.0.271.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\system.text.json.10.0.0-preview.6.25358.103.nupkg
> Extracting required files
  ✓ Extracted Microsoft.Bcl.AsyncInterfaces.dll
  ✓ Extracted Microsoft.Bcl.AsyncInterfaces.xml
  ✓ Extracted OneOf.dll
  ✓ Extracted OneOf.Extended.dll
  ✓ Extracted System.Buffers.dll
  ✓ Extracted System.Buffers.xml
  ✓ Extracted System.IO.Pipelines.dll
  ✓ Extracted System.IO.Pipelines.xml
  ✓ Extracted System.Memory.dll
  ✓ Extracted System.Memory.xml
  ✓ Extracted System.Runtime.CompilerServices.Unsafe.dll
  ✓ Extracted System.Runtime.CompilerServices.Unsafe.xml
  ✓ Extracted System.Text.Encodings.Web.dll
  ✓ Extracted System.Text.Encodings.Web.xml
  ✓ Extracted System.Text.Json.dll
  ✓ Extracted System.Text.Json.xml
  ✓ Extracted System.Threading.Tasks.Extensions.dll
  ✓ Extracted System.Threading.Tasks.Extensions.xml
  ✓ Extracted Portable.System.DateTimeOnly.dll
> Creating required package assets
  ✓ Created 'C:\fern\api\output\package.json'
  ✓ Created 'C:\fern\api\output\README.md'
  ✓ Created 'C:\fern\api\output\LICENSE'
  ✓ Created 'C:\fern\api\output\CHANGELOG.md'
  ✓ Created 'C:\fern\api\output\CHANGELOG.md.meta'
  ✓ Created 'C:\fern\api\output\LICENSE.meta'
  ✓ Created 'C:\fern\api\output\package.json.meta'
  ✓ Created 'C:\fern\api\output\README.md.meta'
  ✓ Created 'C:\fern\api\output\Runtime\FernDemoApi.deps.json.meta'
  ✓ Created 'C:\fern\api\output\Runtime\FernDemoApi.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\FernDemoApi.pdb.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\Microsoft.Bcl.AsyncInterfaces.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\Microsoft.Bcl.AsyncInterfaces.xml.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\OneOf.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\OneOf.Extended.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\Portable.System.DateTimeOnly.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Buffers.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Buffers.xml.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.IO.Pipelines.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.IO.Pipelines.xml.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Memory.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Memory.xml.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Runtime.CompilerServices.Unsafe.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Runtime.CompilerServices.Unsafe.xml.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Text.Encodings.Web.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Text.Encodings.Web.xml.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Text.Json.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Text.Json.xml.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Threading.Tasks.Extensions.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Threading.Tasks.Extensions.xml.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal.meta'
  ✓ Created 'C:\fern\api\output\Runtime.meta'
> creating .tgz package
  ✓ Created 'com.petstore.ferndemoapi-1.0.0.tgz'
> done.
PS C:\fern\api> npx fern-api/make-unity-sdk --sln C:/fern/petstore-csharp/fern/.preview/fern-csharp-sdk/src/FernDemoApi.sln --company petstore  --clean --version 1.0.0
> Cleaning up folders
> Creating folder structure
> Building solution
> Copying build output to runtime folder
 ✓ Copied 'C:\fern\petstore-csharp\fern\.preview\fern-csharp-sdk\src\FernDemoApi\bin\release\netstandard2.0\FernDemoApi.deps.json' to 'C:\fern\api\output\Runtime\FernDemoApi.deps.json'
 ✓ Copied 'C:\fern\petstore-csharp\fern\.preview\fern-csharp-sdk\src\FernDemoApi\bin\release\netstandard2.0\FernDemoApi.dll' to 'C:\fern\api\output\Runtime\FernDemoApi.dll'
 ✓ Copied 'C:\fern\petstore-csharp\fern\.preview\fern-csharp-sdk\src\FernDemoApi\bin\release\netstandard2.0\FernDemoApi.pdb' to 'C:\fern\api\output\Runtime\FernDemoApi.pdb'
> Downloading NuGet packages
  ✓ Downloaded C:\fern\api\temp\nuget\system.buffers.4.6.1.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\system.memory.4.6.3.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\portable.system.datetimeonly.9.0.0.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\system.threading.tasks.extensions.4.6.3.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\system.io.pipelines.10.0.0-preview.6.25358.103.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\oneof.3.0.271.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\system.runtime.compilerservices.unsafe.6.1.2.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\microsoft.bcl.asyncinterfaces.10.0.0-preview.6.25358.103.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\oneof.extended.3.0.271.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\system.text.encodings.web.10.0.0-preview.6.25358.103.nupkg
  ✓ Downloaded C:\fern\api\temp\nuget\system.text.json.10.0.0-preview.6.25358.103.nupkg
> Extracting required files
  ✓ Extracted Microsoft.Bcl.AsyncInterfaces.dll
  ✓ Extracted Microsoft.Bcl.AsyncInterfaces.xml
  ✓ Extracted OneOf.dll
  ✓ Extracted OneOf.Extended.dll
  ✓ Extracted System.Buffers.dll
  ✓ Extracted System.Buffers.xml
  ✓ Extracted System.IO.Pipelines.dll
  ✓ Extracted System.IO.Pipelines.xml
  ✓ Extracted System.Memory.dll
  ✓ Extracted System.Memory.xml
  ✓ Extracted System.Runtime.CompilerServices.Unsafe.dll
  ✓ Extracted System.Runtime.CompilerServices.Unsafe.xml
  ✓ Extracted System.Text.Encodings.Web.dll
  ✓ Extracted System.Text.Encodings.Web.xml
  ✓ Extracted System.Text.Json.dll
  ✓ Extracted System.Text.Json.xml
  ✓ Extracted System.Threading.Tasks.Extensions.dll
  ✓ Extracted System.Threading.Tasks.Extensions.xml
  ✓ Extracted Portable.System.DateTimeOnly.dll
> Creating required package assets
  ✓ Created 'C:\fern\api\output\package.json'
  ✓ Created 'C:\fern\api\output\README.md'
  ✓ Created 'C:\fern\api\output\LICENSE'
  ✓ Created 'C:\fern\api\output\CHANGELOG.md'
  ✓ Created 'C:\fern\api\output\CHANGELOG.md.meta'
  ✓ Created 'C:\fern\api\output\LICENSE.meta'
  ✓ Created 'C:\fern\api\output\package.json.meta'
  ✓ Created 'C:\fern\api\output\README.md.meta'
  ✓ Created 'C:\fern\api\output\Runtime\FernDemoApi.deps.json.meta'
  ✓ Created 'C:\fern\api\output\Runtime\FernDemoApi.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\FernDemoApi.pdb.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\Microsoft.Bcl.AsyncInterfaces.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\Microsoft.Bcl.AsyncInterfaces.xml.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\OneOf.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\OneOf.Extended.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\Portable.System.DateTimeOnly.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Buffers.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Buffers.xml.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.IO.Pipelines.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.IO.Pipelines.xml.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Memory.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Memory.xml.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Runtime.CompilerServices.Unsafe.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Runtime.CompilerServices.Unsafe.xml.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Text.Encodings.Web.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Text.Encodings.Web.xml.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Text.Json.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Text.Json.xml.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Threading.Tasks.Extensions.dll.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal\System.Threading.Tasks.Extensions.xml.meta'
  ✓ Created 'C:\fern\api\output\Runtime\Internal.meta'
  ✓ Created 'C:\fern\api\output\Runtime.meta'
> creating .tgz package
  ✓ Created 'com.petstore.ferndemoapi-1.0.0.tgz'
> done.

```
