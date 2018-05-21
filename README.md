# regexp-diagram

https://takayoshiotake.github.io/regexp-diagram/
draws regular expression patterns like railroad-diagram. Regular expression syntax follows the MDN Web docs.


## Examples

### number

RegExp:

```
-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?
```

Diagram:

![example1](https://raw.githubusercontent.com/takayoshiotake/regexp-diagram/master/README/example1.png "example1.png")


### non-greedy matching

RegExp:

```
(abc)+(xyz)+?
```

Diagram:

![example2](https://raw.githubusercontent.com/takayoshiotake/regexp-diagram/master/README/example2.png "example2.png")


## Special thanks

- https://github.com/javallone/regexper-static
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#Syntax (May 18, 2018)
