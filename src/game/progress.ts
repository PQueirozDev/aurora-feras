// Ajudas de progresso: objetivo atual da história e onde encontrar cada fera.
import { S } from './state';
import { MAPS } from '../data/maps';
import { SPECIES } from '../data/species';
import { fmt } from '../scenes/dialog';
import { L } from '../i18n';

const PASSOS: [string, string, string][] = [
  ['inicial', 'Tente sair da Vila Orvalho pelo norte. O Prof. Ipê tem algo para você.', 'Try leaving Vila Orvalho to the north. Prof. Ipê has something for you.'],
  ['insignia_rocha', 'Siga pela Rota 1 até a Cidade Ventania e vença a líder Bruna, do tipo PEDRA.', 'Follow Route 1 to Cidade Ventania and defeat Leader Bruna, a ROCK user.'],
  ['armazem_limpo', 'Atravesse a Rota 2 e o Bosque Sussurro até o Porto Maré e investigue o armazém da Equipe Eclipse.', 'Cross Route 2 and the Whisper Woods to Porto Maré and investigate Team Eclipse\'s warehouse.'],
  ['insignia_mare', 'Desafie a líder Marina, do tipo ÁGUA, no ginásio do Porto Maré.', 'Challenge Leader Marina, a WATER user, at the Porto Maré gym.'],
  ['insignia_volt', 'Vá para o norte pela Rota 3, atravesse a Caverna Brasa e vença Raí, do tipo ELÉTRICO, na Cidade Faísca.', 'Head north on Route 3, cross the Ember Cave and defeat Raí, an ELECTRIC user, in Cidade Faísca.'],
  ['usina_limpa', 'Expulse a Equipe Eclipse da usina da Cidade Faísca.', 'Drive Team Eclipse out of the Cidade Faísca power plant.'],
  ['insignia_bruma', 'Siga pela Rota 4 até a Vila Neblina e vença a líder Selene, do tipo FANTASMA.', 'Follow Route 4 to Vila Neblina and defeat Leader Selene, a GHOST user.'],
  ['campeao', 'Atravesse a Estrada da Vitória, ao norte da Vila Neblina, e desafie a Liga Aurora.', 'Cross Victory Road, north of Vila Neblina, and challenge the Aurora League.'],
  ['aurorix_fim', 'Você é o campeão! Investigue a caverna no canto noroeste da Vila Neblina.', 'You are the champion! Investigate the cave in the northwest corner of Vila Neblina.'],
];

export function objetivoAtual(): string {
  for (const [flag, pt, en] of PASSOS) if (!S.flags[flag]) return L(pt, en);
  const n = Object.keys(SPECIES).length;
  return L(`Complete a Feradex: ${S.capturados.length} de ${n} feras capturadas.`, `Complete the Beastdex: ${S.capturados.length} of ${n} beasts caught.`);
}

/** lugares onde a fera aparece na natureza, ou como obtê-la */
export function ondeEncontrar(key: string): string {
  const lugares = new Set<string>();
  for (const m of Object.values(MAPS)) {
    if (m.encontros?.lista.some((e) => e[0] === key)) lugares.add(fmt(m.nome));
  }
  const nomes = [...lugares].map((n) => n.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()));
  if (nomes.length) return 'Habitat: ' + nomes.join(', ');
  const anterior = Object.entries(SPECIES).find(([, s]) => s.evolui?.para === key);
  if (anterior) return L(`Evolui de ${anterior[1].nome} no nível ${anterior[1].evolui!.nivel}`, `Evolves from ${anterior[1].nome} at level ${anterior[1].evolui!.nivel}`);
  if (SPECIES[key].lendario) return L('Habitat: desconhecido', 'Habitat: unknown');
  if (['brasilho', 'pingolim', 'folhito'].includes(key)) return L('Fera inicial do Prof. Ipê', 'Prof. Ipê\'s starter beast');
  return L('Habitat: raro, dizem que é dada de presente', 'Habitat: rare, said to be given as a gift');
}
