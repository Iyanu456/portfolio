import './globals.css'
import Header from './components/Header'
import { MailOpen, Phone } from 'lucide-react';
import Link from 'next/link';



export const metadata = {
  title: 'Iyanu | Software Developer Portfolio',
  description: 'Full-stack Software Engineer Portfolio Website',
  image: './assets/profile.jpg'
}

const currentYear = new Date().getFullYear();

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body>
        <Header />  
        {children}
        <footer className="text-center text-[0.95em] mb-[5em] px-[2em] ">
        <div className="mt-[4.1em] mb-[4em] flex flex-col gap-4 sm:pl-[0em] md:pl-[14em]">
          <Link href="tel:+2349122420200" className="flex gap-3">
            <Phone className="w-[fit-content] my-auto " /> +234 912 242 0200
          </Link>
          <Link
            href="mailto:oyerindei13@gmail.com"
            className="flex gap-3 tracking-[0.2em]"
          >
            <MailOpen className="w-[fit-content] my-auto" />{" "}
            oyerindei13@gmail.com
          </Link>
        </div>
        <p>Copyright © {currentYear} All rights reserved | Iyanuoluwa Oyerinde</p>
      </footer>
      </body>
    </html>
  )
}
