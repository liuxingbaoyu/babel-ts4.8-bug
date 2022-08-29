Works fine in ts4.7, freezes infinitely in ts4.8 or ts nightly.
(in the real world it behaves as memory footprint goes from 1gb to 4gb, but after twice the time it is able to complete. I don't know why the reproduction becomes infinitely stuck, but it should be the same problem)

Update:
I updated the reproduction because the real problem was not reflected previously, the previous problem was fixed by https://github.com/microsoft/TypeScript/pull/50329.
Now reproducing the repository is consistent with the real world, i.e. the memory footprint is greatly increased.
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
