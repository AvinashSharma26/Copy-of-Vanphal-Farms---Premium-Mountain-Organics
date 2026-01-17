
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LegalContent: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-40 pb-24 bg-[#fcfbf7] min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-5xl font-bold serif mb-12 text-[#2d3a3a]">{title}</h1>
        <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100 text-gray-600 leading-relaxed space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicy: React.FC = () => (
  <LegalContent title="Privacy Policy">
    <p>At Vanphal Farms, we respect your privacy and are committed to protecting your personal data. This privacy policy informs you about how we look after your personal data when you visit our website.</p>
    <h3 className="text-2xl font-bold serif text-[#1a2323]">Data We Collect</h3>
    <p>We may collect, use, store and transfer different kinds of personal data about you including: Identity Data (name, username), Contact Data (email address, telephone number), and Transaction Data (details about payments to and from you).</p>
    <h3 className="text-2xl font-bold serif text-[#1a2323]">How We Use Data</h3>
    <p>We only use your personal data to process orders, manage your account, and if you agree, to email you about other products and services we think may be of interest to you.</p>
  </LegalContent>
);

export const TermsConditions: React.FC = () => (
  <LegalContent title="Terms & Conditions">
    <p>Welcome to Vanphal Farms. By accessing this website, you agree to comply with and be bound by the following terms and conditions of use.</p>
    <h3 className="text-2xl font-bold serif text-[#1a2323]">Product Usage</h3>
    <p>All our products are organic and handcrafted. Natural variations in color and texture are normal and expected. We guarantee the purity of our ingredients.</p>
    <h3 className="text-2xl font-bold serif text-[#1a2323]">Ordering & Payments</h3>
    <p>Orders are subject to availability. We reserve the right to cancel orders if production is limited by seasonal constraints. Payments are processed securely via our trusted gateways.</p>
  </LegalContent>
);

export const ShippingRefund: React.FC = () => (
  <LegalContent title="Shipping & Refund Policy">
    <h3 className="text-2xl font-bold serif text-[#1a2323]">Himalayan Shipping</h3>
    <p>We ship our preserves directly from Himachal. Standard delivery across India takes 3-5 business days. Due to the artisanal nature of our products, some batches may have lead times depending on harvest schedules.</p>
    <h3 className="text-2xl font-bold serif text-[#1a2323]">Returns & Refunds</h3>
    <p>If you receive a damaged jar, please contact our support team immediately via a ticket. We will offer a full refund or a fresh replacement batch at no extra cost. Since our products are food items, we cannot accept returns once the vacuum seal is broken unless there is a quality defect.</p>
  </LegalContent>
);
