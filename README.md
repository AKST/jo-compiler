**YO I'm not maintaining this, & there are tons of security alerts mostly keeping this here for archiving sake**.

# Proto Jo

## About

I plan on writting is a language called Jo, I'm writting it in Javascript
just to get an MVP off the ground. I'll likely rewrite it once I finish the
design.

### History

Originally I was writing a compiler using OCaml, then I got sick of not
having type classes, so then i moved it to Haskell but then I remembered
how much strings piss me off in Haskell. So then moved this to Javascript
because I know I get this finished alot faster in Javascript.

### Super Vague Road map

1. Make the MVP, a lisp that defines the semantics of the language,
   that generates executable compiler output, as well as a repl,
   all in a lisp like syntax.
2. Move to less lisp like syntax that easier on the eyes
3. Make the language self hosted?
4. Make compiler times faster?

### Idealistic Syntax

I'm honestly suprised by the number of libraries or languages that don't show
you examples of syntax in the read me, so here is some syntax. Also since
this language is currently in development this example maybe out of date but I
try to keep this up to date (A commented version is in the `examples` folder).

```jojo
.define 'akst.simple where: |out-factory|
  .import 'jo.lang
    with: '[match type lazy math eq ->]
		as: 'std

  type.assert out-factory
    implements: std.writer-factory

  Result := type.define-enum as: |self a|
    .case 'None     type: a -> [self a]
    .case 'Fizz     type: [self a]
    .case 'Buzz     type: [self a]
    .case 'FizzBuzz type: [self a]

  result-to-str := type.define-impl
    with: [[ a | Result [.that a implements: std.to-str] ]]
    assoc: std.to-str
    where: |result|
      .return
        match result of: |
          .case Result.FizzBuzz | "fizzbuzz"
          .case Result.Fizz | "fizz"
          .case Result.Buzz | "buzz"
          .case Result.None |n|
            type.assert n implements: std.to-str
            .return std.to-str n

  int-to-result := |number|
    type.assert-impl math eq in: number
    div-3 := | eq 0 [math.mod number 3]
    div-5 := | eq 0 [math.mod number 5]
    both  := | std.and [div-3] [div-5]
    .return
      std.guard |
        .case both | Result.FizzBuzz
        .case div-3 | Result.Fizz
        .case div-5 | Result.Buzz
        .case 'else | Result.None number

  main := |
    out := [out-factory.get-instance]
    writeln := |value|
      message := std.to-str value
      std.write out message
    std.for [std.range 1 100] |num|
      writeln [int-to-result num]


  .export main          behave-as: '[script main default]
```

## Development Notes

### Testings

This will run before each commit anyways, but it'll run
linting as well as type checking on the source code, rebuild
the source then run the tests.

```
make ci
```

### Local Setup

This will install all the global dependencies required to work on this
project. If you're not intested in that I'd recommend you give the docker
setup a spin. But to work on this project a specfic version of LLVM is
required.

```
./scripts/install-shared-libraries.bash
make init
```

### Setup Docker image

Will setup a container of the developer environment to work on this project
without polluting your local machine with global dependencies, like LLVM.

```
./scripts/build-image.bash
docker run -it --rm jo
```

### Dependencies

- [Docker](https://www.docker.com)
  - Mostly used to produce the developement & test environment, if you
    get this working you don't really have to worry about much else listed here.
- [LLVM](https://nodejs.org)
  - Instead of setting this up locally I'd recommend using the docker container,
    but you can follow the steps shown above to get llvm working on your machine.
- [Node](https://nodejs.org)
  - I'm using 6.11.2 for development.
- [Yarn](https://yarnpkg.com/lang/en/docs/install/)
  - Techinically you can use npm, but the build system is just configured
    to use yarn, it'll make your life easier if you set it up. It's also
    messy to manage a built that falls back to vanilla npm.
- [Watch man](https://facebook.github.io/watchman/docs/install.html)
  - This is more a convience that is completely optional, but

