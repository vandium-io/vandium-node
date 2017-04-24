# AWS Lambda Compatibility

Vandium 4 is compatible with AWS Lambda environments that support Node.js 6.10.x or higher.

## Compatibility with previous versions of Vandium

Vandium 4's event handler mechanism allows focused handling of event specific scenarios and thus code written using Vandium 3.x will **not** be compatible with this version. To migrate your Vandium 3 code, use a targeted event handler or the `generic` event.

## Node 4.3.2
If you require support for the previous version of Node.js (4.x) then use Vandium 3.x
