"use client";

import React from "react";
import { motion } from "motion/react";
import { Shield, Lock, FileText, Database } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      icon: Shield,
      title: "Information Collection",
      content: "We collect information you provide directly to us, such as when you create an account, update your profile, use the interactive features of our services, or communicate with us. This may include your name, email address, password, profile picture, and cooking preferences.",
    },
    {
      icon: Lock,
      title: "Data Security",
      content: "We implement appropriate technical and organizational measures to maintain the safety of your personal information. However, no security system is impenetrable, and we cannot guarantee the security of our systems 100%.",
    },
    {
      icon: Database,
      title: "Data Usage",
      content: "We use the information we collect to provide, maintain, and improve our services. This includes personalizing your experience, recommending recipes, processing transactions, and sending you technical notices or promotional updates.",
    },
    {
      icon: FileText,
      title: "Information Sharing",
      content: "We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-2xl mb-6">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              Privacy <span className="text-gradient-primary">Policy</span>
            </h1>
            <p className="text-lg text-default-500">
              Last updated: July 19, 2026
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-content1 border border-divider rounded-3xl p-8 md:p-12 shadow-sm mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <p className="text-lg text-default-600 leading-relaxed mb-8">
              At Flavor Matrix, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>

            <div className="grid sm:grid-cols-2 gap-8 mb-12">
              {sections.map((section, idx) => (
                <div key={idx} className="bg-default-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-default-200 dark:border-zinc-800/80">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-background rounded-lg shadow-sm border border-divider text-primary">
                      <section.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground m-0">{section.title}</h3>
                  </div>
                  <p className="text-sm text-default-500 m-0 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-4">Your Rights</h3>
            <p className="text-default-600 leading-relaxed mb-6">
              Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your data. To exercise these rights, please contact us using the information provided below.
            </p>

            <h3 className="text-2xl font-bold text-foreground mb-4">Changes to This Policy</h3>
            <p className="text-default-600 leading-relaxed mb-8">
              We may update this privacy policy from time to time in order to reflect changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new policy on this page.
            </p>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mt-8">
              <h4 className="text-lg font-bold text-foreground mb-2">Questions or Concerns?</h4>
              <p className="text-default-600 mb-0">
                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@flavormatrix.com" className="text-primary hover:underline font-medium">privacy@flavormatrix.com</a>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
