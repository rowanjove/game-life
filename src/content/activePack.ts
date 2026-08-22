import type { CreationContent, NarrativeContent } from './packTypes'
import { BASE_CREATION } from '../data/packDefaults/creation'
import { BASE_NARRATIVE } from '../data/packDefaults/narrative'

let creation: CreationContent = BASE_CREATION
let narrative: NarrativeContent = BASE_NARRATIVE

export function getCreationContent(): CreationContent {
  return creation
}

export function getNarrativeContent(): NarrativeContent {
  return narrative
}

export function setCreationContent(next: CreationContent | undefined): void {
  creation = next ?? BASE_CREATION
}

export function setNarrativeContent(next: NarrativeContent | undefined): void {
  narrative = next ?? BASE_NARRATIVE
}

export function resetPackModules(): void {
  creation = BASE_CREATION
  narrative = BASE_NARRATIVE
}

export function formatTemplate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''))
}
