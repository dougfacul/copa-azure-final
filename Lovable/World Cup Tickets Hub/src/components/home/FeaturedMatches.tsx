import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, ArrowRight, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamFlag } from '@/components/TeamFlag';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { getStadiumStartingPrice } from '@/lib/stadium-sectors';

interface ApiMatch {
  id: number;
  date: string;
  time: string;
  stage: string;
  group_name: string | null;
  stadium_id: number;
  home_team_name: string | null;
  home_team_flag: string | null;
  away_team_name: string | null;
  away_team_flag: string | null;
  stadium_name: string | null;
  stadium_city: string | null;
}

const STAGE_LABELS: Record<string, string> = {
  'Fase de Grupos': 'Fase de Grupos',
  group: 'Fase de Grupos',
  round_of_32: '32 avos de Final',
  round_of_16: 'Oitavas de Final',
  quarter_final: 'Quartas de Final',
  semi_final: 'Semifinal',
  third_place: '3º Lugar',
  final: 'Final',
};

function formatDateBR(dateIso: string): string {
  if (!dateIso) return '-';
  const d = new Date(dateIso);
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

const FeaturedMatches: React.FC = () => {
  const { data } = useQuery({
    queryKey: ['matches'],
    queryFn: () => api.getMatches(),
  });

  const allMatches: ApiMatch[] = data?.data?.matches || [];

  // Selecionar destaques: final, 1 semi, 1 qf e 3 jogos próximos da fase de grupos.
  const final = allMatches.find((m) => m.stage === 'final');
  const sf = allMatches.find((m) => m.stage === 'semi_final');
  const qf = allMatches.find((m) => m.stage === 'quarter_final');
  const groupMatches = allMatches
    .filter((m) => m.stage === 'Fase de Grupos' || m.stage === 'group')
    .slice(0, 3);

  const featured = [...groupMatches, final, sf, qf].filter(Boolean) as ApiMatch[];

  if (featured.length === 0) return null;

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
          <div>
            <span className="text-primary text-sm font-medium uppercase tracking-wider">Não perca</span>
            <h2 className="font-display text-4xl md:text-5xl mt-2">Jogos em Destaque</h2>
          </div>
          <Link to="/matches">
            <Button variant="outline" className="group">
              Ver todos os jogos
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((match, index) => {
            const isFinal = match.stage === 'final';
            const isSemi = match.stage === 'semi_final';
            const isKnockout = match.stage !== 'Fase de Grupos' && match.stage !== 'group';
            const startingPrice = getStadiumStartingPrice(match.stadium_id);
            const hasTBD = !match.home_team_name || !match.away_team_name;

            return (
              <Link
                key={match.id}
                to={`/matches/${match.id}`}
                className={cn(
                  'group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]',
                  isFinal && 'md:col-span-2 lg:col-span-1'
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-br',
                    isFinal
                      ? 'from-primary/20 via-secondary to-secondary'
                      : 'from-secondary to-secondary/80'
                  )}
                />

                <div
                  className={cn(
                    'absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium',
                    isFinal
                      ? 'bg-primary text-primary-foreground'
                      : isSemi
                      ? 'bg-primary/20 text-primary'
                      : isKnockout
                      ? 'bg-secondary text-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {STAGE_LABELS[match.stage] || match.stage}
                  {match.group_name && ` • Grupo ${match.group_name}`}
                </div>

                <div className="relative p-6 pt-14">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center flex-1">
                      {match.home_team_flag ? (
                        <TeamFlag
                          flag={match.home_team_flag}
                          name={match.home_team_name || ''}
                          size="lg"
                          className="mx-auto mb-2"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl">🏆</span>
                        </div>
                      )}
                      <span className={cn('font-medium text-sm', !match.home_team_name && 'text-muted-foreground')}>
                        {match.home_team_name || 'A definir'}
                      </span>
                    </div>
                    <div className="px-4">
                      <span className="font-display text-2xl text-muted-foreground">VS</span>
                    </div>
                    <div className="text-center flex-1">
                      {match.away_team_flag ? (
                        <TeamFlag
                          flag={match.away_team_flag}
                          name={match.away_team_name || ''}
                          size="lg"
                          className="mx-auto mb-2"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl">🏆</span>
                        </div>
                      )}
                      <span className={cn('font-medium text-sm', !match.away_team_name && 'text-muted-foreground')}>
                        {match.away_team_name || 'A definir'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDateBR(match.date)} • {match.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">
                        {match.stadium_name}
                        {match.stadium_city && `, ${match.stadium_city}`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">A partir de ${startingPrice}</span>
                    <span className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                      <Ticket className="w-4 h-4" />
                      {hasTBD ? 'Ver' : 'Comprar'}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedMatches;
