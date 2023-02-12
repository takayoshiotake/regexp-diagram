import { stat } from 'fs';
import { RailwayMaker, defaultStyle } from './railway-maker.js';

export function makeDiagramSvg(style = defaultStyle) {
  const parsed = parseRegExp(/te?st+t+?e{0,4}s{3}t{2,}/);
  const concatenated = concatenateCharacterTokens(parsed);
  console.log(parsed);
  console.log(concatenated);

  const mergedStyle = {
    ...defaultStyle,
    // wrap: Infinity,
    // wrap: 0,
    wrap: 600,

    ...style,
  };
  const railwayMaker = RailwayMaker(mergedStyle);

  // const stations = testStations(railwayMaker);
  const stations: any[] = [];
  for (let token of concatenated) {
    let station: any;
    switch (token.type) {
      case TokenType.Character:
        station = railwayMaker.CharacterStation(token.value as string);
        break;
      default:
        throw '';
    }
    if (token.repeat) {
      const repeat = token.repeat;
      if (repeat.max != 1) {
        let help: string = '';
        if (repeat.min >= 2 || repeat.max >= 2) {
          if (!isFinite(repeat.max)) {
            if (repeat.min >= 2) {
              help = `${repeat.min - 1}+ times`;
            } else {
              help = '';
            }
          } else if (repeat.min == repeat.max) {
            if (repeat.min == 2) {
              help = 'once';
            } else {
              help = `${repeat.min - 1} times`;
            }
          } else {
            if (repeat.min <= 1) {
              if (repeat.max == 2) {
                help = 'at most once';
              } else {
                help = `at most ${repeat.max - 1} times`;
              }
            } else {
              help = `${repeat.min - 1}..${repeat.max - 1} times`;
            }
          }
        }
        station = railwayMaker.Loop(station, help, !repeat.nonGreedy);
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

  const routes: any[] = [];
  let route = railwayMaker.StraightRoute([]);
  for (let i = 0; i < stations.length; ++i) {
    if (route.width > mergedStyle.wrap) {
      routes.push(route);
      route = railwayMaker.StraightRoute([]);
    }
    route.stations.push(stations[i]);
  }
  routes.push(route);
  const wrapping = railwayMaker.Bounds(railwayMaker.Wrapping(routes));

  const svg = railwayMaker.StyledSvgTag();
  svg.value.setAttribute('width', wrapping.width + mergedStyle.railwayWidth / 2 * 2);
  svg.value.setAttribute('height', wrapping.height + mergedStyle.railwayWidth / 2 * 2);
  let g = svg.appendChild('g', {transform: `translate(${mergedStyle.railwayWidth / 2}, ${mergedStyle.railwayWidth / 2})`});
  g.value.appendChild(wrapping.render().value);
  return svg.value;
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

  let pattern
  if (typeof regexp === 'string') {
    // TODO: Check flags and remove '/' on head and tail if needed...
    pattern = regexp;
  }
  else if (regexp instanceof RegExp) {
    if (regexp.flags.indexOf('u') != -1) {
      console.warn(`Regular expression flag 'u' is not supported.`);
    }

    pattern = regexp.source;
  }
  else {
    throw `Error: Not supported parameter type for regexp: type=${typeof regexp}`;
  }

  return readTokens(context, pattern, 0);
}

function readTokens(context, pattern, firstIndex) {
  const tokens: Token[] = [];
  while (pattern.length > 0) {
    const [ token, length ] = readToken(context, pattern, firstIndex);
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
  return tokens;
}

/**
 * Returns a station with parsing the `pattern`
 * @param {string} pattern begin parsed
 * @param {number} firstIndex for attaching `_textRange` property to parsed station
 * @returns {Token} station
 * @throws {string} error message when failed to parse the `pattern`
 */
function readToken(context, pattern, firstIndex): [Token, number] {
  let length: number = 1;

  // Repeat
  if (pattern[0] === '*') {
    return [
      {
        type: TokenType.Repeat,
        value: { min: 0, max: Infinity },
        _textRange: {
          firstIndex,
          lastIndex: firstIndex + length,
        },
      },
      length,
    ];
  } else if (pattern[0] === '+') {
    return [
      {
        type: TokenType.Repeat,
        value: { min: 1, max: Infinity },
        _textRange: {
          firstIndex,
          lastIndex: firstIndex + length,
        },
      },
      length,
    ];
  } else if (pattern[0] === '?') {
    return [
      {
        type: TokenType.Repeat,
        value: '?',
        _textRange: {
          firstIndex,
          lastIndex: firstIndex + length,
        },
      },
      length,
    ];
  } else {
    let re = /^\{(\d+)(,(\d+)?)?\}/g;
    let result = re.exec(pattern);
    if (result) {
      length = re.lastIndex;
      if (result[3]) {
        return [
          {
            type: TokenType.Repeat,
            value: { min: result[1], max: result[3] },
            _textRange: {
              firstIndex,
              lastIndex: firstIndex + length,
            },
          },
          length,
        ];
      } else if (result[2]) {
        return [
          {
            type: TokenType.Repeat,
            value: { min: result[1], max: Infinity },
            _textRange: {
              firstIndex,
              lastIndex: firstIndex + length,
            },
          },
          length,
        ];
      }
      return [
        {
          type: TokenType.Repeat,
          value: { min: result[1], max: result[1] },
          _textRange: {
            firstIndex,
            lastIndex: firstIndex + length,
          },
        },
        length,
      ];
    }
  }

  return [
    {
      type: TokenType.Character,
      value: pattern[0],
      _textRange: {
        firstIndex,
        lastIndex: firstIndex + length,
      },
    },
    length
  ];
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
        lastToken._textRange.lastIndex = token._textRange.lastIndex;
      } else {
        concatenated.push({ ...token });
      }
    }
  }
  return concatenated;
}

const TokenType = {
  Character: 'Character',
  Repeat: 'Repeat',
} as const;
type TokenType = typeof TokenType[keyof typeof TokenType];

type Token = {
  type: TokenType,
  value: any,
  repeat?: any,
  _textRange: {
    firstIndex: number,
    lastIndex: number,
  }
};

function isRepeatable(token: Token): boolean {
  return token.type === TokenType.Character;
}
