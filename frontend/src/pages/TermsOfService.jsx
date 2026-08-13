import React from 'react';
import { Link } from 'react-router-dom';
import { Fuel, ArrowLeft, Shield, FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Fuel className="text-emerald-400 group-hover:scale-110 transition-transform" size={24} />
            <span className="text-xl font-bold text-white">
              Fuel<span className="text-emerald-400">Share</span>
            </span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors font-medium"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-6">
            <FileText className="text-emerald-400" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Terms of <span className="text-emerald-400">Service</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Please read these terms carefully before using the FuelShare platform.
          </p>
          <p className="text-slate-500 text-sm mt-3">Last updated: August 2026</p>
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto px-6 pb-20 max-w-4xl">
        <div className="space-y-8">
          {[
            {
              title: '1. Acceptance of Terms',
              content: `By accessing or using FuelShare ("the Platform"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform. FuelShare is an academic campus-exclusive carpooling service designed to connect university students for shared commutes.`,
            },
            {
              title: '2. Eligibility & University Verification',
              content: `FuelShare is exclusively available to students, faculty, and staff of verified partner universities. To use the platform, you must have a valid university email address. Your account will be verified via a One-Time Password (OTP) sent to your university email. You must be at least 18 years of age. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.`,
            },
            {
              title: '3. Ride Sharing & Driver Responsibilities',
              content: `Drivers listing rides on FuelShare must hold a valid driving license and maintain adequate vehicle insurance as required by local law. Drivers are responsible for the safety and roadworthiness of their vehicle. FuelShare does not provide transportation services directly — it is a peer-to-peer matching platform. The platform is not liable for accidents, delays, or disputes arising from rides arranged through the platform. Drivers must accurately represent their vehicle, available seats, and route details.`,
            },
            {
              title: '4. Passenger Responsibilities',
              content: `Passengers are expected to be ready at the agreed pickup point on time. Passengers must treat the driver's vehicle with respect and not engage in behavior that endangers safety. Fraudulent seat requests or repeated no-shows may result in account suspension. Cost splitting is calculated automatically based on real-time fuel prices, distance, and seat capacity — passengers agree to the displayed cost before confirming a booking.`,
            },
            {
              title: '5. Fuel Cost Calculation',
              content: `The FuelShare cost calculator uses live city petrol rates fetched from publicly available sources, combined with route distance (estimated via mapping APIs) and vehicle mileage provided by the driver. The formula used is: Cost per Seat = (Distance ÷ Mileage) × Live Fuel Price ÷ Total Seats. These are estimates and actual fuel costs may vary. FuelShare does not handle or process payments — all financial transactions are solely between drivers and passengers.`,
            },
            {
              title: '6. User Conduct',
              content: `Users must not use FuelShare for any unlawful purpose or in a way that could harm other users or the platform. Harassment, discrimination, hate speech, or abusive behavior towards other users is strictly prohibited and will result in immediate account termination. Users must not misrepresent themselves, their vehicles, or their intended routes. Spam, commercial solicitations, or non-carpooling activity through the platform is not permitted.`,
            },
            {
              title: '7. Privacy & Data',
              content: `FuelShare collects and processes personal data as described in our Privacy Policy. By using the platform, you consent to such processing. Location data is used solely for ride matching and route display purposes and is not shared with third parties for commercial use. OTP-based authentication data is stored temporarily and purged after verification. Your messaging history within the platform is retained for dispute resolution purposes.`,
            },
            {
              title: '8. Disclaimer of Warranties',
              content: `FuelShare is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not guarantee that the platform will be uninterrupted, error-free, or free from viruses. Live fuel price data is sourced from third-party scrapers and may occasionally be inaccurate or delayed.`,
            },
            {
              title: '9. Limitation of Liability',
              content: `In no event shall FuelShare, its operators, or contributors be liable for any indirect, incidental, special, exemplary, or consequential damages (including, but not limited to, loss of data, personal injury, or road accidents) arising out of or in connection with your use of the platform. Your use of FuelShare is entirely at your own risk.`,
            },
            {
              title: '10. Modifications to Terms',
              content: `FuelShare reserves the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the platform. Your continued use of FuelShare after any changes constitutes your acceptance of the new terms. We encourage you to review these terms periodically.`,
            },
            {
              title: '11. Contact',
              content: `If you have any questions about these Terms of Service, please reach out to us through the Support page or contact your university's designated FuelShare coordinator.`,
            },
          ].map((section, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 hover:border-emerald-500/30 transition-colors"
            >
              <h2 className="text-lg font-bold text-emerald-400 mb-3">{section.title}</h2>
              <p className="text-slate-300 leading-relaxed text-sm md:text-base">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-slate-500 text-sm">
            <Shield size={14} />
            <span>FuelShare Academic Collective · Campus Ride Pooling Platform</span>
          </div>
        </div>
      </main>
    </div>
  );
}
