/**
 * Array of NuGet package assets to be included in the Unity package.
 * 
 * Each asset represents a NuGet package that will be downloaded and extracted
 * into the Unity package. The assets include essential .NET libraries that
 * provide functionality for async operations, JSON handling, memory management,
 * and other core features needed by the Unity SDK.
 * 
 * @example
 * ```typescript
 * // Example asset structure:
 * {
 *   name: 'Package.Name',
 *   origin: 'https://www.nuget.org/packages/Package.Name/1.0.0',
 *   packageUrl: 'https://www.nuget.org/api/v2/package/package.name/1.0.0',
 *   filename: 'package.name.1.0.0.nupkg',
 *   files: 'lib/netstandard2.0/*',
 *   license: "MIT"
 * }
 * ```
 */
export const assets = [
  {
    name: 'Microsoft.Bcl.AsyncInterfaces',
    origin: 'https://www.nuget.org/packages/Microsoft.Bcl.AsyncInterfaces/10.0.0-preview.6.25358.103',
    packageUrl: 'https://www.nuget.org/api/v2/package/microsoft.bcl.asyncinterfaces/10.0.0-preview.6.25358.103',
    filename: 'microsoft.bcl.asyncinterfaces.10.0.0-preview.6.25358.103.nupkg',
    files: 'lib/netstandard2.1/*',
    license: "MIT",
  },
  {
    name: 'OneOf',
    origin: 'https://www.nuget.org/packages/OneOf/3.0.271',
    packageUrl: 'https://www.nuget.org/api/v2/package/oneof/3.0.271',
    filename: 'oneof.3.0.271.nupkg',
    files: 'lib/netstandard2.0/*',
    license: "MIT",
  },
  {
    name: 'OneOf.Extended',
    origin: 'https://www.nuget.org/packages/OneOf.Extended/3.0.271',
    packageUrl: 'https://www.nuget.org/api/v2/package/oneof.extended/3.0.271',
    filename: 'oneof.extended.3.0.271.nupkg',
    files: 'lib/netstandard1.3/*',
    license: "MIT",
  },
  {
    name: 'System.Buffers',
    origin: 'https://www.nuget.org/packages/System.Buffers/4.6.1',
    packageUrl: 'https://www.nuget.org/api/v2/package/system.buffers/4.6.1',
    filename: 'system.buffers.4.6.1.nupkg',
    files: 'lib/netstandard2.0/*',
    license: "MIT",
  },
  {
    name: 'System.IO.Pipelines',
    origin: 'https://www.nuget.org/packages/System.IO.Pipelines/10.0.0-preview.6.25358.103',
    packageUrl: 'https://www.nuget.org/api/v2/package/system.io.pipelines/10.0.0-preview.6.25358.103',
    filename: 'system.io.pipelines.10.0.0-preview.6.25358.103.nupkg',
    files: 'lib/netstandard2.0/*',
    license: "MIT",
  },
  {
    name: 'System.Memory',
    origin: 'https://www.nuget.org/packages/System.Memory/4.6.3',
    packageUrl: 'https://www.nuget.org/api/v2/package/system.memory/4.6.3',
    filename: 'system.memory.4.6.3.nupkg',
    files: 'lib/netstandard2.0/*',
    license: "MIT",
  },
  {
    name: 'System.Runtime.CompilerServices.Unsafe',
    origin: 'https://www.nuget.org/packages/System.Runtime.CompilerServices.Unsafe/6.1.2',
    packageUrl: 'https://www.nuget.org/api/v2/package/system.runtime.compilerservices.unsafe/6.1.2',
    filename: 'system.runtime.compilerservices.unsafe.6.1.2.nupkg',
    files: 'lib/netstandard2.0/*',
    license: "MIT",
  },
  {
    name: 'System.Text.Encodings.Web',
    origin: 'https://www.nuget.org/packages/System.Text.Encodings.Web/10.0.0-preview.6.25358.103',
    packageUrl: 'https://www.nuget.org/api/v2/package/system.text.encodings.web/10.0.0-preview.6.25358.103',
    filename: 'system.text.encodings.web.10.0.0-preview.6.25358.103.nupkg',
    files: 'lib/netstandard2.0/*',
    license: "MIT",
  },
  {
    name: 'System.Text.Json',
    origin: 'https://www.nuget.org/packages/System.Text.Json/10.0.0-preview.6.25358.103',
    packageUrl: 'https://www.nuget.org/api/v2/package/system.text.json/10.0.0-preview.6.25358.103',
    filename: 'system.text.json.10.0.0-preview.6.25358.103.nupkg',
    files: 'lib/netstandard2.0/*',
    license: "MIT",
  },
  {
    name: 'System.Threading.Tasks.Extensions',
    origin: 'https://www.nuget.org/packages/System.Threading.Tasks.Extensions/4.6.3',
    packageUrl: 'https://www.nuget.org/api/v2/package/system.threading.tasks.extensions/4.6.3',
    filename: 'system.threading.tasks.extensions.4.6.3.nupkg',
    files: 'lib/netstandard2.0/*',
    license: "MIT",
  },
  {
    name: 'portable.system.datetimeonly',
    origin: 'https://www.nuget.org/packages/portable.system.datetimeonly/9.0.0',
    packageUrl: 'https://www.nuget.org/api/v2/package/portable.system.datetimeonly/9.0.0',
    filename: 'portable.system.datetimeonly.9.0.0.nupkg',
    files: 'lib/netstandard2.1/*',
    license: "MIT",
  }
];