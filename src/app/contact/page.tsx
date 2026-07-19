"use client";

import React from "react";
import { motion } from "motion/react";
import { Button } from "@heroui/react";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function ContactPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 flex flex-col items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              Get in <span className="text-gradient-primary">Touch</span>
            </h1>
            <p className="text-lg text-default-500 max-w-2xl mx-auto">
              Have questions, feedback, or just want to say hi? We'd love to hear from you. Drop us a message below and we'll get back to you as soon as possible.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Contact Information */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 flex flex-col gap-8"
          >
            <motion.div variants={itemVariants} className="bg-content1 border border-divider rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-6">Contact Information</h3>
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl mt-1">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Email</h4>
                    <p className="text-default-500">support@flavormatrix.com</p>
                    <p className="text-default-500">hello@flavormatrix.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl mt-1">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Office</h4>
                    <p className="text-default-500">123 Culinary Boulevard</p>
                    <p className="text-default-500">San Francisco, CA 94103</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl mt-1">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Phone</h4>
                    <p className="text-default-500">+1 (555) 123-4567</p>
                    <p className="text-sm text-default-400 mt-1">Mon-Fri from 8am to 5pm</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3 bg-content1 border border-divider rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            
            <h3 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h3>
            
            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">First Name</label>
                  <input 
                    type="text"
                    placeholder="John" 
                    className="w-full bg-default-100 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-foreground placeholder:text-default-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Last Name</label>
                  <input 
                    type="text"
                    placeholder="Doe" 
                    className="w-full bg-default-100 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-foreground placeholder:text-default-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <input 
                  type="email" 
                  placeholder="john@example.com" 
                  className="w-full bg-default-100 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-foreground placeholder:text-default-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Subject</label>
                <input 
                  type="text"
                  placeholder="How can we help?" 
                  className="w-full bg-default-100 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-foreground placeholder:text-default-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Message</label>
                <textarea 
                  placeholder="Type your message here..." 
                  rows={5}
                  className="w-full bg-default-100 dark:bg-zinc-900 border border-default-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-foreground placeholder:text-default-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                ></textarea>
              </div>
              <Button 
                size="lg" 
                className="w-full bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
              >
                Send Message
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
