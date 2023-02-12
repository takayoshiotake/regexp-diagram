import { RailwayMaker, defaultStyle } from './railway-maker.js';

export function makeDiagramSvg(style = defaultStyle) {
  const mergedStyle = {
    ...defaultStyle,
    ...style,
  };
  const railwayMaker = RailwayMaker(mergedStyle);

  const stations = testStations(railwayMaker);
  // DEBUG
  for (let i = 0; i < stations.length; ++i) {
    stations[i] = railwayMaker.Bounds(stations[i]);
  }

  const routes = [];
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
  const stations = [];
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
