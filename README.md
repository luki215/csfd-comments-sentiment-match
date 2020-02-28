# CSFD comments sentiment match
Semestral project for data mining from web.

[CSFD](https://www.csfd.cz/) is Czech imdb-like movie database. 

Goal of this project is to **compare how the comment sentiment matches the stars rating**.

## Method used
1. Crawler gets comments from the first 300 most incostintent-rated movies (to have all types of ratins) 
2. We run affin sentiment analysis on the comment text, normalize it to have a value from `0` to `5` and compare it with the number of stars assigned to comment.
3. For sentiment analysis I'm using https://github.com/VilemR/affin.cz affin dictionary.

## Results
```
Match in 1688 cases, star rating matched with sentiment in 14.8788012340238% of comments
Rating difference average: 1.6520052886734244
```
Interesting results - the comments with maximal difference between thee stars rating and sentiment were homonyms, irony or user errors - for example:
```
Slušnej nářez.
```
has maximal sentiment value, but the user rated it as total trash.

## How to run
0. Install dependencies
```
yarn
```

1. crawl comments data
```
yarn start:crawl
```
2. run sentimental analysis on data
```
yarn start:sentiment
```
