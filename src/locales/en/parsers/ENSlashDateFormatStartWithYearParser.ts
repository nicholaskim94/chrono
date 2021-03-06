import {Parser, ParsingContext} from "../../../chrono";
import {MONTH_DICTIONARY} from "../constants";
import {matchAnyPattern} from "../../../utils/pattern";

/*
    Date format with slash "/" between numbers like ENSlashDateFormatParser,
    but this parser expect year before month and date.
    - YYYY/MM/DD
    - YYYY-MM-DD
    - YYYY.MM.DD
*/
const PATTERN = new RegExp('([0-9]{4})[\\.\\/]'
    + '(?:(' + matchAnyPattern(MONTH_DICTIONARY) + ')|([0-9]{1,2}))[\\.\\/]'
    + '([0-9]{1,2})'
    + '(?=\\W|$)', 'i');

const YEAR_NUMBER_GROUP = 1;
const MONTH_NAME_GROUP = 2;
const MONTH_NUMBER_GROUP = 3;
const DATE_NUMBER_GROUP  = 4;

export default class ENSlashDateFormatStartWithYearParser implements Parser {

    pattern(): RegExp { return PATTERN; }

    extract(context: ParsingContext, match: RegExpMatchArray) {

        const month = match[MONTH_NUMBER_GROUP] ? parseInt(match[MONTH_NUMBER_GROUP]) :
            MONTH_DICTIONARY[match[MONTH_NAME_GROUP].toLowerCase()];

        const year = parseInt(match[YEAR_NUMBER_GROUP]);
        const day = parseInt(match[DATE_NUMBER_GROUP]);

        return {
            'day': day,
            'month': month,
            'year': year
        }
    }
}
