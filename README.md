# Azot Extension Example

This is an example of an extension for [Azot](https://github.com/azot-labs/azot).

This project uses TypeScript to provide type checking and documentation. The repo depends on the latest extension API in TypeScript Definition format, which contains TSDoc comments describing what it does.

This extension example demonstrates some of the basic functionality the extension API can do. [Bitmovin](https://bitmovin.com/demos/stream-test?format=dash) is used as an example of a service from which metadata is extracted for downloading.

- Detects whether the URL is supported by the extension.
- Parses download (manifest) links from a given URL.
