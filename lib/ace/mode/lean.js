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
var TextMode = require("./text").Mode;
var leanHighlightRules = require("./lean_highlight_rules").leanHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
var Range = require("../range").Range;
// TODO(soonhok): figure out behavior and foldmode
// var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
// var CStyleFoldMode = require("./folding/cstyle").FoldMode;

var Mode = function() {
    this.HighlightRules = leanHighlightRules;

    this.$outdent = new MatchingBraceOutdent();
    // this.$behaviour = new CstyleBehaviour();
    // this.foldingRules = new CStyleFoldMode();
};
oop.inherits(Mode, TextMode);

(function() {

    this.lineCommentStart = "--";
    this.blockComment = {start: "/-", end: "-/"};

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;
        var endState = tokenizedLine.state;

        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }

        if (state == "start") {
            var match = line.match(/^.*[\{\(\[]\s*$/);
            if (match) {
                indent += tab;
            }
        } else if (state == "doc-start") {
            if (endState == "start") {
                return "";
            }
            var match = line.match(/^\s*(\/?)\*/);
            if (match) {
                if (match[1]) {
                    indent += " ";
                }
                indent += "- ";
            }
        }

        return indent;
    };

    this.checkOutdent = function(state, line, input) {
        return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function(state, doc, row) {
        this.$outdent.autoOutdent(doc, row);
    };

    this.$id = "ace/mode/lean";
}).call(Mode.prototype);

exports.Mode = Mode;
});
