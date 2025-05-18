'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Percent } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function FeaturedOffers() {
  const { t } = useTranslation();

  const offers = [
    {
      key: 'summerSpecial',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop',
    },
    {
      key: 'flightDeal',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop',
    },
    {
      key: 'weekendGetaway',
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800&auto=format&fit=crop',
    },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">{t('HomeSections.FeaturedOffers.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={offer.image}
                alt={t(`HomeSections.FeaturedOffers.${offer.key}.title`)}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <Badge className="mb-2" variant="secondary">
                  <Percent className="w-4 h-4 mr-1" />
                  {t('HomeSections.FeaturedOffers.limitedTime')}
                </Badge>
                <h3 className="text-xl font-semibold mb-2">
                  {t(`HomeSections.FeaturedOffers.${offer.key}.title`)}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t(`HomeSections.FeaturedOffers.${offer.key}.description`)}
                </p>
                <div className="flex items-center text-orange-600">
                  <Timer className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {t('HomeSections.FeaturedOffers.endsIn')} {t(`HomeSections.FeaturedOffers.${offer.key}.validTill`)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}