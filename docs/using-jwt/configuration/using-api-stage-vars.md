# Using API Gateway Stage Variables

AWS API Gateway supports the use of stage variables to provide configuration information when the lambda function is invoked. Note that Vandium JWT configuration using stage variables only works when invoking your lambda function within API gateway.

### Configuration instructions:

**Step 1:** In the root directory of your project, create a file called `vandium.json` with the following contents:

```json
{
	"jwt": { }
}
```

<br>
**Step 2:** In API Gateway, create an API method with your Vandium-wrapped lambda function attached.

<br>
**Step 3:** Set up a mapping template to extract the information provided in the stage variables (setting up the stage variables will be explained in the next step). In your API Gateway method, go to the **integration request** page and select **Mapping Templates**. For content type, input **application/json**. After that, change the **Input passthrough** setting to **Mapping template**, then input a mapping template in one of the following forms:
<br>

* Using `HS256`, `HS384`, or `HS512` without a custom token name:

```json
{
    "jwt": "$input.params().header.get('Authorization')",
    "VANDIUM_JWT_ALGORITHM": "$stageVariables.VANDIUM_JWT_ALGORITHM",
    "VANDIUM_JWT_SECRET": "$stageVariables.VANDIUM_JWT_SECRET"
}
```
 >**Note:** In all of these example templates, "Authorization" is used as the HTTP header name that contains the JWT.  


* Using `HS256`, `HS384`, or `HS512` with a custom token name:

```json
{
    "myTokenName": "$input.params().header.get('Authorization')",
    "VANDIUM_JWT_ALGORITHM": "$stageVariables.VANDIUM_JWT_ALGORITHM",
    "VANDIUM_JWT_SECRET": "$stageVariables.VANDIUM_JWT_SECRET",
    "VANDIUM_JWT_TOKEN_NAME": "$stageVariables.VANDIUM_JWT_TOKEN_NAME"
}
```
>**Note:** In this example, the JWT token will appear in your lambda function as `event.myTokenName`. If a custom token name is not used, the JWT will appear as `event.jwt`.


* Using `RS256` without a custom token name:

```json
{
    "jwt": "$input.params().header.get('Authorization')",
    "VANDIUM_JWT_ALGORITHM": "$stageVariables.VANDIUM_JWT_ALGORITHM",
    "VANDIUM_JWT_SECRET": "$stageVariables.VANDIUM_JWT_SECRET",
    "VANDIUM_JWT_PUBKEY": "$stageVariables.VANDIUM_JWT_PUBKEY"
}
```

* Using `RS256` with a custom token name:

```json
{
    "myTokenName": "$input.params().header.get('Authorization')",
    "VANDIUM_JWT_ALGORITHM": "$stageVariables.VANDIUM_JWT_ALGORITHM",
    "VANDIUM_JWT_SECRET": "$stageVariables.VANDIUM_JWT_SECRET",
    "VANDIUM_JWT_PUBKEY": "$stageVariables.VANDIUM_JWT_PUBKEY",
    "VANDIUM_JWT_TOKEN_NAME": "$stageVariables.VANDIUM_JWT_TOKEN_NAME"
}
```

Here is how the mapping template setup should look like:

![Mapping Template Example](stage_vars_eg.png?raw=true "")

This example uses an `HS256`, `HS384`, or `HS512` JWT validation algorithm with the custom token name myTokenName.



For more information about AWS API Gateway mapping templates, see the official documation: [API Gateway Mapping Template Reference](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html)

<br>
**Step 4:** Setting up the stage variables. Deploy your API then go to the stage editor for the stage you just deployed. In the Stage Variables tab, set up the stage variables as specified in the following chart.


## Stage Variable Setup

The following stage variables can be used to provide the correct values to the JWT validation handler:

Name                      | Description                                      |  Required when using algorithms
--------------------------|--------------------------------------------------|----------------------------
`VANDIUM_JWT_ALGORITHM`   | Algorithm type                                   | `HS256`, `HS384`, `HS512`, or `RS256`
`VANDIUM_JWT_SECRET`      | Shared secret value                              | `HS256`, `HS384`, or `HS512`
`VANDIUM_JWT_PUBKEY`      | Public key                                       | `RS256`
`VANDIUM_JWT_TOKEN_NAME`  | Name of the token variable in the event. Default value is `jwt` | Optional


Here is an example stage variable setup on the AWS browser console using the `HS256` algorithm and a token with a custom name myTokenName:

![Stage Variables Example](stage_vars_template_eg.png?raw=true "")

If you're not using a custom token name, then you can omit the `VANDIUM_JWT_TOKEN_NAME` stage variable.

For more information on how API Gateway stage variables work, see the  documentation: [Deploy an API with Stage Variables in Amazon API Gateway](http://docs.aws.amazon.com/apigateway/latest/developerguide/stage-variables.html)


The object located inside S3 must be a valid JSON file that contains configuration parameters as described in this document (*see Figure A*).
