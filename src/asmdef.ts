// asmdef template for internal assemblies
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
// asmdef template for external assemblies
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