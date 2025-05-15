import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Coffee, Ban } from 'lucide-react';

export function PopularHotels() {
  const hotels = [
    {
      name: 'Grand Plaza Hotel',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
      rating: 4.8,
      price: '₹8,999',
      features: ['Free Cancellation', 'Breakfast Included'],
    },
    {
      name: 'Sunset Beach Resort',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop',
      rating: 4.5,
      price: '₹12,499',
      features: ['Free Cancellation', 'Breakfast Included'],
    },
    {
      name: 'Mountain View Lodge',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop',
      rating: 4.7,
      price: '₹7,499',
      features: ['Free Cancellation', 'Breakfast Included'],
    },
    {
      name: 'City Lights Hotel',
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800&auto=format&fit=crop',
      rating: 4.6,
      price: '₹9,999',
      features: ['Free Cancellation', 'Breakfast Included'],
    },
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Popular Hotels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotels.map((hotel, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={hotel.image}
                alt={hotel.name}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold mb-2">{hotel.name}</h3>
                <div className="flex items-center mb-2">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="font-medium">{hotel.rating}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="flex items-center">
                    <Ban className="w-3 h-3 mr-1" />
                    Free Cancellation
                  </Badge>
                  <Badge variant="outline" className="flex items-center">
                    <Coffee className="w-3 h-3 mr-1" />
                    Breakfast
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500">Starting from</span>
                    <p className="text-lg font-bold text-blue-600">{hotel.price}</p>
                  </div>
                  <Button variant="outline">Book Now</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}