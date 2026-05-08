// Setores e preços de ingresso por estádio.
// Os dados de TIME/PARTIDA/CAPACIDADE/IMAGEM/COORDENADAS vêm da API.
// Setores são dados de UI específicos da app (preços, capacidade
// por categoria) — ficam estáticos aqui porque não há nem demanda
// nem schema no banco para variações por estádio em runtime.

export interface Sector {
  id: string;
  name: string;
  price: number;
  capacity: number;
  description: string;
}

// Lookup principal: por ID do estádio no DB (id INT do Azure SQL).
// Mantemos um fallback genérico caso um estádio recém-cadastrado pelo
// admin não tenha entrada aqui (preços padronizados).
const SECTORS_BY_ID: Record<number, Sector[]> = {
  // 1 — MetLife Stadium (final)
  1: [
    { id: 'vip',  name: 'VIP Premium',  price: 2500, capacity: 5000,  description: 'Assentos premium com vista privilegiada, lounge exclusivo e serviço de alimentação incluso.' },
    { id: 'cat1', name: 'Categoria 1',  price: 1200, capacity: 25000, description: 'Assentos nas áreas centrais do estádio com excelente visibilidade do campo.' },
    { id: 'cat2', name: 'Categoria 2',  price: 600,  capacity: 52500, description: 'Assentos nas áreas laterais e superiores, ótimo custo-benefício.' },
  ],
  // 2 — AT&T Stadium
  2: [
    { id: 'vip',  name: 'VIP Premium',  price: 2200, capacity: 4500,  description: 'Suítes privativas com catering exclusivo e acesso ao campo pré-jogo.' },
    { id: 'cat1', name: 'Categoria 1',  price: 1000, capacity: 22000, description: 'Vista central com cobertura do telão gigante.' },
    { id: 'cat2', name: 'Categoria 2',  price: 500,  capacity: 53500, description: 'Setores superiores com visão panorâmica.' },
  ],
  // 3 — SoFi Stadium
  3: [
    { id: 'vip',  name: 'VIP Premium',  price: 2800, capacity: 4000,  description: 'Experiência ultra-premium com champagne, buffet gourmet e meet & greet.' },
    { id: 'cat1', name: 'Categoria 1',  price: 1400, capacity: 20000, description: 'Assentos centrais com acesso a áreas exclusivas.' },
    { id: 'cat2', name: 'Categoria 2',  price: 700,  capacity: 46240, description: 'Ampla visibilidade em setores elevados.' },
  ],
  // 4 — Rose Bowl (legacy)
  4: [
    { id: 'vip',  name: 'VIP Premium',  price: 1500, capacity: 3000,  description: 'Setor histórico com vista privilegiada.' },
    { id: 'cat1', name: 'Categoria 1',  price: 700,  capacity: 15000, description: 'Setores centrais.' },
    { id: 'cat2', name: 'Categoria 2',  price: 350,  capacity: 50000, description: 'Arquibancadas tradicionais.' },
  ],
  // 5 — Lumen Field
  5: [
    { id: 'vip',  name: 'VIP Premium',  price: 1750, capacity: 3600,  description: 'Vista para o Monte Rainier e Puget Sound.' },
    { id: 'cat1', name: 'Categoria 1',  price: 800,  capacity: 18500, description: 'Setores cobertos com excelente visibilidade.' },
    { id: 'cat2', name: 'Categoria 2',  price: 360,  capacity: 46640, description: 'Arquibancadas abertas com vista panorâmica.' },
  ],
  // 6 — Estadio Azteca
  6: [
    { id: 'vip',  name: 'VIP Premium',  price: 1600, capacity: 5000,  description: 'Palcos históricos com serviço de luxo mexicano.' },
    { id: 'cat1', name: 'Categoria 1',  price: 700,  capacity: 25000, description: 'Setores centrais com vista para o gramado sagrado.' },
    { id: 'cat2', name: 'Categoria 2',  price: 300,  capacity: 57523, description: 'Arquibancadas vibrantes com a paixão mexicana.' },
  ],
  // 7 — Estadio BBVA
  7: [
    { id: 'vip',  name: 'VIP Premium',  price: 1400, capacity: 3000,  description: 'Suítes com vista para as montanhas de Monterrey.' },
    { id: 'cat1', name: 'Categoria 1',  price: 650,  capacity: 15000, description: 'Assentos premium com cobertura total.' },
    { id: 'cat2', name: 'Categoria 2',  price: 280,  capacity: 35500, description: 'Setores abertos com ambiente festivo.' },
  ],
  // 8 — BC Place
  8: [
    { id: 'vip',  name: 'VIP Premium',  price: 1800, capacity: 3200,  description: 'Lounges com vista para as North Shore Mountains.' },
    { id: 'cat1', name: 'Categoria 1',  price: 850,  capacity: 16000, description: 'Assentos centrais sob o teto retrátil.' },
    { id: 'cat2', name: 'Categoria 2',  price: 400,  capacity: 35300, description: 'Setores com ambiente multicultural de Vancouver.' },
  ],
  // 9 — BMO Field
  9: [
    { id: 'vip',  name: 'VIP Premium',  price: 1700, capacity: 2800,  description: 'Vista para o skyline de Toronto e CN Tower.' },
    { id: 'cat1', name: 'Categoria 1',  price: 820,  capacity: 13000, description: 'Setores premium com aquecimento.' },
    { id: 'cat2', name: 'Categoria 2',  price: 380,  capacity: 29700, description: 'Arquibancadas ao ar livre estilo europeu.' },
  ],
  // 10+ — novos estádios FIFA 2026 (Story 0.9): Mercedes/Gillette/Hard Rock/Lincoln/NRG/Arrowhead/Levi's/Akron
  // Os IDs reais saem da migration; usamos defaults pelas faixas comuns por capacidade
};

const DEFAULT_SECTORS: Sector[] = [
  { id: 'vip',  name: 'VIP Premium',  price: 1800, capacity: 4000,  description: 'Suítes premium com serviço exclusivo e vista privilegiada.' },
  { id: 'cat1', name: 'Categoria 1',  price: 850,  capacity: 18000, description: 'Setores centrais com excelente visibilidade do gramado.' },
  { id: 'cat2', name: 'Categoria 2',  price: 400,  capacity: 40000, description: 'Setores tradicionais com ambiente de torcida.' },
];

export function getSectorsByStadiumId(id: number): Sector[] {
  return SECTORS_BY_ID[id] || DEFAULT_SECTORS;
}

export function getStadiumStartingPrice(id: number): number {
  const sectors = getSectorsByStadiumId(id);
  return sectors[2]?.price || sectors[sectors.length - 1]?.price || 300;
}
