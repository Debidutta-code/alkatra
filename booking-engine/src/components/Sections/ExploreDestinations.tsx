import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ExploreDestinations() {
  const destinations = [
    {
      name: 'Maldives',
      category: 'Beach Paradise',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Swiss Alps',
      category: 'Adventure',
      image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Santorini',
      category: 'Romantic Getaway',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Dubai',
      category: 'Luxury',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Bali',
      category: 'Cultural',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Tokyo',
      category: 'City Life',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop',
    },
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Explore Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination, index) => (
            <Card key={index} className="overflow-hidden group cursor-pointer">
              <div className="relative h-64">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-1">{destination.name}</h3>
                  <p className="text-sm mb-4">{destination.category}</p>
                  <Button variant="secondary" className="bg-white/20 backdrop-blur-sm hover:bg-white/30">
                    Explore Now
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}