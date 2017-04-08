# Proto Jo

Originally I was writing a compiler using Haskell to make a
language called Jo, but I found writing it in Haskell had a
bit of overhead so I've sided to write it in Javascript.

## Dev Setup

```
make init
```

## Testings

This will run before each commit anyways, but it'll run
linting as well as type checking on the source code, rebuild
the source then run the tests.

```
make ci
```
