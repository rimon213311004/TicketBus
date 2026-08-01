import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fadeUp, stagger } from '@/animations/variants';
import { cn } from '@/lib/utils';

interface Faq {
  question: string;
  answer: string;
}

interface FaqGroup {
  title: string;
  items: Faq[];
}

const GROUPS: FaqGroup[] = [
  {
    title: 'Booking',
    items: [
      {
        question: 'How many seats can I book at once?',
        answer:
          'Up to 4 seats in a single booking. Each seat needs its own passenger name and gender, which you enter on the passenger details step. To book more, place a second booking.',
      },
      {
        question: 'How long are my seats held while I pay?',
        answer:
          'Selected seats are held for 15 minutes from the moment you pick them. A countdown runs during checkout — if it reaches zero the seats are released back to other passengers and you will need to select them again.',
      },
      {
        question: 'Can I reserve now and pay cash at the counter?',
        answer:
          'Yes. Choose "Cash at Counter" as the payment method and your seats are reserved for up to 6 hours. Cash reservations always expire at least 2 hours before departure, so a late booking gets a shorter window. Pay at the operator counter before that deadline or the seats are released.',
      },
      {
        question: 'What is the service charge?',
        answer:
          'A flat ৳20 per seat is added to the fare. Your payable amount, shown before you pay, is the fare multiplied by the number of seats plus this charge.',
      },
    ],
  },
  {
    title: 'Payment',
    items: [
      {
        question: 'Which payment methods do you accept?',
        answer:
          'bKash, Nagad and Rocket mobile banking, direct bank transfer, and cash at the operator counter.',
      },
      {
        question: 'How does mobile banking payment work?',
        answer:
          'Send the payable amount to the receiver number shown on the payment page, then submit the transaction ID (TrxID) and the number you sent it from. Your booking moves to "Awaiting verification" until our team confirms it.',
      },
      {
        question: 'How long does verification take?',
        answer:
          'Our team reviews submitted payments in the order they arrive and confirms the ticket once the transaction matches. You can watch the status on the My Tickets page — it changes to "Confirmed" as soon as the payment clears.',
      },
      {
        question: 'My payment was rejected. What now?',
        answer:
          'A rejection always comes with a reason, shown on the booking in My Tickets — usually a transaction ID that could not be matched. Your seats are kept while the booking is still active, and you can submit a corrected payment from the same booking.',
      },
      {
        question: 'Can I use the same transaction ID twice?',
        answer:
          'No. Each transaction ID can only be claimed by one booking. Submitting one that has already been used will be rejected.',
      },
    ],
  },
  {
    title: 'Tickets and cancellation',
    items: [
      {
        question: 'Where do I find my ticket?',
        answer:
          'Open My Tickets and download the PDF against your booking. A confirmed booking gives you the e-ticket with its QR code; a booking still awaiting payment gives you a voucher instead.',
      },
      {
        question: 'Do I need to print the ticket?',
        answer:
          'No. Showing the PDF or your booking code on your phone at the counter is enough.',
      },
      {
        question: 'How do I cancel a booking?',
        answer:
          'Open My Tickets and use the Cancel action on the booking. Bookings that are already cancelled or expired cannot be cancelled again. For refunds on a verified payment, contact support with your booking code.',
      },
      {
        question: 'I did not get a confirmation email.',
        answer:
          'Your booking is always available in My Tickets while signed in with the account used to book. Check that the email on your account is correct in Profile, and contact support with your booking code if you still need help.',
      },
    ],
  },
];

export function FaqPage() {
  const [openKey, setOpenKey] = useState<string | null>('0-0');

  return (
    <div className="container max-w-3xl py-10">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="font-display text-2xl font-bold md:text-3xl">Frequently asked questions</h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Booking, payment and ticket questions, answered.
        </p>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="visible" className="mt-9 space-y-9">
        {GROUPS.map((group, groupIndex) => (
          <motion.section key={group.title} variants={fadeUp}>
            <h2 className="font-display text-lg font-bold">{group.title}</h2>

            <div className="mt-3.5 divide-y divide-line overflow-hidden rounded-2xl border border-line dark:divide-line-dark dark:border-line-dark">
              {group.items.map((item, itemIndex) => {
                const key = `${groupIndex}-${itemIndex}`;
                const isOpen = openKey === key;

                return (
                  <div key={item.question} className="bg-white dark:bg-card-dark">
                    <h3>
                      <button
                        type="button"
                        onClick={() => setOpenKey(isOpen ? null : key)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${key}`}
                        id={`faq-trigger-${key}`}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <span className="text-sm font-medium">{item.question}</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200',
                            isOpen && 'rotate-180',
                          )}
                          aria-hidden
                        />
                      </button>
                    </h3>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="panel"
                          id={`faq-panel-${key}`}
                          role="region"
                          aria-labelledby={`faq-trigger-${key}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                            {item.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.section>
        ))}
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="card mt-10 p-8 text-center"
      >
        <LifeBuoy className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
        <h2 className="mt-4 font-display text-lg font-bold">Still stuck?</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Send us your booking code and we will take a look.
        </p>
        <Button className="mt-6" asChild>
          <Link to="/contact">Contact support</Link>
        </Button>
      </motion.div>
    </div>
  );
}
