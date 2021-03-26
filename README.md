# Fuzziac

A utility for on-line approximate string matching

<!-- [START badges] -->
[![NPM Version](https://img.shields.io/npm/v/fuzziac.svg)](https://www.npmjs.com/package/fuzziac)
[![Node Requirement](https://img.shields.io/node/v/fuzziac.svg)](https://www.npmjs.com/package/fuzziac)
[![License](https://img.shields.io/npm/l/fuzziac.svg)](https://github.com/skiplist-eng/fuzziac/blob/master/LICENSE)
[![Number of Downloads](https://img.shields.io/npm/dm/fuzziac.svg)](https://www.npmjs.com/package/fuzziac) 
<!-- [END badges] -->

Fuzziac.js is Javascript class for on-line approximate string matching. It was originally intended for use with auto-complete, but it's really just a plain Javascript class, so use it as you see fit.

This is started as a research project for an undergraduate algorithms class which I took way back in 2011. We had to complete a term project on an algorithm, and Dr. Duan made dynamic programming look cool, so I though I would look for an application of dynamic programming outside the realm of DNA sequencing.

If you would like to know the full story on how I came to develop this solution you can read the post I wrote about the [history of fuzziac.js][fuzziacpost], or you can read my [original research paper][fuzziacresearch].

## Installation  

To use fuzziac in your Node app:  

### npm

```bash
npm install --save fuzziac
```

### yarn

```bash
yarn add fuzziac
```

## Usage

### Calculate the Match Score of Two Strings

```javascript
const fuzziac = new Fuzziac()
fuzziac.scoreSingle("Joe", "Moe")
```

### Find the Best Matches from an Array

```javascript
const fuzziac = new Fuzziac([
    "Larry",
    "Curly",
    "Moe"
])
const scoreResults = fuzziac.score("Joe");
```

[fuzziacpost]: http://christopherstoll.org/2014/01/24/fuzziac-javascript-string-matching.html
[fuzziacresearch]: analysis/2011-11_FinalProjectReport.pdf
