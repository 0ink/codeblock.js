#!/usr/bin/env bash.origin.test via github.com/mochajs/mocha

const FS = require("fs");
const ASSERT = require('assert');
const CODEBLOCK = require("../../codeblock");

describe('Variable Replacement', function () {

    it('Source to serialized and back (with $)', function () {

        let source = `{
    "main": (javascript (data) >>>
        return {
            "foo": [
                'bar',
                '$',
                '\\$'
            ]
        };
    <<<)
}`;

        let frozen = CODEBLOCK.purifyCode(source, {
            freezeToJSON: true
        });

        ASSERT.deepEqual(JSON.parse(frozen.toString()), {
            main: {
                '.@': 'github.com~0ink~codeblock/codeblock:Codeblock',
                _code: `return {\\n    "foo": [\\n        'bar',\\n        '$',\\n        '\\$'\\n    ]\\n};`,
                _format: 'javascript',
                _args: [ 'data' ],
                _compiled: false
            }
        });

        let doc = CODEBLOCK.freezeToSource(JSON.parse(frozen.toString()));

        ASSERT.deepEqual(doc, source);
    });

    it('Source to serialized and back (with various special characters)', function () {

        let source = `{
    "main": (twig () >>>
        SELECT
            to_char(date, 'YYYY-MM-DD') AS day,
            REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(substring(regexp_substr(referral_url, 'referralURL=[^&]*'), 13),'%21','!')
                    ,'%23','#'),'%24','$'),'%25','%'),'%26','&'),'%27','\''),'%28','('),'%29',')'),'%2A','*'),'%2B','+'),'%2C',',')
                ,'%2F','/'),'%3A',':'),'%3B',';'),'%3D','='),'%3F','?'),'%40','@'),'%5B','['),'%5D',']'),'%20',' ') as tp,
            SUM(o * t2.rs) AS r
        FROM table1 t JOIN table2 t2 ON t.p = mp.id
        WHERE t2.p IN (1, 2)
        AND t.date >= '{{ sD }}'
        AND t.date < '{{ sD }}'
        GROUP BY da, rf
        ORDER BY rf
    <<<)
}`;

        let frozen = CODEBLOCK.purifyCode(source, {
            freezeToJSON: true
        });

        ASSERT.deepEqual(JSON.parse(frozen.toString()), {
            "main": {
                ".@": "github.com~0ink~codeblock/codeblock:Codeblock",
                "_code": "SELECT\\n    to_char(date, 'YYYY-MM-DD') AS day,\\n    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(\\n        REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(substring(regexp_substr(referral_url, 'referralURL=[^&]*'), 13),'%21','!')\\n            ,'%23','#'),'%24','$'),'%25','%'),'%26','&'),'%27','''),'%28','('),'%29',')'),'%2A','*'),'%2B','+'),'%2C',',')\\n        ,'%2F','/'),'%3A',':'),'%3B',';'),'%3D','='),'%3F','?'),'%40','@'),'%5B','['),'%5D',']'),'%20',' ') as tp,\\n    SUM(o * t2.rs) AS r\\nFROM table1 t JOIN table2 t2 ON t.p = mp.id\\nWHERE t2.p IN (1, 2)\\nAND t.date >= '{{ sD }}'\\nAND t.date < '{{ sD }}'\\nGROUP BY da, rf\\nORDER BY rf",
                "_format": "twig",
                "_args": [],
                "_compiled": false
            }
        });

        let doc = CODEBLOCK.freezeToSource(JSON.parse(frozen.toString()));

        ASSERT.deepEqual(doc, source);
    });
    
});
