/**
 * TVMaze API mock data for E2E tests.
 */

export const SHOW_ID = 1
export const PERSON_ID = 100
export const TVMAZE_API_URL = 'https://api.tvmaze.com'

export const fakeShow = {
  id: SHOW_ID,
  url: `https://www.tvmaze.com/shows/${SHOW_ID}/breaking-bad`,
  name: 'Breaking Bad',
  type: 'Scripted',
  language: 'English',
  genres: ['Drama', 'Crime'],
  status: 'Ended',
  runtime: 60,
  averageRuntime: 60,
  premiered: '2008-01-20',
  ended: '2013-09-29',
  officialSite: 'https://www.amc.com/shows/breaking-bad',
  schedule: { time: '22:00', days: ['Sunday'] },
  rating: { average: 9.3 },
  weight: 99,
  network: {
    id: 20,
    name: 'AMC',
    country: { name: 'United States', code: 'US', timezone: 'America/New_York' },
    officialSite: null,
  },
  webChannel: null,
  dvdCountry: null,
  externals: { tvrage: null, thetvdb: null, imdb: 'tt0903747' },
  image: {
    medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/0/2.jpg',
    original: 'https://static.tvmaze.com/uploads/images/original_untouched/0/2.jpg',
  },
  summary: '<p>A high school chemistry teacher turned drug lord.</p>',
  updated: 1704067200,
  _links: { self: { href: `https://api.tvmaze.com/shows/${SHOW_ID}` } },
}

export const fakePerson = {
  id: PERSON_ID,
  url: `https://www.tvmaze.com/people/${PERSON_ID}/bryan-cranston`,
  name: 'Bryan Cranston',
  country: { name: 'United States', code: 'US', timezone: 'America/New_York' },
  birthday: '1956-03-07',
  deathday: null,
  gender: 'Male',
  image: {
    medium: 'https://static.tvmaze.com/uploads/images/medium_portrait/1/3.jpg',
    original: 'https://static.tvmaze.com/uploads/images/original_untouched/1/3.jpg',
  },
  updated: 1704067200,
  _links: { self: { href: `https://api.tvmaze.com/people/${PERSON_ID}` } },
}

export const fakeCastMember = {
  person: fakePerson,
  character: {
    id: 200,
    url: 'https://www.tvmaze.com/characters/200/walter-white',
    name: 'Walter White',
    image: null,
    _links: { self: { href: 'https://api.tvmaze.com/characters/200' } },
  },
  self: false,
  voice: false,
}

/** Show with embedded cast — returned by /shows/:id?embed[]=cast&embed[]=episodes */
export const fakeShowWithEmbeds = {
  ...fakeShow,
  _embedded: {
    cast: [fakeCastMember],
  },
}

/** Envelope returned by /search/shows?q=... */
export const fakeSearchResult = {
  score: 0.9,
  show: fakeShow,
}

/** Credit entry returned by /people/:id/castcredits?embed=show */
export const fakeCastCredit = {
  self: false,
  voice: false,
  _links: {
    show: { href: `https://api.tvmaze.com/shows/${SHOW_ID}` },
    character: { href: 'https://api.tvmaze.com/characters/200' },
  },
  _embedded: { show: fakeShow },
}
