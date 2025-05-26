'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export function ExploreDestinations() {
  const { t } = useTranslation();

  const destinations = [
    {
      key: 'maldives',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop',
    },
    {
      key: 'swissAlps',
      image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800&auto=format&fit=crop',
    },
    {
      key: 'santorini',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=800&auto=format&fit=crop',
    },
    {
      key: 'dubai',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
    },
    {
      key: 'bali',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop',
    },
    {
      key: 'tokyo',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop',
    },
  ];

  return (
    <section className="py-12 bg-tripswift-off-white font-noto-sans">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-tripswift-bold mb-8 text-tripswift-black">
          {t('HomeSections.ExploreDestinations.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <Card key={index} className="overflow-hidden group cursor-pointer border border-gray-100 rounded-xl shadow-md">
              <div className="relative h-64">
                <img
                  src={destination.image}
                  alt={t(`HomeSections.ExploreDestinations.destinations.${destination.key}.name`)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-tripswift-off-white">
                  <h3 className="text-2xl font-tripswift-bold mb-1">
                    {t(`HomeSections.ExploreDestinations.destinations.${destination.key}.name`)}
                  </h3>
                  <p className="text-sm font-tripswift-medium mb-4">
                    {t(`HomeSections.ExploreDestinations.destinations.${destination.key}.category`)}
                  </p>
                  <button className="btn-tripswift-primary py-2 px-4 rounded-lg text-sm font-tripswift-medium hover:shadow-md transition-all duration-300">
                    {t('HomeSections.ExploreDestinations.exploreNow')}
                  </button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}