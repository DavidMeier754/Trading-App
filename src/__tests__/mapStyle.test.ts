import { getMapStyle, isMapStyle, setMapStyle, subscribeMapStyle } from '../home/mapStyle';

describe("the map's two styles (docs/ui/10-path-map.md §7.1)", () => {
  it('starts on the chapter cards and switches to the switcher and back', () => {
    expect(getMapStyle()).toBe('cards');
    const heard: string[] = [];
    const stop = subscribeMapStyle(() => heard.push(getMapStyle()));
    setMapStyle('switcher');
    setMapStyle('switcher');
    setMapStyle('cards');
    stop();
    expect(heard).toEqual(['switcher', 'cards']);
  });

  it('knows its two names and nothing else', () => {
    expect(isMapStyle('cards')).toBe(true);
    expect(isMapStyle('switcher')).toBe(true);
    expect(isMapStyle('tabs')).toBe(false);
    expect(isMapStyle(undefined)).toBe(false);
  });
});
