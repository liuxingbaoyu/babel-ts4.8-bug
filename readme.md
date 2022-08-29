Works fine in ts4.7, freezes infinitely in ts4.8 or ts nightly.
(in the real world it behaves as memory footprint goes from 1gb to 4gb, but after twice the time it is able to complete. I don't know why the reproduction becomes infinitely stuck, but it should be the same problem)
```shell
yarn
yarn add typescript@4.7
yarn tsc --extendedDiagnostics
```
```shell
yarn
yarn add typescript@next # or typescript@4.8
yarn tsc --extendedDiagnostics
```
