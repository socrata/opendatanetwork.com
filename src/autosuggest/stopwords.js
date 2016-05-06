'use strict';

const _STOPWORDS = new Set([
    "and",
    "is",
    "or",
    "the",
    "in",
    "of",
    "that",
    "percent",
    "personal",
    "count",
    "rate",
    "mean",
    "median",
    "average",
    "with",
    "to",
    "over",
    "under",
    "higher",
    "lower",
    "per",
    "related",
    "total",
    "ratio",
    "capita",
    "annual",
    "overall",
    "other",
    "index"
]);

class Stopwords {
    /**
     * Extracts all important words from a string ignoring all stopwords.
     */
    static importantWords(string) {
        return string
            .replace(/[\.,]/g, '')
            .replace(/[\\\/]/g, ' ')
            .toLowerCase()
            .split(' ')
            .filter(word => !_STOPWORDS.has(word));
    }

    /**
     * Strips all stopwords from the string.
     */
    static strip(string) {
        return Stopwords.importantWords(string).join(' ');
    }
}

if (typeof module !== 'undefined') module.exports = Stopwords;

