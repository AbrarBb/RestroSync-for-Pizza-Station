
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-[url('/hero-bg.jpg')] bg-cover bg-center py-20 text-white relative">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Pizza Station Management System
            </h1>
            <p className="text-xl mb-8">
              The complete restaurant management solution for your pizzeria
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="font-semibold">
                <Link to="/login">Staff Login <ArrowRight className="ml-2" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/10 font-semibold">
                <Link to="/menu">Order Online</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="bg-white/10 font-semibold">
                <Link to="/reservations">Book a Table</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Online Ordering"
              description="Browse our menu and order your favorite pizza online for pickup or delivery."
              icon="🍕"
            />
            <FeatureCard 
              title="Table Reservations"
              description="Reserve your table in advance and skip the wait when you arrive."
              icon="🪑"
            />
            <FeatureCard 
              title="Loyalty Rewards"
              description="Earn points with every order and redeem them for free items and discounts."
              icon="🎁"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <img 
                src="/placeholder.svg" 
                alt="Pizza Station Restaurant" 
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h2 className="text-3xl font-bold mb-4">About Pizza Station</h2>
              <p className="mb-4">
                Founded in 2010, Pizza Station has been serving the community with authentic Italian pizzas made from fresh ingredients. 
                Our commitment to quality and customer satisfaction has made us a favorite among pizza lovers.
              </p>
              <p>
                With our new management system, we're taking your pizza experience to the next level - whether you're dining in, 
                taking out, or managing our restaurant operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Pizza Station</h3>
              <p>Your favorite pizza destination with the best management system in town.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p>123 Pizza Street</p>
              <p>Flavor City, FC 12345</p>
              <p>Phone: (555) 123-4567</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Hours</h3>
              <p>Monday - Thursday: 11am - 10pm</p>
              <p>Friday - Saturday: 11am - 11pm</p>
              <p>Sunday: 12pm - 9pm</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-4 text-center">
            <p>&copy; 2025 Pizza Station. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ title, description, icon }: { title: string; description: string; icon: string }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Index;
