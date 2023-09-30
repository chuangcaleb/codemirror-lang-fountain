import { Extension } from "@codemirror/state";
import { LanguageSupport, StreamLanguage } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const tokenTypes = {
  "scene-heading":
    /^((?:\*{0,3}_?)?(?:(?:int|ext|est|i\/e)[. ]).+)|^(?:\.(?!\.+))(.+)/i,
  // scene_number: /( *#(.+)# *)/,

  character: /^\s*[A-Z][A-Z0-9 \t]+$/,
  dialogue: /^\s*(\^?)?(?:\n(?!\n+))([\s\S]+)/,
  parenthetical: /^(\(.+\))$/,

  centered: /^>[^<>\n]+<$/g,
  transition: /^(>[^<\n\r]*|[A-Z ]+ TO:)$/,

  // section: /^(#+)(?: *)(.*)/,
  synopsis: /^(?:\=(?!\=+) *)(.*)/,

  // note: /^(?:\[{2}(?!\[+))(.+)(?:\]{2}(?!\[+))$/,
  // note_inline: /(?:\[{2}(?!\[+))([\s\S]+?)(?:\]{2}(?!\[+))/g,
  // boneyard: /(^\/\*|^\*\/)$/g,

  page_break: /^\={3,}$/,
  // line_break: /^ {2}$/,

  // emphasis: /(_|\*{1,3}|_\*{1,3}|\*{1,3}_)(.+)(_|\*{1,3}|_\*{1,3}|\*{1,3}_)/g,
  // bold_italic_underline:
  //   /(_{1}\*{3}(?=.+\*{3}_{1})|\*{3}_{1}(?=.+_{1}\*{3}))(.+?)(\*{3}_{1}|_{1}\*{3})/g,
  // bold_underline:
  //   /(_{1}\*{2}(?=.+\*{2}_{1})|\*{2}_{1}(?=.+_{1}\*{2}))(.+?)(\*{2}_{1}|_{1}\*{2})/g,
  // italic_underline:
  //   /(?:_{1}\*{1}(?=.+\*{1}_{1})|\*{1}_{1}(?=.+_{1}\*{1}))(.+?)(\*{1}_{1}|_{1}\*{1})/g,
  // bold_italic: /(\*{3}(?=.+\*{3}))(.+?)(\*{3})/g,
  // bold: /(\*{2}(?=.+\*{2}))(.+?)(\*{2})/g,
  // italic: /(\*{1}(?=.+\*{1}))(.+?)(\*{1})/g,
  // underline: /(_{1}(?=.+_{1}))(.+?)(_{1})/g,
};

function tokenize(stream, state) {
  stream.skipToEnd();
  // if (stream.string.includes("<")) {
  //   const r = tokenTypes["centered"].test(stream.string);
  //   console.log(r);
  // }
  for (const type in tokenTypes) {
    if (tokenTypes[type].test(stream.string)) {
      if (type === "character") {
        state.inDialogue = true;
      }
      // console.log(3, type, stream.string);
      return type;
    }
  }

  if (state.inDialogue) {
    // console.log(3, "dialogue", stream.string);
    return "dialogue";
  }
  // console.log(3, "action", stream.string);

  // Action by default
  return "action";
}

function handleBlank(state, indentLevel) {
  state.inDialogue = false;
}

/// A language provider that provides JSON parsing.
export const fountainLanguage = StreamLanguage.define({
  name: "fountain",
  startState: () => ({
    inDialogue: false,
  }),
  token: tokenize,
  blankLine: handleBlank,
  languageData: {
    closeBrackets: { brackets: ["[", "{", '"'] },
    indentOnInput: /^\s*[\}\]]$/,
  },
  tokenTable: {
    "scene-heading": t.className,
    synopsis: t.docComment,
    action: t.lineComment,
    character: t.propertyName,
    dialogue: t.string,
    parenthetical: t.comment,
    centered: t.heading2,
    page_break: t.heading2,
    transition: t.keyword,
  },
});

export function fountain() {
  return new LanguageSupport(fountainLanguage);
}

// export const fountainHighlight = HighlightStyle.define([
//   { tag: t.keyword, color: "#fc6" },
//   { tag: t.lineComment, color: "#444" },
//   { tag: t.docComment, color: "#888" },
//   { tag: t.className, fontWeight: 600 },
//   { tag: t.heading2, fontWeight: 600, display: "block", textAlign: "center" },
//   { tag: t.keyword, fontWeight: 600, display: "block", textAlign: "right" },
//   {
//     tag: t.comment,
//     fontStyle: "italic",
//     display: "block",
//     textAlign: "center",
//   },
//   {
//     tag: t.propertyName,
//     color: "#225",
//     display: "block",
//     textAlign: "center",
//   },
//   { tag: t.string, color: "#252", display: "block", textAlign: "center" },
// ]);

// class FountainPlugin implements PluginValue {
//   constructor(view: EditorView) {
//     view.dispatch({ effects: StateEffect.appendConfig.of([fountainLanguage]) });
//   }

//   update(update: ViewUpdate) {
//     // ...
//   }

//   destroy() {
//     // ...
//   }
// }
// export const fountainPlugin = ViewPlugin.fromClass(FountainPlugin);

export const fountainPlugin: Extension = (() => [fountain()])();
