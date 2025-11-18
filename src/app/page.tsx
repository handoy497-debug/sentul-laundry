'use client'

import { useState, useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles,
  Shield,
  Truck,
  Droplets,
  Wind,
  Star,
  ArrowRight,
  Zap,
  Heart,
  Users,
  Phone,
  Mail,
  MapPin,
  Package,
  CheckCircle,
  Percent,
  Clock,
  Tag
} from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const [services, setServices] = useState([])
  const [discounts, setDiscounts] = useState([])
  const [logo, setLogo] = useState(null)
  const [contactInfo, setContactInfo] = useState({
    phone: null,
    contactEmail: null,
    address: null
  })

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    })
    fetchServices()
    fetchDiscounts()
    fetchLogo()
    fetchContactInfo()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchDiscounts = async () => {
    try {
      const response = await fetch('/api/discounts')
      const data = await response.json()
      setDiscounts(data)
    } catch (error) {
      console.error('Error fetching discounts:', error)
    }
  }

  const fetchLogo = async () => {
    try {
      const response = await fetch('/api/logo')
      const data = await response.json()
      setLogo(data.logo)
    } catch (error) {
      console.error('Error fetching logo:', error)
    }
  }

  const fetchContactInfo = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      setContactInfo({
        phone: data.phone,
        contactEmail: data.contactEmail,
        address: data.address
      })
    } catch (error) {
      console.error('Error fetching contact info:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {logo ? (
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm p-1 flex items-center justify-center">
                    <img 
                      src={logo} 
                      alt="Sentul-Laundry Logo" 
                      className="w-10 h-10 object-contain rounded-full"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 opacity-20"></div>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Package className="h-8 w-8 text-teal-600" />
                </div>
              )}
              <span className="text-2xl font-bold text-teal-600">Sentul-Laundry</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-teal-600 transition-colors">Fitur</a>
              <a href="#services" className="text-gray-700 hover:text-teal-600 transition-colors">Layanan</a>
              <a href="#about" className="text-gray-700 hover:text-teal-600 transition-colors">Tentang</a>
              <a href="#contact" className="text-gray-700 hover:text-teal-600 transition-colors">Kontak</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/app">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  Mulai Sekarang
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 text-white pt-16">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div 
              className="inline-flex items-center space-x-4 mb-8"
              data-aos="fade-down"
            >
              {logo ? (
                <div className="relative group">
                  {/* Outer ring with gradient */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 opacity-30 group-hover:opacity-50 transition-opacity duration-300 animate-pulse"></div>
                  
                  {/* Middle ring */}
                  <div className="absolute inset-2 rounded-full bg-white/40 backdrop-blur-sm"></div>
                  
                  {/* Inner container with logo */}
                  <div className="relative w-24 h-24 rounded-full bg-white/60 backdrop-blur-sm p-2 flex items-center justify-center shadow-2xl border-4 border-white/50">
                    <img 
                      src={logo} 
                      alt="Sentul-Laundry Logo" 
                      className="w-20 h-20 object-contain rounded-full"
                    />
                  </div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-60"></div>
                </div>
              ) : (
                <div className="relative group">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 opacity-30 group-hover:opacity-50 transition-opacity duration-300 animate-pulse"></div>
                  <div className="relative w-24 h-24 rounded-full bg-white/60 backdrop-blur-sm p-2 flex items-center justify-center shadow-2xl border-4 border-white/50">
                    <Sparkles className="h-16 w-16 text-yellow-300" />
                  </div>
                </div>
              )}
              <span className="text-4xl md:text-5xl font-bold">Sentul-Laundry</span>
            </div>
            
            <h1 
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Solusi Laundry
              <span className="block text-yellow-300">Profesional & Modern</span>
            </h1>
            
            <p 
              className="text-xl md:text-2xl mb-8 text-teal-100 max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Layanan laundry berkualitas tinggi dengan teknologi modern. 
              Cepat, bersih, dan terpercaya untuk kebutuhan Anda.
            </p>
            
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <Link href="/app">
                <Button 
                  size="lg" 
                  className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-8 py-4 text-lg font-semibold"
                >
                  Pesan Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/app#services">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-teal-600 px-8 py-4 text-lg font-semibold"
                >
                  Lihat Layanan
                </Button>
              </Link>
            </div>
            
            <div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                  <div className="text-3xl font-bold">24 Jam</div>
                  <div className="text-teal-100">Pengerjaan Cepat</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-teal-100">Garansi Kepuasan</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <Users className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                  <div className="text-3xl font-bold">1000+</div>
                  <div className="text-teal-100">Pelanggan Puas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Animation */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Discounts Section */}
      {discounts.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                data-aos="fade-up"
              >
                🎉 Promo Spesial Hari Ini!
              </h2>
              <p 
                className="text-lg text-gray-600 max-w-2xl mx-auto"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                Jangan lewatkan penawaran menarik dari Sentul-Laundry
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discounts.slice(0, 6).map((discount: any, index) => (
                <Card 
                  key={discount.id} 
                  className="hover:shadow-xl transition-all duration-300 border-orange-100 hover:border-orange-300 hover:-translate-y-1 overflow-hidden"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  {/* Banner Image */}
                  {discount.bannerImage && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={discount.bannerImage} 
                        alt={discount.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-red-600 text-white px-3 py-1 text-sm font-bold">
                          <Percent className="h-3 w-3 mr-1" />
                          {discount.discountPercent}% OFF
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className={discount.bannerImage ? 'pb-4' : ''}>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg text-gray-900">{discount.title}</CardTitle>
                      {!discount.bannerImage && (
                        <Badge className="bg-red-600 text-white px-2 py-1 text-sm">
                          <Percent className="h-3 w-3 mr-1" />
                          {discount.discountPercent}%
                        </Badge>
                      )}
                    </div>
                    {discount.description && (
                      <CardDescription className="text-gray-600">
                        {discount.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Promo Code */}
                    {discount.promoCode && (
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-600 mb-1">Gunakan Kode Promo:</p>
                        <div className="flex items-center justify-center space-x-2">
                          <Tag className="h-4 w-4 text-orange-600" />
                                  <span className="font-mono font-bold text-orange-600 text-lg">
                                    {discount.promoCode}
                                  </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Validity Date */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Berlaku hingga:</span>
                      </div>
                      <span className="font-medium">
                        {new Date(discount.endDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <Link href="/app">
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                        Pesan Sekarang & Dapatkan Diskon
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {discounts.length > 6 && (
              <div className="text-center mt-8">
                <Link href="/app">
                  <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                    Lihat Semua Promo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl font-bold text-gray-900 mb-4"
              data-aos="fade-up"
            >
              Mengapa Memilih Sentul-Laundry?
            </h2>
            <p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Kami memberikan layanan terbaik dengan teknologi modern untuk hasil yang sempurna
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div 
              className="text-center p-6 rounded-lg hover:bg-teal-50 transition-colors"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="bg-teal-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Droplets className="h-10 w-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pencucian Premium</h3>
              <p className="text-gray-600">Deterjen berkualitas tinggi dengan teknologi pencucian modern</p>
            </div>
            
            <div 
              className="text-center p-6 rounded-lg hover:bg-teal-50 transition-colors"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="bg-teal-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Wind className="h-10 w-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pengeringan Sempurna</h3>
              <p className="text-gray-600">Teknologi pengeringan yang menjaga kualitas kain</p>
            </div>
            
            <div 
              className="text-center p-6 rounded-lg hover:bg-teal-50 transition-colors"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="bg-teal-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Truck className="h-10 w-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Antar Jemput Gratis</h3>
              <p className="text-gray-600">Layanan antar jemput gratis untuk area tertentu</p>
            </div>
            
            <div 
              className="text-center p-6 rounded-lg hover:bg-teal-50 transition-colors"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="bg-teal-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-10 w-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Garansi Kepuasan</h3>
              <p className="text-gray-600">Jika tidak puas, kami cuci kembali gratis</p>
            </div>
            
            <div 
              className="text-center p-6 rounded-lg hover:bg-teal-50 transition-colors"
              data-aos="fade-up"
              data-aos-delay="500"
            >
              <div className="bg-teal-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-10 w-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Tepat Waktu</h3>
              <p className="text-gray-600">Pengerjaan tepat waktu sesuai janji kami</p>
            </div>
            
            <div 
              className="text-center p-6 rounded-lg hover:bg-teal-50 transition-colors"
              data-aos="fade-up"
              data-aos-delay="600"
            >
              <div className="bg-teal-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-10 w-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Perawatan Kain</h3>
              <p className="text-gray-600">Menjaga kualitas dan umur pakai pakaian Anda</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl font-bold text-gray-900 mb-4"
              data-aos="fade-up"
            >
              Layanan Kami
            </h2>
            <p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Pilih layanan yang sesuai dengan kebutuhan Anda
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service: any, index) => (
              <Card 
                key={service.id} 
                className="hover:shadow-xl transition-all duration-300 border-teal-100 hover:border-teal-300 hover:-translate-y-1"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <Badge className="bg-teal-100 text-teal-800">Populer</Badge>
                  </div>
                  <CardTitle className="text-teal-700">{service.serviceName}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-teal-600">
                        Rp {service.prices?.[0]?.pricePerKg || service.basePricePerKg}/kg
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{service.estimatedTime}</span>
                    </div>
                  </div>
                  <Link href="/app">
                    <Button className="w-full bg-teal-600 hover:bg-teal-700">
                      Pilih Layanan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/app">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                Lihat Semua Layanan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl font-bold mb-4"
              data-aos="fade-up"
            >
              Dipercaya oleh Ribuan Pelanggan
            </h2>
            <p 
              className="text-xl text-teal-100"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Statistik kami berbicara tentang kualitas layanan
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div 
              className="text-center"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">1000+</div>
              <div className="text-teal-100">Pelanggan Puas</div>
            </div>
            <div 
              className="text-center"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">5000+</div>
              <div className="text-teal-100">Pakaian Dicuci</div>
            </div>
            <div 
              className="text-center"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">99%</div>
              <div className="text-teal-100">Tingkat Kepuasan</div>
            </div>
            <div 
              className="text-center"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-teal-100">Layanan Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div data-aos="fade-right">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Tentang Sentul-Laundry
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Sentul-Laundry adalah solusi laundry modern yang menggabungkan teknologi 
                terkini dengan layanan berkualitas tinggi. Kami berkomitmen untuk 
                memberikan hasil terbaik untuk setiap pelanggan.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Dengan pengalaman lebih dari 5 tahun, kami telah melayani ribuan 
                pelanggan dengan berbagai kebutuhan laundry. Mulai dari cucian 
                harian hingga layanan premium untuk pakaian mahal.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-teal-600" />
                  <span className="text-gray-700">Bergaransi</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-teal-600" />
                  <span className="text-gray-700">Tepat Waktu</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-teal-600" />
                  <span className="text-gray-700">Harga Terjangkau</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-teal-600" />
                  <span className="text-gray-700">Layanan 24/7</span>
                </div>
              </div>
            </div>
            <div data-aos="fade-left">
              <div className="bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-600 mb-2">5+</div>
                    <div className="text-gray-600">Tahun Pengalaman</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-600 mb-2">50+</div>
                    <div className="text-gray-600">Tim Profesional</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-600 mb-2">10+</div>
                    <div className="text-gray-600">Jenis Layanan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-600 mb-2">24</div>
                    <div className="text-gray-600">Jam Operasional</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="text-4xl font-bold mb-4"
            data-aos="fade-up"
          >
            Siap Mencoba Layanan Kami?
          </h2>
          <p 
            className="text-xl mb-8 text-teal-100"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Bergabunglah dengan ribuan pelanggan puas yang telah mempercayakan laundry mereka kepada kami
          </p>
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <Link href="/app">
              <Button 
                size="lg" 
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-8 py-4 text-lg font-semibold"
              >
                Pesan Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/app#track">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-teal-600 px-8 py-4 text-lg font-semibold"
              >
                Lacak Pesanan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl font-bold text-gray-900 mb-4"
              data-aos="fade-up"
            >
              Hubungi Kami
            </h2>
            <p 
              className="text-xl text-gray-600"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Ada pertanyaan? Jangan ragu untuk menghubungi kami
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Phone */}
            {contactInfo.phone && (
              <div 
                className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <div className="bg-teal-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Phone className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Telepon</h3>
                <p className="text-gray-600 font-medium">{contactInfo.phone}</p>
                <p className="text-gray-500 text-sm">Senin - Minggu, 08:00 - 20:00</p>
                <a 
                  href={`tel:${contactInfo.phone}`}
                  className="inline-flex items-center justify-center w-full mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Hubungi Sekarang
                </a>
              </div>
            )}
            
            {/* Email */}
            {contactInfo.contactEmail && (
              <div 
                className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <div className="bg-teal-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Email</h3>
                <p className="text-gray-600 font-medium">{contactInfo.contactEmail}</p>
                <p className="text-gray-500 text-sm">Respon dalam 24 jam</p>
                <a 
                  href={`mailto:${contactInfo.contactEmail}`}
                  className="inline-flex items-center justify-center w-full mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Kirim Email
                </a>
              </div>
            )}
            
            {/* Address */}
            {contactInfo.address && (
              <div 
                className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <div className="bg-teal-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Alamat</h3>
                <p className="text-gray-600 font-medium whitespace-pre-line">{contactInfo.address}</p>
                <p className="text-gray-500 text-sm">Kunjungi kami</p>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(contactInfo.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Buka Maps
                </a>
              </div>
            )}

            {/* Fallback jika belum ada kontak */}
            {!contactInfo.phone && !contactInfo.contactEmail && !contactInfo.address && (
              <div className="col-span-3 text-center py-12">
                <div className="bg-gray-100 rounded-lg p-8">
                  <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Informasi Kontak Segera Hadir</h3>
                  <p className="text-gray-500">Admin sedang menyiapkan informasi kontak yang dapat dihubungi</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-8 w-8 text-teal-400" />
                <span className="text-2xl font-bold">Sentul-Laundry</span>
              </div>
              <p className="text-gray-400">
                Solusi laundry profesional dan modern untuk kebutuhan Anda.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Layanan</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Cuci Regular</li>
                <li>Cuci Express</li>
                <li>Cuci Karpet</li>
                <li>Cuci Sepatu</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-teal-400">Fitur</a></li>
                <li><a href="#services" className="hover:text-teal-400">Layanan</a></li>
                <li><a href="#about" className="hover:text-teal-400">Tentang</a></li>
                <li><a href="#contact" className="hover:text-teal-400">Kontak</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Jam Operasional</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Senin - Jumat: 08:00 - 20:00</li>
                <li>Sabtu: 08:00 - 18:00</li>
                <li>Minggu: 09:00 - 17:00</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Sentul-Laundry. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}