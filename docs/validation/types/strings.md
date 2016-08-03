# Strings

For a string that is between 1 and 250 characters long and required, the following would be used:

```js
{
    name: vandium.types.string().min( 1 ).max( 250 ).required()
}
```

Regex expressions can be used:

```js
{
    type: vandium.types.string().regex( /^[abcdef]+$/ )
}
```

Note: Strings are automatically trimmed. To disable this functionality, add an option when creating the type:

```js
{
    string_not_trimmed: vandium.types.string( { trim: false } )
}
```

For more information on how to configure strings, see the [joi string reference](https://github.com/hapijs/joi/tree/v8.0.5#string).
