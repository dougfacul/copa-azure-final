import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Users, Calendar, ArrowRight, Wrench, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

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

type CountryFilter = 'all' | 'usa' | 'mex' | 'can';

const countryLabels: Record<CountryFilter, string> = {
  all: 'Todos',
  usa: '🇺🇸 Estados Unidos',
  mex: '🇲🇽 México',
  can: '🇨🇦 Canadá',
};

function matchesCountryFilter(country: string, filter: CountryFilter): boolean {
  if (filter === 'all') return true;
  const c = country.toLowerCase();
  if (filter === 'usa') return c.includes('estados') || c.includes('united');
  if (filter === 'mex') return c.includes('méxico') || c.includes('mexico');
  if (filter === 'can') return c.includes('canad');
  return true;
}

const Stadiums: React.FC = () => {
  const [countryFilter, setCountryFilter] = useState<CountryFilter>('all');

  const { data: stadiumsData, isLoading } = useQuery({
    queryKey: ['stadiums'],
    queryFn: () => api.getStadiums(),
  });

  const allStadiums: ApiStadium[] = stadiumsData?.data?.stadiums || [];
  // Esconde Rose Bowl (legacy) da listagem pública mas mantém no DB para FK
  const stadiums = allStadiums.filter((s) => !s.name.toLowerCase().includes('legacy'));
  const filteredStadiums = stadiums.filter((s) => matchesCountryFilter(s.country, countryFilter));

  const totalCapacity = filteredStadiums.reduce((acc, s) => acc + s.capacity, 0);

  if (isLoading) {
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
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-6xl mb-4">
            <span className="gold-text">Estádios</span> da Copa
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            16 estádios incríveis nos Estados Unidos, México e Canadá recebendo os melhores jogos
            de futebol do mundo.
          </p>
        </div>

        {/* Country Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(Object.keys(countryLabels) as CountryFilter[]).map((country) => (
            <Button
              key={country}
              variant={countryFilter === country ? 'default' : 'outline'}
              onClick={() => setCountryFilter(country)}
              className={countryFilter === country ? 'gold-gradient' : ''}
            >
              {countryLabels[country]}
            </Button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12 p-6 rounded-2xl glass-card">
          <div className="text-center">
            <div className="font-display text-3xl md:text-4xl gold-text">
              {filteredStadiums.length}
            </div>
            <div className="text-sm text-muted-foreground">Estádios</div>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl md:text-4xl gold-text">
              {(totalCapacity / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-muted-foreground">Capacidade Total</div>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl md:text-4xl gold-text">104</div>
            <div className="text-sm text-muted-foreground">Jogos da Copa</div>
          </div>
        </div>

        {/* Stadiums Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStadiums.map((stadium, index) => (
            <Link
              key={stadium.id}
              to={`/stadiums/${stadium.id}`}
              className="group relative rounded-2xl overflow-hidden bg-card border border-border transition-all duration-300 hover:border-primary/50 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-secondary/40">
                {stadium.image ? (
                  <img
                    src={stadium.image}
                    alt={stadium.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    🏟️
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                {/* Country Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full glass-card text-sm font-medium">
                  {stadium.country.toLowerCase().includes('estados')
                    ? '🇺🇸'
                    : stadium.country.toLowerCase().includes('méx')
                    ? '🇲🇽'
                    : '🇨🇦'}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-display text-xl mb-1 group-hover:text-primary transition-colors">
                  {stadium.name}
                </h3>

                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" />
                  {stadium.city}
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-1" title="Capacidade">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-medium">{(stadium.capacity / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex items-center gap-1" title="Inauguração">
                    <Wrench className="w-4 h-4 text-primary" />
                    <span className="font-medium">{stadium.inauguration_year ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end" title="País">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium text-xs truncate">{stadium.country}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-end">
                  <span className="flex items-center gap-1 text-sm text-primary font-medium">
                    Ver detalhes
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stadiums;
