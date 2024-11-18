# cwords

Welcome to this absolute mess of a project, generating crosswords.

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

about
offer
april
```

### Getting another one
If you don't like the words output, you can look for the next matching result by specifying an offset to the script. This will give you the next result, sorted alphabetically. e.g.
```sh
bun run generate $path_to_structure_file 43
```

There are usually many, many combinations. Don't be afraid of big numbers!

### Generating JSON
To put the puzzle into the app, you can generate the JSON output of the words that the app expects.

```sh
bun run generate $path_to_structure_file $offset json
```

