# Using the Make Unity SDK Tool

The Make Unity SDK tool is a powerful utility that converts .NET solutions into Unity-compatible packages. It automates the process of building C# libraries, downloading NuGet dependencies, and packaging everything into a Unity package format that can be easily distributed and installed.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Command Line Options](#command-line-options)
- [Package Structure](#package-structure)
- [Examples](#examples)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

The Make Unity SDK tool performs the following operations:

1. **Builds .NET Solutions**: Compiles your C# solution using `dotnet build -c release`
2. **Downloads NuGet Dependencies**: Automatically fetches required NuGet packages
3. **Extracts Dependencies**: Extracts specific files from NuGet packages to the Internal/ folder
4. **Creates Unity Structure**: Organizes files into Unity's expected package structure
5. **Generates Metadata**: Creates Unity package.json, README, LICENSE, and other required files
6. **Packages Output**: Creates a .tgz file ready for distribution

## Installation

### Prerequisites

- Node.js (version 16 or higher)
- .NET SDK (for building solutions)
- Unity 2021.3 LTS or higher (for using the generated packages)

### Install the Tool

```bash
# Install globally
# NOTE: NOT YET PUBLISHED TO NPM
npm install -g @fern-api/make-unity-sdk

# Or use npx (recommended)
npx @fern-api/make-unity-sdk --sln path/to/your/solution.sln
```

### Build from Source

```bash
# Clone the repository
git clone <repository-url>
cd make-unity-sdk

# Install dependencies
npm install

# Build the tool
npm run build

# Run the tool
npm start -- --sln path/to/your/solution.sln
```

## Basic Usage

### Simple Example

```bash
npx @fern-api/make-unity-sdk --sln ./MyApi.sln
```

This will:
- Build your solution
- Download required NuGet packages
- Create a Unity package in the `./output` directory
- Generate a `.tgz` file for distribution

### With Custom Metadata

```bash
npx @fern-api/make-unity-sdk \
  --sln ./MyApi.sln \
  --name com.mycompany.myapi \
  --version 1.0.0 \
  --company "My Company" \
  --displayName "My API Package" \
  --description "A powerful API client for Unity"
```

## Command Line Options

### Required Arguments

| Option | Description | Example |
|--------|-------------|---------|
| `--sln <path>` | Path to the .NET solution file (.sln) | `--sln ./MyProject.sln` |

### Optional Arguments

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `--target <path>` | Output directory for Unity package | `./output` | `--target ./my-package` |
| `--package <path>` | Directory for final .tgz package | `<target>/..` | `--package ./packages` |
| `--rebuild` | Force rebuild solution | `false` | `--rebuild` |
| `--clean` | Clean output and temp folders | `false` | `--clean` |
| `--reset` | Clean folders and exit | `false` | `--reset` |
| `--verbose` | Enable verbose output | `false` | `--verbose` |
| `--debug` | Enable debug output | `false` | `--debug` |
| `--quiet` | Suppress normal output | `false` | `--quiet` |

### Package Metadata Arguments

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `--name <name>` | Package name | Derived from solution | `--name com.mycompany.api` |
| `--version <version>` | Package version | `0.0.1` | `--version 1.2.3` |
| `--company <company>` | Company name | `Unknown` | `--company "My Company"` |
| `--displayName <name>` | Display name in Unity | Derived from name | `--displayName "My API"` |
| `--description <text>` | Package description | `Generated Unity package` | `--description "API client"` |
| `--author <author>` | Package author | `Unknown` | `--author "John Doe"` |
| `--license <license>` | License type | `MIT` | `--license "Apache-2.0"` |
| `--changelogUrl <url>` | Changelog URL | `null` | `--changelogUrl "https://..."` |
| `--documentationUrl <url>` | Documentation URL | `null` | `--documentationUrl "https://..."` |

## Package Structure

The tool creates a Unity package with the following structure:

```
output/
├── Runtime/                    # Main runtime assemblies
│   ├── MyApi.dll              # Your compiled library
│   ├── MyApi.pdb              # Debug symbols
│   └── MyApi.deps.json        # Dependency information
├── Runtime/Internal/          # Internal assemblies (not exposed)
│   ├── System.Text.Json.dll   # NuGet dependencies
│   ├── System.Memory.dll
│   └── ...
├── Editor/                    # Unity Editor scripts (if any)
├── Tests/                     # Unit tests (if any)
├── Samples~/                  # Example projects (not included in package)
├── Documentation~/            # Documentation (not included in package)
├── package.json              # Unity package metadata
├── README.md                 # Package documentation
├── LICENSE                   # License file
├── CHANGELOG.md              # Version history
└── Third Party Notices.md    # Third-party acknowledgments
```

## Examples

### Basic API Package

```bash
npx @fern-api/make-unity-sdk \
  --sln ./PetStoreApi.sln \
  --name com.petstore.api \
  --version 1.0.0 \
  --company "PetStore Inc." \
  --displayName "PetStore API Client" \
  --description "Official Unity client for the PetStore API"
```

### Clean Build with Verbose Output

```bash
npx @fern-api/make-unity-sdk \
  --sln ./MyApi.sln \
  --clean \
  --rebuild \
  --verbose \
  --name com.mycompany.api \
  --version 2.1.0
```

### Custom Output Location

```bash
npx @fern-api/make-unity-sdk \
  --sln ./MyApi.sln \
  --target ./unity-packages/my-api \
  --package ./dist \
  --name com.mycompany.api \
  --version 1.0.0
```

### Just Clean Up

```bash
npx @fern-api/make-unity-sdk --reset
```

## Advanced Usage

### Using Placeholders in Resource Files

The tool supports placeholders in resource files that get replaced during package creation:

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `${name}` | Package name | `com.mycompany.api` |
| `${displayName}` | Display name | `My API Package` |
| `${version}` | Package version | `1.0.0` |
| `${company}` | Company name | `My Company` |
| `${description}` | Package description | `A powerful API client` |
| `${author}` | Package author | `John Doe` |
| `${license}` | License information | `MIT` |
| `${changelogUrl}` | Changelog URL | `https://github.com/...` |
| `${documentationUrl}` | Documentation URL | `https://docs.example.com` |
| `${packageName}` | OpenUPM package name | `com-mycompany-api` |
| `${packageScope}` | OpenUPM package scope | `com.mycompany` |

### Custom Resource Files

You can customize the generated files by placing templates in the `resources/` directory:

```
resources/
├── readme.md              # README template
├── changelog.md           # Changelog template
├── LICENSE               # License template
└── Documentation~/       # Documentation files
```

## Troubleshooting

### Common Issues

#### Build Failures

**Problem**: Solution fails to build
```
✗ Failed to build solution: 
error CS1002: ; expected
```

**Solution**: 
- Check that your solution builds locally with `dotnet build -c release`
- Ensure all dependencies are properly referenced
- Use `--verbose` for more detailed build output

#### Missing NuGet Packages

**Problem**: Required NuGet packages not found
```
✗ Failed to download package: https://api.nuget.org/v3-flatcontainer/...
```

**Solution**:
- Check your internet connection
- Verify the package name and version in your project file
- Use `--debug` to see detailed download information

#### Permission Errors

**Problem**: Cannot write to output directory
```
✗ EACCES: permission denied, mkdir './output'
```

**Solution**:
- Ensure you have write permissions to the target directory
- Try running with elevated permissions if necessary
- Use `--target` to specify a different output location

#### Unity Package Import Issues

**Problem**: Package doesn't import correctly in Unity
```
✗ Package validation failed
```

**Solution**:
- Check that the package structure follows Unity conventions
- Verify all required metadata is provided
- Ensure .meta files are generated correctly

### Debug Mode

Use `--debug` for maximum verbosity:

```bash
npx @fern-api/make-unity-sdk --sln ./MyApi.sln --debug
```

This will show:
- All file operations
- Detailed build output
- NuGet download progress
- Package creation steps

### Clean Build

If you encounter issues, try a clean build:

```bash
npx @fern-api/make-unity-sdk --sln ./MyApi.sln --clean --rebuild
```

## Best Practices

### Package Naming

- Use reverse domain notation: `com.company.package`
- Keep names lowercase with dots as separators
- Avoid special characters except dots and hyphens

### Version Management

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Increment version numbers appropriately
- Document breaking changes in changelog

### Documentation

- Provide clear installation instructions
- Include usage examples
- Document API changes between versions
- Add troubleshooting sections

### Testing

- Test the generated package in Unity
- Verify all dependencies are included
- Check that the package imports without errors
- Test on different Unity versions if needed

### Distribution

- Use OpenUPM for public packages
- Provide clear installation instructions
- Include proper licensing information
- Maintain a changelog

## Getting Help

- Use `--help` for basic usage information
- Use `--help --detailed` for comprehensive help with examples
- Check the tool's source code for advanced customization
- Report issues on the project's GitHub repository

## Version History

- **v1.0.0**: Initial release with basic Unity package creation
- Support for .NET solutions and NuGet dependencies
- Automatic metadata generation
- Unity package structure creation
