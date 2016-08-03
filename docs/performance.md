# Performance

Load times are conservative 50 ms with ~0.5 ms impact to execution. Please keep in mind that Lambda functions can be loaded once and executed multiple times and thus low on impact and [billing](https://aws.amazon.com/lambda/pricing) is rounded to the nearest 100 ms.

A sample using the [vandium-node-test](https://github.com/vandium-io/vandium-node-test) project yielded the following output (128 MB configuration) in the first run (load cycle):

```
START RequestId: 9e3e89e1-0a62-11e6-872e-6b241dd8dd27 Version: $LATEST
END RequestId: 9e3e89e1-0a62-11e6-872e-6b241dd8dd27
REPORT RequestId: 9e3e89e1-0a62-11e6-872e-6b241dd8dd27	Duration: 29.19 ms	Billed Duration: 100 ms 	Memory Size: 128 MB	Max Memory Used: 31 MB		
```


With subsequent runs of:

```
START RequestId: a976646a-0a62-11e6-a3b7-efa984d3b3e4 Version: $LATEST
END RequestId: a976646a-0a62-11e6-a3b7-efa984d3b3e4
REPORT RequestId: a976646a-0a62-11e6-a3b7-efa984d3b3e4	Duration: 1.17 ms	Billed Duration: 100 ms 	Memory Size: 128 MB	Max Memory Used: 31 MB

START RequestId: b4281fd5-0a62-11e6-a234-f50509128ba5 Version: $LATEST
END RequestId: b4281fd5-0a62-11e6-a234-f50509128ba5
REPORT RequestId: b4281fd5-0a62-11e6-a234-f50509128ba5	Duration: 0.75 ms	Billed Duration: 100 ms 	Memory Size: 128 MB	Max Memory Used: 31 MB

START RequestId: babba075-0a62-11e6-b091-57dec612ee2b Version: $LATEST
END RequestId: babba075-0a62-11e6-b091-57dec612ee2b
REPORT RequestId: babba075-0a62-11e6-b091-57dec612ee2b	Duration: 1.24 ms	Billed Duration: 100 ms 	Memory Size: 128 MB	Max Memory Used: 31 MB

START RequestId: c7d3d4d1-0a62-11e6-9cab-19ffa2158aff Version: $LATEST
END RequestId: c7d3d4d1-0a62-11e6-9cab-19ffa2158aff
REPORT RequestId: c7d3d4d1-0a62-11e6-9cab-19ffa2158aff	Duration: 0.74 ms	Billed Duration: 100 ms 	Memory Size: 128 MB	Max Memory Used: 31 MB
```

We have also included a set of load benchmarks that can be found in the `benchmark` folder.
