import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Ticket, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamFlag } from '@/components/TeamFlag';
import api from '@/lib/api';

const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

interface ApiTeam {
  id: number;
  name: string;
  code: string;
  flag: string;
  group_name: string | null;
}

interface ApiMatch {
  id: number;
  date: string;
  group_name: string | null;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  home_team_flag: string;
  away_team_name: string;
  away_team_flag: string;
}

function formatDateBR(dateIso: string): string {
  if (!dateIso) return '-';
  const d = new Date(dateIso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

const Groups: React.FC = () => {
  const { data: teamsData, isLoading: loadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => api.getTeams(),
  });

  const { data: matchesData } = useQuery({
    queryKey: ['matches'],
    queryFn: () => api.getMatches(),
  });

  const allTeams: ApiTeam[] = teamsData?.data?.teams || [];
  const allMatches: ApiMatch[] = matchesData?.data?.matches || [];

  const getTeamsByGroup = (g: string) =>
    allTeams.filter((t) => t.group_name === g);

  const getMatchesByGroup = (g: string) =>
    allMatches.filter((m) => m.group_name === g);

  if (loadingTeams) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl md:text-6xl mb-4">
            <span className="gold-text">Grupos</span> da Copa 2026
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            12 grupos com 4 seleções cada. Os 2 primeiros de cada grupo avançam para a fase eliminatória.
          </p>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {groups.map((group, index) => {
            const teams = getTeamsByGroup(group);
            const matches = getMatchesByGroup(group);
            
            return (
              <div
                key={group}
                className="rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Group Header */}
                <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-display text-2xl text-primary">{group}</span>
                      </div>
                      <div>
                        <h2 className="font-display text-xl">Grupo {group}</h2>
                        <span className="text-xs text-muted-foreground">{matches.length} jogos</span>
                      </div>
                    </div>
                    <Trophy className="w-5 h-5 text-primary/50" />
                  </div>
                </div>

                {/* Teams */}
                <div className="p-4 space-y-3">
                  {teams.map((team, teamIndex) => (
                    <div
                      key={team.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <span className="text-muted-foreground text-sm w-4">{teamIndex + 1}</span>
                      <TeamFlag flag={team.flag} name={team.name} size="md" />
                      <div className="flex-1">
                        <span className="font-medium text-sm">{team.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{team.code}</span>
                    </div>
                  ))}
                </div>

                {/* Matches Preview */}
                {matches.length > 0 && (
                  <div className="border-t border-border p-4">
                    <div className="text-xs text-muted-foreground mb-2">Próximos jogos:</div>
                    <div className="space-y-2">
                      {matches.slice(0, 2).map((match) => (
                        <Link
                          key={match.id}
                          to={`/matches/${match.id}`}
                          className="flex items-center justify-between text-sm hover:text-primary transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <TeamFlag flag={match.home_team_flag} name={match.home_team_name} size="sm" />
                            <span className="text-muted-foreground mx-1">vs</span>
                            <TeamFlag flag={match.away_team_flag} name={match.away_team_name} size="sm" />
                          </div>
                          <span className="text-xs text-muted-foreground">{formatDateBR(match.date)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action */}
                <div className="p-4 pt-0">
                  <Link to={`/matches?group=${group}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Ticket className="w-4 h-4 mr-2" />
                      Ver jogos do grupo
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div className="mt-12 p-6 rounded-xl glass-card text-center">
          <h3 className="font-display text-xl mb-2">Formato da Copa 2026</h3>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            A Copa do Mundo 2026 terá 48 seleções divididas em 12 grupos de 4 equipes cada. 
            Os dois melhores de cada grupo avançam para as oitavas de final, totalizando 24 seleções 
            na fase eliminatória. Serão 104 jogos ao todo, incluindo a final no MetLife Stadium.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Groups;
