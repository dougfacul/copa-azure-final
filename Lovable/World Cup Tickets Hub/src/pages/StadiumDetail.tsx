import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin, Users, Calendar, ArrowLeft, Ticket, ExternalLink, Wrench, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { getSectorsByStadiumId } from '@/lib/stadium-sectors';

interface ApiStadium {
  id: number;
  name: string;
  city: string;
  country: string;
  capacity: number;
  image: string | null;
  description: string | null;
  inauguration_year: number | null;
  latitude: number | null;
  longitude: number | null;
}

interface ApiStadiumMatch {
  id: number;
  date: string;
  time: string;
  stage: string;
  group_name: string | null;
  home_team_name: string | null;
  home_team_flag: string | null;
  away_team_name: string | null;
  away_team_flag: string | null;
}

const STAGE_LABELS: Record<string, string> = {
  'Fase de Grupos': 'Fase de Grupos',
  group: 'Fase de Grupos',
  round_of_32: '32 avos de Final',
  round_of_16: 'Oitavas de Final',
  quarter_final: 'Quartas de Final',
  semi_final: 'Semifinal',
  third_place: 'Disputa 3º Lugar',
  final: 'Final',
};

function formatDateBR(dateIso: string): string {
  if (!dateIso) return '-';
  const d = new Date(dateIso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const StadiumDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: stadiumData, isLoading: loadingStadium } = useQuery({
    queryKey: ['stadium', id],
    queryFn: () => api.getStadium(id!),
    enabled: !!id,
  });

  const { data: matchesData } = useQuery({
    queryKey: ['stadium-matches', id],
    queryFn: () => api.getStadiumMatches(id!),
    enabled: !!id,
  });

  const stadium: ApiStadium | undefined = stadiumData?.data?.stadium;
  const matches: ApiStadiumMatch[] = matchesData?.data?.matches || [];
  const sectors = stadium ? getSectorsByStadiumId(stadium.id) : [];

  if (loadingStadium) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stadium) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl mb-4">Estádio não encontrado</h1>
          <Link to="/stadiums">
            <Button>Voltar para estádios</Button>
          </Link>
        </div>
      </div>
    );
  }

  const lat = Number(stadium.latitude);
  const lng = Number(stadium.longitude);
  const hasCoords = !Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px]">
        {stadium.image ? (
          <img src={stadium.image} alt={stadium.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-secondary/40 flex items-center justify-center text-7xl">🏟️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        <Link to="/stadiums" className="absolute top-24 left-4 md:left-8">
          <Button variant="outline" className="glass-card">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-4xl">
                {stadium.country.toLowerCase().includes('estados')
                  ? '🇺🇸'
                  : stadium.country.toLowerCase().includes('méx')
                  ? '🇲🇽'
                  : '🇨🇦'}
              </span>
              <span className="px-3 py-1 rounded-full glass-card text-sm">{stadium.country}</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl mb-2">{stadium.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-5 h-5" />
              <span>{stadium.city}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sobre o estádio */}
            <div className="rounded-2xl bg-card border border-border p-6">
              <h2 className="font-display text-2xl mb-4">Sobre o Estádio</h2>
              {stadium.description && (
                <p className="text-muted-foreground mb-6 leading-relaxed">{stadium.description}</p>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <Users className="w-5 h-5 text-primary mb-2" />
                  <span className="text-2xl font-bold">{stadium.capacity.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground block">Capacidade</span>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50">
                  <Wrench className="w-5 h-5 text-primary mb-2" />
                  <span className="text-2xl font-bold">{stadium.inauguration_year ?? '—'}</span>
                  <span className="text-sm text-muted-foreground block">Inauguração</span>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50">
                  <Calendar className="w-5 h-5 text-primary mb-2" />
                  <span className="text-2xl font-bold">{matches.length}</span>
                  <span className="text-sm text-muted-foreground block">Jogos na Copa</span>
                </div>
              </div>
            </div>

            {/* Setores e preços */}
            <div className="rounded-2xl bg-card border border-border p-6">
              <h2 className="font-display text-2xl mb-6">Setores e Preços</h2>
              <div className="space-y-4">
                {sectors.map((sector) => (
                  <div
                    key={sector.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{sector.name}</h3>
                      <p className="text-sm text-muted-foreground">{sector.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-2xl font-bold text-primary">${sector.price}</span>
                      <span className="text-sm text-muted-foreground block">
                        {sector.capacity.toLocaleString()} lugares
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Jogos neste estádio */}
            <div>
              <h2 className="font-display text-2xl mb-6">Jogos neste Estádio</h2>
              {matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <Link
                      key={match.id}
                      to={`/matches/${match.id}`}
                      className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {match.home_team_flag?.startsWith('http') ? (
                            <img
                              src={match.home_team_flag}
                              alt={match.home_team_name || ''}
                              className="w-8 h-5 object-cover rounded"
                            />
                          ) : (
                            <span className="text-2xl">🏳️</span>
                          )}
                          <span className="font-medium hidden sm:inline">
                            {match.home_team_name || 'TBD'}
                          </span>
                        </div>
                        <span className="text-muted-foreground">vs</span>
                        <div className="flex items-center gap-2">
                          {match.away_team_flag?.startsWith('http') ? (
                            <img
                              src={match.away_team_flag}
                              alt={match.away_team_name || ''}
                              className="w-8 h-5 object-cover rounded"
                            />
                          ) : (
                            <span className="text-2xl">🏳️</span>
                          )}
                          <span className="font-medium hidden sm:inline">
                            {match.away_team_name || 'TBD'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">
                          {STAGE_LABELS[match.stage] || match.stage}
                        </span>
                        <span className="text-sm">
                          {formatDateBR(match.date)} · {match.time}
                        </span>
                      </div>

                      <Button size="sm" className="gold-gradient hidden sm:flex">
                        <Ticket className="w-4 h-4 mr-1" />
                        Comprar
                      </Button>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  Nenhum jogo cadastrado para este estádio.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mini-mapa */}
            <div className="rounded-2xl bg-card border border-border p-6">
              <h3 className="font-display text-lg mb-4">Localização</h3>
              {hasCoords ? (
                <>
                  <div className="aspect-square rounded-xl overflow-hidden border border-border/50 relative">
                    <iframe
                      title={`Mapa de ${stadium.name}`}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                        lng - 0.012
                      }%2C${lat - 0.008}%2C${lng + 0.012}%2C${
                        lat + 0.008
                      }&layer=mapnik&marker=${lat}%2C${lng}`}
                      className="w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground text-center font-mono">
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <a
                      href={`https://www.google.com/maps?q=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir no Google Maps
                    </a>
                  </Button>
                </>
              ) : (
                <div className="aspect-square rounded-xl bg-secondary/40 flex items-center justify-center text-sm text-muted-foreground p-4 text-center">
                  Coordenadas não cadastradas para este estádio.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StadiumDetail;
