import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface ApiStadium {
  id: number;
  name: string;
  city: string;
  country: string;
  capacity: number;
  image: string | null;
}

const StadiumsPreview: React.FC = () => {
  const { data } = useQuery({
    queryKey: ['stadiums'],
    queryFn: () => api.getStadiums(),
  });

  const allStadiums: ApiStadium[] = data?.data?.stadiums || [];
  const featured = allStadiums
    .filter((s) => !s.name.toLowerCase().includes('legacy'))
    .slice(0, 4);

  if (featured.length === 0) return null;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
          <div>
            <span className="text-primary text-sm font-medium uppercase tracking-wider">
              Onde tudo acontece
            </span>
            <h2 className="font-display text-4xl md:text-5xl mt-2">Estádios Icônicos</h2>
          </div>
          <Link to="/stadiums">
            <Button variant="outline" className="group">
              Ver todos os estádios
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((stadium, index) => {
            const flagEmoji = stadium.country.toLowerCase().includes('estados')
              ? '🇺🇸'
              : stadium.country.toLowerCase().includes('méx')
              ? '🇲🇽'
              : '🇨🇦';

            return (
              <Link
                key={stadium.id}
                to={`/stadiums/${stadium.id}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {stadium.image ? (
                  <img
                    src={stadium.image}
                    alt={stadium.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-secondary/40 flex items-center justify-center text-6xl">
                    🏟️
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

                <div className="absolute top-4 right-4 px-3 py-1 rounded-full glass-card text-xs font-medium">
                  {flagEmoji}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display text-xl mb-1 group-hover:text-primary transition-colors">
                    {stadium.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    {stadium.city}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-foreground font-medium">{stadium.capacity.toLocaleString()}</span>
                    <span className="text-muted-foreground">lugares</span>
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

export default StadiumsPreview;
