# Attack Protection

Vandium by default will analyze the `event` object from lambda and determine if attacks are present. If attacks are detected, Vandium will
log the attack. Protection can be configured to report and prevent further execution if an attack is detected. Currently only
SQL Injection (SQLi) attacks are detected but future versions will detect other types.

Table of Contents

- [SQL injection protection](sql-injection-protection)
- [Configuration](configuration.md)
- [Disabling attack protection](disable-attack-protection)
- [Preventing calls to `eval()`](eval-prevention.md)
