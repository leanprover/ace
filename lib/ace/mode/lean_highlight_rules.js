/* ***** BEGIN LICENSE BLOCK *****
 *
 * Copyright (c) 2014 Microsoft Corporation. All rights reserved.
 * Released under Apache 2.0 license as described in the file LICENSE.
 *
 * Author: Soonho Kong
 *
 * ***** END LICENSE BLOCK ***** */

define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var DocCommentHighlightRules = require("./doc_comment_highlight_rules").DocCommentHighlightRules;
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var leanHighlightRules = function() {

    var keywordControls = (
        ["import", "reducible", "irreducible", "tactic_hint", "protected",
         "private", "opaque", "definition", "renaming", "hiding", "exposing",
         "parameter", "parameters", "begin", "proof", "qed", "conjecture",
         "constant", "constants", "example",
         "hypothesis", "lemma", "corollary", "variable", "variables", "print",
         "theorem", "context", "open", "as", "export", "axiom", "inductive",
         "with", "structure", "universe", "universes", "alias", "help", "environment",
         "options", "precedence", "postfix", "prefix", "calc_trans",
         "calc_subst", "calc_refl", "infix", "infixl", "infixr", "notation",
         "eval", "check", "exit", "coercion", "end", "using", "namespace",
         "instance", "class", "section", "set_option", "omit", "classes", "instances", "coercions", "raw",
         "add_rewrite", "extends", "calc", "have", "obtains", "show", "by", "in", "let",
         "forall", "fun", "exists", "if", "then", "else", "assume", "match",
         "take", "obtain", "from"].join("|")
    );

    var storageType = (
        ["Prop", "Type", "Type'", "Type₊", "Type₁", "Type₂", "Type₃"].join("|")
    );

    var storageModifiers = (
        "\\[(" +
            ["persistent", "notation", "visible", "instance", "class",
             "coercion", "reducible", "off", "none", "on"].join("|") +
            ")\\]"
    );

    var keywordOperators = (
        [].join("|")
    );

    var builtinConstants = (
        "NULL|true|false|TRUE|FALSE"
    );

    var keywordMapper = this.$keywords = this.createKeywordMapper({
        "keyword.control" : keywordControls,
        "storage.type" : storageType,
        "keyword.operator" : keywordOperators,
        "variable.language": "sorry",
        "constant.language": builtinConstants
    }, "identifier");

    var identifierRe = "[A-Za-z_\u03b1-\u03ba\u03bc-\u03fb\u1f00-\u1ffe\u2100-\u214f][A-Za-z0-9_'\u03b1-\u03ba\u03bc-\u03fb\u1f00-\u1ffe\u2070-\u2079\u207f-\u2089\u2090-\u209c\u2100-\u214f]*";
    var operatorRe = new RegExp(["#", "@", "->", "∼", "↔", "/", "==", "=", ":=", "<->",
                                 "/\\", "\\/", "∧", "∨", "≠", "<", ">", "≤", "≥", "¬",
                                 "<=", ">=", "⁻¹", "⬝", "▸", "\\+", "\\*", "-", "/",
                                 "λ", "→", "∃", "∀", ":="].join("|"));
    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used

    this.$rules = {
        "start" : [
            {
                token : "comment", // single line comment "--"
                regex : "--.*$"
            },
            DocCommentHighlightRules.getStartRule("doc-start"),
            {
                token : "comment", // multi line comment "/-"
                regex : "\\/-",
                next : "comment"
            }, {
                token : "string", // single line
                regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
            }, {
                token : "string", // multi line string start
                regex : '["].*\\\\$',
                next : "qqstring"
            }, {
                token : "string", // single line
                regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
            }, {
                token : "string", // multi line string start
                regex : "['].*\\\\$",
                next : "qstring"
            }, {
                token : "constant.numeric", // hex
                regex : "0[xX][0-9a-fA-F]+(L|l|UL|ul|u|U|F|f|ll|LL|ull|ULL)?\\b"
            }, {
                token : "constant.numeric", // float
                regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?(L|l|UL|ul|u|U|F|f|ll|LL|ull|ULL)?\\b"
            }, {
                token : "storage.modifier",
                regex : storageModifiers
            }, {
                token : "keyword", // pre-compiler directives
                regex : "#\\s*(?:include|import|pragma|line|define|undef|if|ifdef|else|elif|ifndef)\\b",
                next  : "directive"
            }, {
                token : "keyword", // special case pre-compiler directive
                regex : "(?:#\\s*endif)\\b"
            }, {
                token : keywordMapper,
                regex : identifierRe
            }, {
                token : "operator",
                regex : operatorRe
            }, {
              token : "punctuation.operator",
              regex : "\\?|\\:|\\,|\\;|\\."
            }, {
                token : "paren.lparen",
                regex : "[[({]"
            }, {
                token : "paren.rparen",
                regex : "[\\])}]"
            }, {
                token : "text",
                regex : "\\s+"
            }
        ],
        "comment" : [
            {
                token : "comment", // closing comment
                regex : ".*?-\\/",
                next : "start"
            }, {
                token : "comment", // comment spanning whole line
                regex : ".+"
            }
        ],
        "qqstring" : [
            {
                token : "string",
                regex : '(?:(?:\\\\.)|(?:[^"\\\\]))*?"',
                next : "start"
            }, {
                token : "string",
                regex : '.+'
            }
        ],
        "qstring" : [
            {
                token : "string",
                regex : "(?:(?:\\\\.)|(?:[^'\\\\]))*?'",
                next : "start"
            }, {
                token : "string",
                regex : '.+'
            }
        ],
        "directive" : [
            {
                token : "constant.other.multiline",
                regex : /\\/
            },
            {
                token : "constant.other.multiline",
                regex : /.*\\/
            },
            {
                token : "constant.other",
                regex : "\\s*<.+?>",
                next : "start"
            },
            {
                token : "constant.other", // single line
                regex : '\\s*["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]',
                next : "start"
            },
            {
                token : "constant.other", // single line
                regex : "\\s*['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']",
                next : "start"
            },
            // "\" implies multiline, while "/" implies comment
            {
                token : "constant.other",
                regex : /[^\\\/]+/,
                next : "start"
            }
        ]
    };

    this.embedRules(DocCommentHighlightRules, "doc-",
        [ DocCommentHighlightRules.getEndRule("start") ]);
};

oop.inherits(leanHighlightRules, TextHighlightRules);

exports.leanHighlightRules = leanHighlightRules;
});
