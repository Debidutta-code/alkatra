import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Percent } from 'lucide-react';

export function FeaturedOffers() {
  const offers = [
    {
      title: 'Summer Special',
      description: 'Up to 50% off on Hotel Bookings',
      validTill: '2h 45m',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Flight Deal',
      description: 'Flat ₹2000 Cashback on Flights',
      validTill: '5h 30m',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Weekend Getaway',
      description: 'Book Now Pay Later on Select Hotels',
      validTill: '3h 15m',
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800&auto=format&fit=crop',
    },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Featured Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={offer.image}
                alt={offer.title}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <Badge className="mb-2" variant="secondary">
                  <Percent className="w-4 h-4 mr-1" />
                  Limited Time
                </Badge>
                <h3 className="text-xl font-semibold mb-2">{offer.title}</h3>
                <p className="text-gray-600 mb-4">{offer.description}</p>
                <div className="flex items-center text-orange-600">
                  <Timer className="w-4 h-4 mr-1" />
                  <span className="text-sm">Ends in {offer.validTill}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}