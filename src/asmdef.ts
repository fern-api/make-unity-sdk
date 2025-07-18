/**
 * Template for internal Unity assembly definition files.
 * 
 * Internal assemblies are not exposed to the public API and are used for
 * organizing internal code that should not be accessible to package consumers.
 * These assemblies are typically referenced by the main runtime assembly.
 * 
 * (currently not used - Unity will give a warning if you don't have any .cs files)
 */
export const internalAsmDefTemplate = {
  name: "",
  rootNamespace: "",
  references: [],
  includePlatforms: [],
  excludePlatforms: [],
  allowUnsafeCode: false,
  overrideReferences: true,
  precompiledReferences: [ // these assemblies are not exposed to the public API
  ],
  autoReferenced: false,
  defineConstraints: [],
  versionDefines: [],
  noEngineReferences: false
}

/**
 * Template for external Unity assembly definition files.
 * 
 * External assemblies are exposed to the public API and can be referenced
 * by Unity projects that use this package. These assemblies define the
 * public interface that package consumers will interact with.
 * 
 * (currently not used - Unity will give a warning if you don't have any .cs files)
 */
export const runtimeAsmDefTemplate = {
  name: "",
  rootNamespace: "",
  references: [
  ],
  includePlatforms: [],
  excludePlatforms: [],
  allowUnsafeCode: false,
  overrideReferences: true,
  precompiledReferences: [
  ],
  autoReferenced: true,
  defineConstraints: [],
  versionDefines: [],
  noEngineReferences: false
}