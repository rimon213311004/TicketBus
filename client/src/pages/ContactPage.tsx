import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { stagger, fadeUp } from '@/animations/variants';
import { Button } from '@/components/ui/Button';

const CONTACT_METHODS = [
  {
    icon: Phone,
    label: 'Phone',
    value: '01875895858',
    href: 'tel:01875895858',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'support@ticketbus.com',
    href: 'mailto:support@ticketbus.com',
  },
  {
    icon: MapPin,
    label: 'Address',
    value: 'Dhaka, Bangladesh',
    href: '#',
  },
  {
    icon: Clock,
    label: 'Business hours',
    value: 'Sun – Thu: 9 AM – 10 PM',
    href: '#',
  },
];

export function ContactPage() {
  return (
    <div className="py-16">
      <section className="container">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-2xl text-center"
        >
          <motion.h1 variants={fadeUp} className="font-display text-3xl font-extrabold md:text-5xl">
            Get in touch
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-5 text-lg text-slate-600 dark:text-slate-400">
            Have a question, a bug to report, or need help with your booking? We are here to help —
            reach out via any of the channels below or fill in the form and we will get back to you
            within 24 hours.
          </motion.p>
        </motion.div>
      </section>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="container mt-12"
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <motion.div variants={fadeUp} className="space-y-6">
            {CONTACT_METHODS.map((method) => (
              <div
                key={method.label}
                className="card flex items-start gap-4 p-5 transition hover:border-brand-300"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/25 dark:text-brand-300">
                  <method.icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{method.label}</h3>
                  {method.href === '#' ? (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{method.value}</p>
                  ) : (
                    <a
                      href={method.href}
                      className="mt-1 block text-sm text-brand-600 hover:underline"
                    >
                      {method.value}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </motion.div>

          <motion.form
            variants={fadeUp}
            className="card space-y-5 p-6 md:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="label">
                  Name
                </label>
                <input id="name" type="text" placeholder="Your name" className="input" />
              </div>
              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input id="email" type="email" placeholder="you@example.com" className="input" />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="label">
                Subject
              </label>
              <input id="subject" type="text" placeholder="What is this about?" className="input" />
            </div>

            <div>
              <label htmlFor="message" className="label">
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="How can we help you?"
                className="input resize-y"
              />
            </div>

            <Button full size="lg">
              <Send className="h-4 w-4" aria-hidden />
              Send message
            </Button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
