export { ZoneCosecha } from './ZoneCosecha';
export { ZoneSeleccion } from './ZoneSeleccion';
export { ZonePacking } from './ZonePacking';
export { ZoneFrio } from './ZoneFrio';
export { ZoneEmbarque } from './ZoneEmbarque';
export { ZoneTransito } from './ZoneTransito';
export { ZoneLlegada } from './ZoneLlegada';

import { ZoneCosecha } from './ZoneCosecha';
import { ZoneSeleccion } from './ZoneSeleccion';
import { ZonePacking } from './ZonePacking';
import { ZoneFrio } from './ZoneFrio';
import { ZoneEmbarque } from './ZoneEmbarque';
import { ZoneTransito } from './ZoneTransito';
import { ZoneLlegada } from './ZoneLlegada';

import type { PipelineZone } from '@/lib/types';

export type AnyZone =
  | ZoneCosecha
  | ZoneSeleccion
  | ZonePacking
  | ZoneFrio
  | ZoneEmbarque
  | ZoneTransito
  | ZoneLlegada;

export const ZONE_CLASS_MAP: Record<
  PipelineZone,
  new (...args: ConstructorParameters<typeof ZoneCosecha>) => AnyZone
> = {
  cosecha: ZoneCosecha,
  seleccion: ZoneSeleccion,
  packing: ZonePacking,
  frio: ZoneFrio,
  embarque: ZoneEmbarque,
  transito: ZoneTransito,
  llegada: ZoneLlegada,
};
