export type { Property } from './domain/property'
export {
  listProperties,
  propertiesQueryKey,
} from './infrastructure/properties-repository'
export { usePropertiesQuery } from './application/use-properties-query'
export { PropertiesPage } from './presentation/properties-page'
