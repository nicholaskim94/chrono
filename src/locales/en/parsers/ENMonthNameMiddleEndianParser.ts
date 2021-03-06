import {Parser, ParsingContext} from "../../../chrono";
import {findYearClosestToRef} from "../../../calculation/yearCalculation";
import {MONTH_DICTIONARY, WEEKDAY_DICTIONARY} from "../constants";
import {ORDINAL_NUMBER_PATTERN, parseOrdinalNumberPattern} from "../constants";
import {YEAR_PATTERN, parseYear} from "../constants";
import {matchAnyPattern} from "../../../utils/pattern";

const PATTERN = new RegExp(
    '(?:' +
        '(?:on\\s*?)?' +
        `(${matchAnyPattern(WEEKDAY_DICTIONARY)})` +
    '\\s*,?\\s*)?' +
    `(${matchAnyPattern(MONTH_DICTIONARY)})` +
    '(?:-|/|\\s*,?\\s*)' +
    `(${ORDINAL_NUMBER_PATTERN})(?!\\s*(?:am|pm))\\s*`+
    '(?:' +
        '(?:to|\\-)\\s*' +
        `(${ORDINAL_NUMBER_PATTERN})\\s*` +
    ')?' +
    '(?:' +
        '(?:-|/|\\s*,?\\s*)' +
        `(${YEAR_PATTERN})` +
    ')?' +
    '(?=\\W|$)(?!\\:\\d)', 'i');

const WEEKDAY_GROUP = 1;
const MONTH_NAME_GROUP = 2;
const DATE_GROUP = 3;
const DATE_TO_GROUP = 4;
const YEAR_GROUP = 5;

/**
 * The parser for parsing US's date format that begin with month's name.
 *  - January 13
 *  - January 13, 2012
 *  - January 13 - 15, 2012
 *  - Tuesday, January 13, 2012
 * Note: Watch out for:
 *  - January 12:00
 *  - January 12.44
 *  - January 1222344
 */
export default class ENMonthNameMiddleEndianParser implements Parser {

    pattern(): RegExp {
        return PATTERN;
    }

    extract(context: ParsingContext, match: RegExpMatchArray) {

        const month = MONTH_DICTIONARY[match[MONTH_NAME_GROUP].toLowerCase()];
        const day = parseOrdinalNumberPattern(match[DATE_GROUP]);

        const components = context.createParsingComponents({
            'day': day, 'month': month
        });

        if (match[YEAR_GROUP]) {
            const year = parseYear(match[YEAR_GROUP])
            components.assign('year', year)
        } else {
            const year = findYearClosestToRef(context.refDate, day, month)
            components.imply('year', year)
        }

        // Weekday component
        if (match[WEEKDAY_GROUP]) {
            const weekday = WEEKDAY_DICTIONARY[match[WEEKDAY_GROUP].toLowerCase()]
            components.assign('weekday', weekday);
        }

        if (!match[DATE_TO_GROUP]) {
            return components
        }

        // Text can be 'range' value. Such as 'January 12 - 13, 2012'
        const endDate = parseOrdinalNumberPattern(match[DATE_TO_GROUP]);
        const result = context.createParsingResult(match.index, match[0])
        result.start = components;
        result.end = components.clone();
        result.end.assign('day', endDate);

        return result;
    }

}