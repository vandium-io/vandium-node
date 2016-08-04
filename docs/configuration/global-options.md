# Global options

The global options exist at the top level of the configuration objects or the `vandium.json` file.


| option                | Description                                                                   | Type      | Default
|-----------------------|-------------------------------------------------------------------------------|-----------|----------
|`logUncaughtExceptions`| Determines if uncaught exceptions during handler execution should be logged.  | Boolean   | `true`
|`stripErrors`          | Strips all errors (exceptions) by removing call stack information.            | Boolean   | `true`
