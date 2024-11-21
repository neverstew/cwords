# cwords

Welcome to this absolute mess of a project, generating and solving cryptic crosswords.

## How it works

If you squint at the problem of setting a crossword grid, it looks like a whole
bunch of simultaneous equations that all relate to each other;
word one overlaps with word two, which overlaps with word 3 etc.

This is a great type of problem to throw at database engines, which are very
well set up to find a set of answers, given a whole host of constraints.

We create a database where the table has one column per space in the grid,
then we simply craft a host of queries that represent each word in that grid
and how they're constrained by each other.

Right now, it can produce a 5x5 grid only.

## Setup

We've already pulled some words from the internet and shoved them into the
`words.db` file. This is an SQLite database file.

To regenerate this, grab a list of words, edit and run 
```sh
bun run init $path_to_words_file
```

## Creating crossword grids

You need to generate a structure file (there's an example already at [structure.txt](./structure.txt)). This describes the shape of the grid that you want.

```
+ + + + +
. . + . .
. . + . .
. . + . .
+ + + + +
```

Each space in the grid should be filled with one of:

* `.` for no letter
* `+` for any letter
* `a` (or b etc.) for a specific letter

You can then generate a new crossword grid by running
```sh
bun run generate $path_to_structure_file
```

Given the above structure, you would see
```
a b o u t
. . f . .
. . f . .
. . e . .
a p r i l

a1: about [a, b, c, d, e] [0, 1, 2, 3, 4]
d2: offer [c, h, m, r, w] [2, 7, 12, 17, 22]
a3: april [u, v, w, x, y] [20, 21, 22, 23, 24]
```

### Getting another one
If you don't like the words output, you can look for the next matching result by specifying an offset to the script. This will give you the next result, sorted alphabetically. e.g.
```sh
bun run generate $path_to_structure_file 43
```

There are usually many, many combinations. Don't be afraid of big numbers!

## Other tools

### wurd generator
To split a clue up into all of the constituent chunks of words, run
```sh
bun run scripts/show-nwurds.ts Revolutionary device that reproduces itself when up-ended
```
```
# outputs
Revolutionary device that reproduces itself when up-ended
Revolutionary device that reproduces itself when
Revolutionary device that reproduces itself
Revolutionary device that reproduces
Revolutionary device that
Revolutionary device
Revolutionary
              device that reproduces itself when up-ended
              device that reproduces itself when
              device that reproduces itself
              device that reproduces
              device that
              device
                     that reproduces itself when up-ended
                     that reproduces itself when
                     that reproduces itself
                     that reproduces
                     that
                          reproduces itself when up-ended
                          reproduces itself when
                          reproduces itself
                          reproduces
                                     itself when up-ended
                                     itself when
                                     itself
                                            when up-ended
                                            when
                                                 up-ended
```