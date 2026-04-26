/**
 * TVMaze → domain mappers.
 *
 * Pure, deterministic translation between raw TVMaze shapes and the app's
 * domain types. Together with `shows-api.ts`, the only files allowed to
 * import from both `shared/api/` and `shared/types/`.
 */

import type {
  TvMazeCastMember,
  TvMazeShow,
  TvMazeShowImage,
  TvMazeShowStatus,
  TvMazeShowWithEmbeds,
} from './tvmaze-types'
import type { CastMember, ShowDetails, ShowGalleryImage, ShowImage, ShowStatus, ShowSummary } from '@/shared/types/show'
import { stripHtml } from '@/shared/utils/strip-html'

export function mapShowSummary(api: TvMazeShow): ShowSummary {
  const summaryHtml = api.summary ?? ''
  return {
    id: api.id,
    name: api.name,
    genres: [...api.genres],
    rating: api.rating.average,
    summaryHtml,
    summaryText: stripHtml(summaryHtml),
    image: mapImage(api.image),
    premieredYear: parseYear(api.premiered),
    status: mapStatus(api.status),
    language: api.language,
    network: api.network?.name ?? api.webChannel?.name ?? null,
  }
}

export function mapShowDetails(api: TvMazeShowWithEmbeds): ShowDetails {
  return {
    ...mapShowSummary(api),
    officialSite: api.officialSite,
    schedule: { time: api.schedule.time, days: [...api.schedule.days] },
    cast: (api._embedded?.cast ?? []).map(mapCastMember),
    images: (api._embedded?.images ?? []).map(mapGalleryImage),
  }
}

/**
 * Unknown statuses default to `'upcoming'` — the least claim-y label,
 * chosen so future API drift cannot silently mark an unaired show as ended.
 */
export function mapStatus(status: TvMazeShowStatus): ShowStatus {
  switch (status) {
    case 'Running':
      return 'running'
    case 'Ended':
      return 'ended'
    case 'To Be Determined':
    case 'In Development':
      return 'upcoming'
    default:
      return 'upcoming'
  }
}

function parseYear(premiered: string | null): number | null {
  if (!premiered) return null
  const year = Number(premiered.slice(0, 4))
  return Number.isFinite(year) ? year : null
}

function mapImage(image: TvMazeShow['image']): ShowImage | null {
  if (!image) return null
  return { medium: image.medium, original: image.original }
}

function mapCastMember(member: TvMazeCastMember): CastMember {
  return {
    personId: member.person.id,
    personName: member.person.name,
    personImage: mapImage(member.person.image),
    characterId: member.character.id,
    characterName: member.character.name,
    voice: member.voice,
    self: member.self,
  }
}

function mapGalleryImage(image: TvMazeShowImage): ShowGalleryImage {
  return {
    id: image.id,
    type: image.type,
    main: image.main,
    original: image.resolutions.original,
    medium: image.resolutions.medium ?? null,
  }
}
