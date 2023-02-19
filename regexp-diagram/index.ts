import { RailwayMaker, defaultStyle } from './railway-maker.js';

export function makeDiagramSvg(regexp, style = defaultStyle) {
  // const parsed = parseRegExp(/(?=a)(?!a)(?<=a)(?<!a)/);
  // const parsed = parseRegExp(/([eE])?(a|b)?(a?)(a)?a*(a+)/);
  // const parsed = parseRegExp(/-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
  const parsed = parseRegExp(regexp);
  console.debug(parsed);

  const mergedStyle = {
    ...defaultStyle,
    // wrap: Infinity,
    // wrap: 0,
    wrap: 640,
    padding: 12,

    ...style,
  };
  const railwayMaker = RailwayMaker(mergedStyle);

  // let stations = testStations(railwayMaker);
  let stations = convertTokensToStations(railwayMaker, parsed);
  stations = [
    railwayMaker.TerminalStation(),
    ...stations,
    railwayMaker.TerminalStation(),
  ];

  const routes: any[] = [];
  let route = railwayMaker.StraightRoute([]);
  for (let i = 0; i < stations.length; ++i) {
    if (route.stations.length > 0 && route.width + stations[i].width > mergedStyle.wrap) {
      routes.push(route);
      route = railwayMaker.StraightRoute([]);
    }
    route.stations.push(stations[i]);
  }
  routes.push(route);
  const wrapping = railwayMaker.Bounds(railwayMaker.Wrapping(routes));

  const svg = railwayMaker.StyledSvgTag(`
.group > rect.border {
  fill: #F0FFF0;
  stroke: green;
}
rect.bounds {
  /* stroke: magenta; */
  stroke: none;
}
  `);
  svg.value.setAttribute(
    'width',
    wrapping.width + mergedStyle.padding * 2,
  );
  svg.value.setAttribute(
    'height',
    wrapping.height + mergedStyle.padding * 2,
  );
  svg.appendChild('rect', {
    width: svg.value.getAttribute('width'),
    height: svg.value.getAttribute('height'),
    fill: '#fff',
  });
  const g = svg.appendChild('g', {
    transform: `translate(${mergedStyle.padding}, ${mergedStyle.padding})`,
  });
  g.value.appendChild(wrapping.render().value);
  return svg.value;
}

function convertTokensToStations(railwayMaker, tokens) {
  const stations: any[] = [];
  for (let token of tokens) {
    let station: any;
    switch (token.type) {
      case TokenType.Branch:
        station = railwayMaker.Switch(
          (token.value as Token[][]).map((subTokens) =>
            railwayMaker.StraightRoute(
              convertTokensToStations(railwayMaker, subTokens)
            )
          )
        );
        break;
      case TokenType.Character:
        station = railwayMaker.CharacterStation(token.value as string);
        break;
      case TokenType.CharacterRange:
        station = railwayMaker.RangeStation(
          railwayMaker.CharacterStation(token.value[0].value as string),
          railwayMaker.CharacterStation(token.value[1].value as string),
          false,
        );
        break;
      case TokenType.Classified:
        station = railwayMaker.CharacterStation(token.value as string, true);
        break;
      case TokenType.Selection:
        station = railwayMaker.SelectionStation(convertTokensToStations(railwayMaker, token.value as Token[]));
        break;
      case TokenType.Group:
        station = railwayMaker.Border(
          railwayMaker.StraightRoute(convertTokensToStations(railwayMaker, token.value as Token[])),
          token.lookahead ? `${token.lookahead} lookahead` : (
            token.lookbehind ? `${token.lookbehind} lookbehind` : (
              token.groupName ? `group <${token.groupName}>` : (token.groupNumber != null ? `group #${token.groupNumber}` : 'group')
            )
          ),
          true,
          'group'
        );
        break;
      default:
        throw '';
    }
    if (token.repeat) {
      const repeat = token.repeat;
      if (repeat.max != 1) {
        let annotation: string = '';
        if (repeat.min >= 2 || repeat.max >= 2) {
          if (!isFinite(repeat.max)) {
            if (repeat.min >= 2) {
              annotation = `${repeat.min - 1}+ times`;
            } else {
              annotation = '';
            }
          } else if (repeat.min == repeat.max) {
            if (repeat.min == 2) {
              annotation = 'once';
            } else {
              annotation = `${repeat.min - 1} times`;
            }
          } else {
            if (repeat.min <= 1) {
              if (repeat.max == 2) {
                annotation = 'at most once';
              } else {
                annotation = `at most ${repeat.max - 1} times`;
              }
            } else {
              annotation = `${repeat.min - 1}..${repeat.max - 1} times`;
            }
          }
        }
        station = railwayMaker.Loop(station, annotation, !repeat.nonGreedy);
      }
      if (repeat.min == 0) {
        station = railwayMaker.Shortcut(station);
      }
      stations.push(station);
    } else {
      stations.push(station);
    }
  }
  // DEBUG
  for (let i = 0; i < stations.length; ++i) {
    stations[i] = railwayMaker.Bounds(stations[i]);
  }
  return stations;
}

function testStations(railwayMaker) {
  const stations: any[] = [];
  stations.push(railwayMaker.TerminalStation());
  stations.push(
    railwayMaker.CharacterStation(
      'Hello world!',
      false
    )
  );
  stations.push(
    railwayMaker.Loop(
      railwayMaker.CharacterStation(
        'any character',
        true
      ),
      'loop',
      false
    )
  );
  stations.push(
    railwayMaker.Shortcut(
      railwayMaker.CharacterStation(
        'a',
        true
      )
    )
  );
  stations.push(
    railwayMaker.Shortcut(
      railwayMaker.Loop(
        railwayMaker.CharacterStation(
          'a',
          true
        )
      )
    )
  );
  stations.push(
    railwayMaker.Loop(
      railwayMaker.Loop(
        railwayMaker.CharacterStation(
          'a',
          true
        ),
        'inner loop text ...'
      ),
      'outer loop text ...'
    )
  );
  stations.push(
    railwayMaker.Shortcut(
      railwayMaker.Shortcut(
        railwayMaker.CharacterStation(
          'a',
          true
        )
      )
    )
  );
  stations.push(
    railwayMaker.Loop(
      railwayMaker.Shortcut(
        railwayMaker.CharacterStation(
          'a',
          true
        )
      ),
      ''
    )
  );
  stations.push(
    railwayMaker.Border(
      railwayMaker.CharacterStation(
        'a',
        true
      ),
      'group'
    )
  );
  stations.push(
    railwayMaker.Border(
      railwayMaker.CharacterStation(
        'a',
        true
      ),
      'long long text ...'
    )
  );
  stations.push(
    railwayMaker.Border(
      railwayMaker.Shortcut(
        railwayMaker.CharacterStation(
          'a',
          true
        )
      )
    )
  );
  stations.push(
    railwayMaker.Border(
      railwayMaker.Loop(
        railwayMaker.CharacterStation(
          'a',
          true
        )
      )
    )
  );
  stations.push(
    railwayMaker.Border(
      railwayMaker.Border(
        railwayMaker.CharacterStation(
          'a',
          true
      ),
        'inner border text ...'
      ),
      'outer border text ...'
    )
  );
  stations.push(railwayMaker.SelectionStation(
    [
      railwayMaker.CharacterStation('1'),
      railwayMaker.CharacterStation('a', true),
      railwayMaker.RangeStation(railwayMaker.CharacterStation('0'), railwayMaker.CharacterStation('9'), false),
    ]
  ));
  stations.push(
    railwayMaker.Shortcut(
      railwayMaker.SelectionStation(
        [
          railwayMaker.CharacterStation('1'),
          railwayMaker.CharacterStation('a', true),
          railwayMaker.RangeStation(railwayMaker.CharacterStation('0'), railwayMaker.CharacterStation('9'), false),
        ]
      )
    )
  );
  stations.push(
    railwayMaker.Shortcut(
      railwayMaker.Loop(
        railwayMaker.SelectionStation(
          [
            railwayMaker.CharacterStation('1'),
            railwayMaker.CharacterStation('a', true),
            railwayMaker.RangeStation(railwayMaker.CharacterStation('0'), railwayMaker.CharacterStation('9'), false),
          ]
        )
      )
    )
  );
  stations.push(
    railwayMaker.Switch(
      [
        railwayMaker.CharacterStation('1'),
        railwayMaker.Loop(railwayMaker.CharacterStation('a', true), 'once'),
        railwayMaker.Shortcut(railwayMaker.CharacterStation('a', true)),
      railwayMaker.Shortcut(
        railwayMaker.Loop(
            railwayMaker.SelectionStation(
              [
                railwayMaker.CharacterStation('1'),
                railwayMaker.CharacterStation('a', true),
                railwayMaker.RangeStation(railwayMaker.CharacterStation('0'), railwayMaker.CharacterStation('9'), false),
              ]
        )
          )
        )
      ]
    )
  );
  stations.push(railwayMaker.RangeStation(railwayMaker.CharacterStation('1'), railwayMaker.CharacterStation('a', true)));
  stations.push(railwayMaker.StraightRoute(
    [
      railwayMaker.CharacterStation('1'),
      railwayMaker.Loop(railwayMaker.CharacterStation('a', true)),
      railwayMaker.Border(railwayMaker.CharacterStation('a', true)),
      railwayMaker.Shortcut(railwayMaker.CharacterStation('a', true)),
    ]
  ));
  stations.push(railwayMaker.TerminalStation());
  return stations;
}

/**
 * @param {string|RegExp} regexp will be parsed
 * @throws {string} error message when failed to parse the `regexp`
 */
function parseRegExp(regexp) {
  const context = {
    groupNumber: 0,
    groupNames: [],
  };

  let pattern;
  if (typeof regexp === 'string') {
    // TODO: Check flags and remove '/' on head and tail if needed...
    pattern = regexp;
  }
  else if (regexp instanceof RegExp) {
    if (regexp.flags.indexOf('u') != -1) {
      console.warn(`Regular expression flag 'u' is not supported.`);
    }

    pattern = regexp.source;
  } else {
    throw `Error: Not supported parameter type for regexp: type=${typeof regexp}`;
  }

  return readTokens(context, pattern);
}

function readTokens(context, pattern, firstIndex = 0) {
  const tokens: Token[] = [];
  while (pattern.length > 0) {
    const [token, length] = readToken(context, pattern, firstIndex);
    token._textRange = {
      firstIndex,
      lastIndex: firstIndex + length,
    };
    firstIndex += length;

    if (token.type === TokenType.Repeat) {
      if (tokens.length === 0) {
        throw 'Syntax error: Nothing to repeat';
      }

      const lastToken = tokens.slice(-1)[0];
      if (!isRepeatable(lastToken)) {
        throw 'Syntax error: Nothing to repeat';
      }
      if (token.value === '?') {
        if (lastToken.repeat) {
          if (lastToken.repeat.nonGreedy) {
            throw 'Syntax error: duplicated non-greedy';
          } else {
            lastToken.repeat.nonGreedy = true;
          }
        } else {
          lastToken.repeat = { min: 0, max: 1 };
        }
      } else {
        lastToken.repeat = token.value;
      }
    } else {
      tokens.push(token);
    }

    pattern = pattern.slice(length);
  }

  const concatenated = concatenateCharacterTokens(tokens);
  const calculated = calculate(concatenated);
  return calculated;
}

/**
 * Returns a station with parsing the `pattern`
 * @param {string} pattern begin parsed
 * @param {number} firstIndex for attaching `_textRange` property to parsed station
 * @returns {Token} station
 * @throws {string} error message when failed to parse the `pattern`
 */
function readToken(context, pattern, firstIndex): [Token, number] {
  // Operator
  if (pattern[0] === '|') {
    return [
      {
        type: TokenType.Operator,
        value: '|',
      },
      1,
    ];
  }

  // group
  if (pattern[0] == '(') {
    let i;
    let nest = 1;
    for (i = 1; i < pattern.length; ++i) {
      let c = pattern[i];
      if (c == '(') {
        nest += 1;
      } else if (c == ')') {
        nest -= 1;
      } else if (c == '\\') {
        i += 1; // skip next character
      }
      if (nest == 0) {
        break;
      }
    }
    if (nest != 0) {
      throw `Syntax error: missing ')'`;
    }

    // supportsNamedGroup
    {
      let groupText = pattern.substr(0, i + 1);
      let re = /^\(\?<([^>]+)>/g;
      let result = re.exec(groupText);
      if (result) {
        let groupName = result[1];
        if (context.groupNames.indexOf(groupName) != -1) {
          throw `Syntax error: duplicated group name '${groupName}'`;
        }
        context.groupNames.push(groupName);
        // named group
        return [
          {
            type: TokenType.Group,
            value: readTokens(
              context,
              pattern.slice(re.lastIndex, i - re.lastIndex),
              firstIndex + re.lastIndex,
            ),
            groupName,
          }, i + 1,
        ];
      }
    }

    if (pattern.startsWith('(?:')) {
      // non-capturing parentheses
      return [
        {
          type: TokenType.Group,
          value: readTokens(context, pattern.slice(3, i), firstIndex + 3),
        },
        i + 1,
      ];
    } else if (pattern.startsWith('(?=')) {
      // lookahead
      return [
        {
          type: TokenType.Group,
          value: readTokens(context, pattern.slice(3, i), firstIndex + 3),
          lookahead: 'positive',
        },
        i + 1,
      ];
    } else if (pattern.startsWith('(?!')) {
      // lookahead
      return [
        {
          type: TokenType.Group,
          value: readTokens(context, pattern.slice(3, i), firstIndex + 3),
          lookahead: 'negative',
        },
        i + 1,
      ];
    } else if (pattern.startsWith('(?<=')) {
      // lookbehind
      return [
        {
          type: TokenType.Group,
          value: readTokens(context, pattern.slice(4, i), firstIndex + 4),
          lookbehind: 'positive',
        },
        i + 1,
      ];
    } else if (pattern.startsWith('(?<!')) {
      // lookbehind
      return [
        {
          type: TokenType.Group,
          value: readTokens(context, pattern.substr(4, i - 4), firstIndex + 4),
          lookbehind: 'negative',
        },
        i + 1,
      ];
    } else {
      // capturing parentheses
      context.groupNumber += 1;
      let groupNumber = context.groupNumber;
      return [
        {
          type: TokenType.Group,
          value: readTokens(context, pattern.slice(1, i), firstIndex + 1),
          groupNumber,
        },
        i + 1,
      ];
    }
  }

  // Repeat
  if (pattern[0] === '*') {
    return [
      {
        type: TokenType.Repeat,
        value: { min: 0, max: Infinity },
      },
      1,
    ];
  } else if (pattern[0] === '+') {
    return [
      {
        type: TokenType.Repeat,
        value: { min: 1, max: Infinity },
      },
      1,
    ];
  } else if (pattern[0] === '?') {
    return [
      {
        type: TokenType.Repeat,
        value: '?',
      },
      1,
    ];
  } else {
    let re = /^\{(\d+)(,(\d+)?)?\}/g;
    let result = re.exec(pattern);
    if (result) {
      if (result[3]) {
        // e.g. /{2,3}/
        return [
          {
            type: TokenType.Repeat,
            value: { min: result[1], max: result[3] },
          },
          re.lastIndex,
        ];
      } else if (result[2]) {
        // e.g. /{2,}/
        return [
          {
            type: TokenType.Repeat,
            value: { min: result[1], max: Infinity },
          },
          re.lastIndex,
        ];
      } else {
        // e.g. /{2}/
        return [
          {
            type: TokenType.Repeat,
            value: { min: result[1], max: result[1] },
          },
          re.lastIndex,
        ];
      }
    }
  }

  // Classified
  for (const classified in ClassifiedStringTable) {
    if (pattern.startsWith(classified)) {
      return [
        {
          type: TokenType.Classified,
          value: ClassifiedStringTable[classified],
        },
        classified.length,
      ];
    }
  }
  // Classified: \cX, \xhh, \uhhhh
  {
    {
      let re = /^\\c([A-Za-z])/g;
      let result = re.exec(pattern);
      if (result) {
        let letter = result[1].toUpperCase();
        let hex = (letter.charCodeAt(0) - 'A'.charCodeAt(0) + 1)
          .toString(16)
          .padStart(2, '0');
        return [
          {
            type: TokenType.Classified,
            value: `ctrl-${letter} (0x${hex})`,
          },
          re.lastIndex,
        ];
      }
    }
    {
      let re = /^\\x([0-9A-Za-z]{2})/g;
      let result = re.exec(pattern);
      if (result) {
        let hex = result[1].toUpperCase();
        return [
          {
            type: TokenType.Classified,
            value: `0x${hex}`,
          },
          re.lastIndex,
        ];
      }
    }
    {
      let re = /^\\u([0-9A-Za-z]{4})/g;
      let result = re.exec(pattern);
      if (result) {
        let hex = result[1].toUpperCase();
        return [
          {
            type: TokenType.Classified,
            value: `U+${hex}`,
          },
          re.lastIndex,
        ];
      }
    }
  }

  // selection (characterSet)
  {
    let re = /^\[(.*?(?:[^\\](?=])|\\\\(?=])))\]/g;
    let result = re.exec(pattern);
    if (result) {
      let value = result[1];
      if (value.length > 0 && value[0] == '^') {
        value = value.slice(1);
        return [
          {
            type: TokenType.Selection,
            value: listSelection(context, value, firstIndex),
            isNegativeSelection: true,
          },
          re.lastIndex,
        ];
      } else {
        return [
          {
            type: TokenType.Selection,
            value: listSelection(context, value, firstIndex),
          },
          re.lastIndex,
        ];
      }
    }
  }

  // Character (escape sequence)
  if (pattern[0] === '\\') {
    if (pattern.length > 1) {
      if ('123456789'.indexOf(pattern[1]) !== -1) {
        return [
          {
            type: TokenType.Classified,
            value: `ref #${pattern[1]}`,
          },
          2,
        ];
      }

      // supportsNamedGroup
      {
        let re = /^\\k<([^>]+)>/g;
        let result = re.exec(pattern);
        if (result) {
          // named reference
          return [
            {
              type: TokenType.Classified,
              value: `ref <${result[1]}>`,
            },
            re.lastIndex,
          ];
        }
      }

      // NOTE: on-effective escape sequence
      return [
        {
          type: TokenType.Character,
          value: pattern[1],
        },
        2,
      ];
    } else {
      throw `Syntax error: invalid escape sequence`;
    }
  }

  // Single character
  return [
    {
      type: TokenType.Character,
      value: pattern[0],
    },
    1,
  ];
}

function listSelection(context, pattern, firstIndex): Token[] {
  const tokens: Token[] = [];
  // first '-' is character
  if (pattern[0] == '-' && pattern.length > 0) {
    tokens.push({
      type: TokenType.Character,
      value: '-',
    });
    pattern = pattern.slice(1);
  }
  while (pattern.length > 0) {
    // HACK: read special character
    if ('^$*+?.(|{['.indexOf(pattern[0]) != -1) {
      tokens.push({
          type: TokenType.Character,
          value: pattern[0]
      });
      pattern = pattern.slice(1);
    } else if (pattern.startsWith('\\b')) {
      tokens.push({
          type: TokenType.Classified,
          value: 'backspace (0x08)'
      });
      pattern = pattern.slice(2);
    } else if (pattern.startsWith('\\B') || pattern.startsWith('\\-') || pattern.startsWith('\\\\')) {
      tokens.push({
          type: TokenType.Classified,
          value: pattern[1]
      })
      pattern = pattern.slice(2);
    } else if (pattern[0] == '-') {
      tokens.push({
        type: TokenType.Operator,
        value: pattern[0],
      });
      pattern = pattern.slice(1);
    } else {
      const [ token, length ] = readToken(context, pattern, firstIndex);
      tokens.push(token);
      pattern = pattern.slice(length);
    }
  }

  let calculated: Token[] = [];
  let merges = false;
  for (let token of tokens) {
    if (token.type === TokenType.Operator && token.value === '-') {
      merges = true;
      continue;
    }
    if (merges) {
      let lastToken = calculated.pop()!;
      calculated.push({
        type: TokenType.CharacterRange,
        value: [lastToken, token],
      });
      merges = false;
    } else {
      calculated.push(token);
    }
  }
  if (merges) {
    // last '-' is character
    calculated.push({
      type: TokenType.Character,
      value: '-'
    });
  }
  return calculated;
}

function concatenateCharacterTokens(tokens: Token[]): Token[] {
  const concatenated: Token[] = [];
  for (let token of tokens) {
    if (concatenated.length === 0) {
      concatenated.push({ ...token });
    } else {
      const lastToken = concatenated.slice(-1)[0];
      if (lastToken.type === TokenType.Character && !lastToken.repeat && token.type === TokenType.Character && !token.repeat) {
        lastToken.value += token.value;
        if (lastToken._textRange && token._textRange) {
          lastToken._textRange.lastIndex = token._textRange.lastIndex;
        }
      } else {
        concatenated.push({ ...token });
      }
    }
  }
  return concatenated;
}

function calculate(tokens) {
  // Splits with operator '|' (branch)
  if (!tokens.find(it => it.type === TokenType.Operator && it.value === '|')) {
      return tokens;
  }

  // FIXME: The following should be able to simple...
  let splitted: Token[][] = [];
  var buf: Token[] = [];
  for (let token of tokens) {
      if (token.type === TokenType.Operator && token.value === '|') {
          splitted.push(buf)
          buf = [];
      }
      else {
          buf.push(token)
      }
  }
  splitted.push(buf)

  return [
    {
      type: TokenType.Branch,
      value: splitted
    }
  ];
}

const TokenType = {
  Branch: 'Branch',
  Character: 'Character',
  CharacterRange: 'CharacterRange',
  Classified: 'Classified',
  Group: 'Group',
  Repeat: 'Repeat',
  Selection: 'Selection',
  Operator: 'Operator',
} as const;
type TokenType = typeof TokenType[keyof typeof TokenType];

type Token = {
  type: TokenType,
  value: any,
  repeat?: any,
  isNegativeSelection?: boolean,
  groupName?: string,
  groupNumber?: number,
  lookahead?: string,
  lookbehind?: string,
  _textRange?: {
    firstIndex: number,
    lastIndex: number,
  },
};

const ClassifiedStringTable = {
  '^'    : 'beginning of line',
  '$'    : 'end of line',
  '.'    : 'any character',
  '[\\b]': 'backspace (0x08)',
  '\\b'  : 'word boundary',
  '\\B'  : 'non-word boundary',
  '\\d'  : 'digit', // [0-9]
  '\\D'  : 'non-digit', // [^0-9]
  '\\f'  : 'form feed (0x0C)',
  '\\n'  : 'line feed (0x0A)',
  '\\r'  : 'carriage return (0x0D)',
  '\\s'  : 'white space',
  '\\S'  : 'non-white space',
  '\\t'  : 'tab (0x09)',
  '\\v'  : 'vertical tab (0x0B)',
  '\\w'  : 'word', // [A-Za-z0-9_]
  '\\W'  : 'non-word', // [^A-Za-z0-9_]
  '\\0'  : 'null (0x00)'
} as const;

function isRepeatable(token: Token): boolean {
  return token.type === TokenType.Character || token.type === TokenType.Classified || token.type === TokenType.Group || token.type === TokenType.Selection;
}
