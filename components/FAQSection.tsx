
import React from 'react';

const FAQ_DATA = [
  {
    question: "What makes Vanphal Farms jams unique?",
    answer: "Our jams are handcrafted in small batches using traditional wood-fired methods. We source high-altitude mountain fruits which have a more concentrated and intense flavor than commercial varieties."
  },
  {
    question: "Are your products 100% natural and preservative-free?",
    answer: "Yes, absolutely! We don't use any artificial preservatives, colors, or flavors. We rely on the natural acidity of the fruits and minimal organic cane sugar to preserve our batches."
  },
  {
    question: "Where exactly are the fruits sourced from?",
    answer: "All our fruits are harvested from local orchards in the Himalayan foothills of Nainital and surrounding regions in Uttarakhand, situated at altitudes of 6,000 to 8,000 feet."
  },
  {
    question: "Do you ship across India?",
    answer: "Yes, we ship to all major cities and towns across India. Delivery usually takes 3-5 business days depending on your location."
  },
  {
    question: "How should I store the jams once they are opened?",
    answer: "Since our products are preservative-free, we recommend refrigerating them immediately after opening and using a clean, dry spoon for every serve. They stay fresh for up to 3 months once opened."
  },
  {
    question: "Can I place a bulk order for weddings or corporate gifts?",
    answer: "Certainly! We specialize in custom gifting. Please submit a support ticket via our Contact page with your requirements, and our team will get back to you with bulk pricing."
  }
];

export const FAQSection: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-[#8b5e3c] text-xs font-bold uppercase tracking-[0.2em] mb-4 block">Common Queries</span>
          <h2 className="text-4xl font-bold serif">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {FAQ_DATA.map((item, index) => (
            <details 
              key={index} 
              className="group bg-[#fcfbf7] rounded-3xl border border-gray-100 p-6 md:p-8 cursor-pointer transition-all hover:shadow-md"
            >
              <summary className="list-none flex justify-between items-center font-bold text-lg md:text-xl text-[#2d3a3a]">
                <span className="pr-6">{item.question}</span>
                <span className="text-[#4a5d4e] transition-transform duration-300 group-open:rotate-45">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </span>
              </summary>
              <div className="mt-6 text-gray-500 leading-relaxed text-sm md:text-base border-t border-gray-200 pt-6">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};
